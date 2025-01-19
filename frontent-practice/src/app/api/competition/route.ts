import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(req) {
  try {
    // 假設 user_id 來自於請求的查詢參數或其他驗證機制
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing user_id" },
        { status: 400 }
      );
    }

    // Connect to MySQL using environment variables
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // 查詢比賽資料
    const [tournamentRows] = await connection.execute(
      `SELECT 
        tournament_id, 
        name, 
        location, 
        start_date, 
        end_date, 
        status 
      FROM Tournaments`
    );

    // 查詢使用者是否是 organizer
    const [userRows] = await connection.execute(
      `SELECT is_organizer FROM Users WHERE user_id = ?`,
      [userId]
    );

    // 關閉資料庫連線
    await connection.end();

    // 檢查是否找到使用者
    if (userRows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const isOrganizer = userRows[0].is_organizer === 1;

    // 返回比賽資料和使用者權限
    return NextResponse.json(
      {
        competition: tournamentRows,
        user: {
          user_id: userId,
          is_organizer: isOrganizer,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
