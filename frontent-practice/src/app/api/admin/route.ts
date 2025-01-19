import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    // ✅ 連線到資料庫
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // ✅ 從 Users 表中取得所有使用者資料
    const [rows] = await connection.execute(
        "SELECT user_id, name, email, is_organizer, is_applying FROM Users"
      );

    await connection.end();

    return NextResponse.json({
      success: true,
      users: rows,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "無法取得使用者資料" },
      { status: 500 }
    );
  }
}
