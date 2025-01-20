import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

// ✅ 賽程檢查與回傳（包含發布狀態）
export async function POST(req: Request) {
  try {
    const { tournament_id, division, event_type } = await req.json();

    // ✅ 參數檢查
    if (!tournament_id || !division || !event_type) {
      throw new Error("缺少必要參數");
    }

    console.log("檢查參數:", { tournament_id, division, event_type });

    // ✅ 建立資料庫連線
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // ✅ 檢查是否已發布
    const [publishCheck] = await connection.execute(
      `SELECT is_published
       FROM Matches
       WHERE tournament_id = ? AND division = ? AND event_type = ?
       LIMIT 1`,
      [tournament_id, division, event_type]
    );

    const isPublished = publishCheck.length > 0 ? publishCheck[0].is_published === 1 : false;

    // ✅ 檢查參賽者是否足夠
    const [participants] = await connection.execute(
      `SELECT register_id, name
       FROM Tournament_Participants
       WHERE tournament_id = ? AND event_type = ? AND division = ?`,
      [tournament_id, event_type, division]
    );

    if (participants.length < 2) {
      await connection.end();
      throw new Error("參賽者不足以安排比賽");
    }

    // ✅ 檢查裁判是否存在
    const [judges] = await connection.execute(
      `SELECT register_id AS judge_id, name
       FROM Tournament_Participants
       WHERE tournament_id = ? AND division = '裁判組'`,
      [tournament_id]
    );

    if (judges.length === 0) {
      await connection.end();
      throw new Error("無可用裁判");
    }

    // ✅ 檢查是否有可用的日期和場次
    const [sessions] = await connection.execute(
      `SELECT tournament_session_id, competition_date, session_id
       FROM Tournament_Sessions
       WHERE tournament_id = ?`,
      [tournament_id]
    );

    if (sessions.length === 0) {
      await connection.end();
      throw new Error("無可用日期和場次");
    }

    // ✅ 檢查是否有可用的場地與桌號
    const [venues] = await connection.execute(
      `SELECT table_id, venue_id, table_number
       FROM Venue_Tables`
    );

    if (venues.length === 0) {
      await connection.end();
      throw new Error("無可用場地與桌號");
    }

    // ✅ 關閉資料庫連線
    await connection.end();

    // ✅ 回傳檢查通過 + 是否已發布狀態
    return NextResponse.json(
      {
        message: "檢查通過，可以安排比賽",
        isPublished, // ✅ 加入已發布狀態
        availableSessions: sessions,
        availableVenues: venues,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ 錯誤:", error.message);
    return NextResponse.json(
      { error: error.message || "資料庫查詢失敗" },
      { status: 500 }
    );
  }
}
