import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  let connection;

  try {
    const { id } = params;  // 從 URL 取得 tournament_id
    const { division, event_type } = await req.json();  // 從 body 取得 division 和 event_type

    // ✅ 檢查參數是否齊全
    if (!id || !division || !event_type) {
      throw new Error("缺少必要參數：tournament_id、division 或 event_type");
    }

    // ✅ 建立資料庫連線
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // ✅ 更新特定 division 和 event_type 的比賽資料
    const [updateResult] = await connection.execute(
      `UPDATE Matches 
       SET is_published = 1 
       WHERE tournament_id = ? AND division = ? AND event_type = ?`,
      [id, division, event_type]
    );

    if (updateResult.affectedRows === 0) {
      throw new Error("找不到符合條件的比賽資料");
    }

    // ✅ 查詢更新後的比賽資料（包含比賽日期與場次時間）
    const [matches] = await connection.execute(
      `SELECT 
         m.match_id,
         m.tournament_id,
         m.division,
         m.event_type,
         p1.name AS participantA,
         p2.name AS participantB,
         j.name AS judge,
         m.table_id,
         m.venue_id,
         ts.competition_date,
         s.session_time,
         m.is_published,
         m.status,
         m.score
       FROM Matches m
       LEFT JOIN tournament_participants p1 ON m.player1_id = p1.register_id
       LEFT JOIN tournament_participants p2 ON m.player2_id = p2.register_id
       LEFT JOIN tournament_participants j ON m.judge_id = j.register_id
       LEFT JOIN tournament_sessions ts ON m.session_id = ts.tournament_session_id
       LEFT JOIN sessions s ON ts.session_id = s.session_id
       WHERE m.tournament_id = ? AND m.division = ? AND m.event_type = ?`,
      [id, division, event_type]
    );

    console.log("查詢結果：", matches);

    await connection.end();

    return NextResponse.json(
      { message: "賽程已成功發布", matches },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error.message);
    if (connection) await connection.end();
    return NextResponse.json(
      { error: error.message || "發布失敗" },
      { status: 500 }
    );
  }
}
