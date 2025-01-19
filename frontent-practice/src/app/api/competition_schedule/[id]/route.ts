import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

// ✅ 幫助函數：讀取比賽資料
async function fetchCompetitionData(connection, tournament_id, division, event_type) {
  const [matches] = await connection.execute(
    `SELECT 
       m.match_id,
       p1.name AS participantA,
       p2.name AS participantB,
       j.name AS judgeName,
       m.status,
       m.session_id,
       m.venue_id,
       v.venue AS venue_name, 
       vt.table_id,
       vt.table_number
     FROM Matches m
     LEFT JOIN Tournament_Participants p1 ON m.player1_id = p1.register_id
     LEFT JOIN Tournament_Participants p2 ON m.player2_id = p2.register_id
     LEFT JOIN Tournament_Participants j ON m.judge_id = j.register_id
     LEFT JOIN Venues v ON m.venue_id = v.venue_id
     LEFT JOIN Venue_Tables vt ON m.table_id = vt.table_id
     WHERE m.tournament_id = ? AND m.division = ? AND m.event_type = ?`,
    [tournament_id, division, event_type]
  );

  // ✅ 場次資料
  const [sessions] = await connection.execute(
    `SELECT ts.tournament_session_id, ts.competition_date, ts.session_id, s.session_time
     FROM Tournament_Sessions ts
     LEFT JOIN Sessions s ON ts.session_id = s.session_id
     WHERE ts.tournament_id = ?`,
    [tournament_id]
  );

  // ✅ 場地資料
  const [venues] = await connection.execute(
    `SELECT v.venue_id, v.venue
     FROM Venues v
     WHERE v.tournament_id = ?`,
    [tournament_id]
  );

  // ✅ 桌號資料
  const [tables] = await connection.execute(
    `SELECT vt.venue_id, vt.table_id, vt.table_number
     FROM Venue_Tables vt
     WHERE vt.venue_id IN (
       SELECT DISTINCT m.venue_id
       FROM Venues m
       WHERE m.tournament_id = ?
     )`,
    [tournament_id]
  );
  

  const firstMatchId = matches[0]?.match_id || 0;

  return {
    matches: matches.map((match) => {
      const session = sessions.find((s) => s.tournament_session_id === match.session_id);
      const venuee = venues.find((v) => v.venue_id === match.venue_id);
      const table = tables.find((t) => t.table_id === match.table_id);

      return {
        match_id: match.match_id,
        matchNumber: match.match_id - firstMatchId + 1,
        participantA: match.participantA,
        participantB: match.participantB || "",
        judge: match.judgeName || "",
        status: match.status,
        date: session ? session.competition_date : "",
        session_time: session ? session.session_time : "",
        venue: venuee ? venuee.venue : "",    // 直接使用關聯查詢得到的場地名稱
        table: table ? table.table_number : "",
      };
    }),
    info: {
      competitionDates: Array.isArray(sessions) ? [...new Set(sessions.map(s => new Date(s.competition_date).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })))] : [],
      sessionTimes: Array.isArray(sessions) ? [...new Set(sessions.map((s) => s.session_time))] : [],
      venues: Array.isArray(venues) ? [...new Set(venues.map((v) => v.venue))] : [],  // ✅ 確保是陣列
      tables: Array.isArray(tables) ? [...new Set(tables.map((t) => t.table_number))] : [],  // ✅ 確保是陣列
    }
  };
}

export async function POST(req) {
  try {
    const { tournament_id, division, event_type } = await req.json();

    if (!tournament_id || !division || !event_type) {
      throw new Error("缺少必要參數");
    }

    console.log("Query Parameters:", { tournament_id, division, event_type });

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    const [existingMatches] = await connection.execute(
      `SELECT * FROM Matches WHERE tournament_id = ? AND division = ? AND event_type = ?`,
      [tournament_id, division, event_type]
    );

    if (existingMatches.length > 0) {
      console.log("⚠️ 比賽已排程，回傳現有賽程");
      const competitionData = await fetchCompetitionData(connection, tournament_id, division, event_type);
      // console.log("📅 比賽資料：", competitionData);
      await connection.end();
      return NextResponse.json({
        message: "比賽已排程",
        scheduled: true,
        data: competitionData,
      }, { status: 200 });
    }

    const [participants] = await connection.execute(
      `SELECT register_id, name
       FROM Tournament_Participants
       WHERE tournament_id = ? AND event_type = ? AND division = ?`,
      [tournament_id, event_type, division]
    );

    if (participants.length < 2) {
      throw new Error("參賽者不足以安排比賽");
    }

    const shuffledParticipants = participants.sort(() => Math.random() - 0.5);

    if (shuffledParticipants.length % 2 !== 0) {
      shuffledParticipants.push({ register_id: null, name: "輪空" });
    }

    const totalMatches = shuffledParticipants.length / 2;

    const [judges] = await connection.execute(
      `SELECT register_id AS judge_id, name
       FROM Tournament_Participants
       WHERE tournament_id = ? AND division = '裁判組'`,
      [tournament_id]
    );

    if (judges.length === 0) {
      throw new Error("無可用裁判");
    }

    const [sessions] = await connection.execute(
      `SELECT tournament_session_id, competition_date, session_id
       FROM Tournament_Sessions
       WHERE tournament_id = ?`,
      [tournament_id]
    );

    if (sessions.length === 0) {
      throw new Error("無可用日期和場次");
    }

    // ✅ 查詢場地和對應桌號
    const [venues] = await connection.execute(
      `SELECT v.venue_id, v.venue, vt.table_id, vt.table_number
      FROM Venues v
      JOIN Venue_Tables vt ON v.venue_id = vt.venue_id
      WHERE v.tournament_id = ?`,
      [tournament_id]
    );

    if (venues.length === 0) {
      throw new Error("無可用場地與桌號");
    }

    // ✅ 查詢桌號資料
    const [tables] = await connection.execute(
      `SELECT table_id, venue_id, table_number
      FROM Venue_Tables`
    );

    const matchPromises = [];

    // ✅ 先處理正常比賽（非輪空）
    for (let i = 0; i < totalMatches; i++) {
      const player1 = shuffledParticipants[i];
      const player2 = shuffledParticipants[shuffledParticipants.length - 1 - i];
      const isBye = !player2.register_id;
    
      // ✅ 跳過輪空，稍後處理
      if (isBye) continue;
    
      const judge = judges[i % judges.length];
    
      let session = null;
      let venue = null;
      let table = null;
    
      let found = false;
    
      // ✅ 動態尋找不重複的 session 和 table 組合
      for (let s = 0; s < sessions.length && !found; s++) {
        session = sessions[s];
    
        for (let v = 0; v < venues.length && !found; v++) {
          venue = venues[v];
    
          for (let t = 0; t < tables.length; t++) {
            table = tables[t];
    
            // ✅ 檢查是否已存在相同的 table_id 和 session_id
            const [existingMatch] = await connection.execute(
              `SELECT match_id FROM Matches WHERE table_id = ? AND session_id = ?`,
              [table.table_id, session.tournament_session_id]
            );
    
            if (existingMatch.length === 0) {
              found = true;  // ✅ 找到可用的組合
              break;
            }
          }
        }
      }
    
      if (!found) {
        console.warn(`⚠️ 無法為比賽分配可用的桌號和場次，請檢查場地或場次是否足夠。`);
        continue;
      }
    
      console.log("安排正常比賽：", { player1, player2, judge, session, venue, table });
    
      matchPromises.push(
        connection.execute(
          `INSERT INTO Matches (
             tournament_id, division, event_type, player1_id, player2_id, judge_id, table_id, venue_id, session_id, status
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tournament_id,
            division,
            event_type,
            player1.register_id,
            player2.register_id,
            judge?.judge_id || null,
            table ? table.table_id : null,
            venue ? venue.venue_id : null,
            session ? session.tournament_session_id : null,
            "未開始"
          ]
        )
      );
    }
    
    // ✅ 最後處理輪空比賽
    for (let i = 0; i < totalMatches; i++) {
      const player1 = shuffledParticipants[i];
      const player2 = shuffledParticipants[shuffledParticipants.length - 1 - i];
      const isBye = !player2.register_id;
    
      if (!isBye) continue;  // ✅ 只處理輪空比賽
    
      console.log("安排輪空比賽：", { player1, player2, isBye });
    
      matchPromises.push(
        connection.execute(
          `INSERT INTO Matches (
             tournament_id, division, event_type, player1_id, player2_id, judge_id, table_id, venue_id, session_id, status
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tournament_id,
            division,
            event_type,
            player1.register_id,
            null,    // ✅ 輪空比賽不需要對手
            null,    // ✅ 輪空比賽不分配裁判
            null,    // ✅ 輪空比賽不分配桌號
            null,    // ✅ 輪空比賽不分配場地
            null,    // ✅ 輪空比賽不分配場次
            "輪空"   // ✅ 狀態設為「輪空」
          ]
        )
      );
    }
    
    // ✅ 等待所有比賽插入完成
    await Promise.all(matchPromises);

    const competitionData = await fetchCompetitionData(connection, tournament_id, division, event_type);
    // console.log("📅 比賽資料：", competitionData);

    await connection.end();

    return NextResponse.json({
      message: "比賽排程完成",
      scheduled: false,
      data: competitionData,
    }, { status: 200 });

  } catch (error) {
    console.error("Error:", error.message);
    return NextResponse.json({ error: error.message || "Database query failed" }, { status: 500 });
  }
}
