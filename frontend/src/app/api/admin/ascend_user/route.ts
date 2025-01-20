import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session || session.user.name !== "Admin") {
      return NextResponse.json({ success: false, message: "無權限操作" }, { status: 403 });
    }

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    const [result] = await connection.execute(
      "UPDATE Users SET is_organizer = 1 WHERE user_id = ?",
      [user_id]
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ success: false, message: "更新失敗" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "使用者已升級為主辦方" });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}
