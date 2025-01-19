import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 確認傳入的比賽 ID 是否有效
    const tournamentId = params.id;

    if (!tournamentId) {
      return NextResponse.json(
        { error: "Invalid tournament ID" },
        { status: 400 }
      );
    }

    // 建立 MySQL 連線
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // 執行查詢
    const [rows] = await connection.execute(
      "SELECT * FROM Tournaments WHERE tournament_id = ?",
      [tournamentId]
    );

    // 關閉連線
    await connection.end();

    // 如果找不到比賽，回傳 404 錯誤
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // 回傳比賽資料
    return NextResponse.json({ tournament: rows[0] });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}