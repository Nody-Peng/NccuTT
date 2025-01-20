import { NextResponse } from "next/server";
import { createConnection } from "mysql2/promise";
import bcrypt from "bcrypt";

// 從環境變數中讀取資料庫配置
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT),
};

export async function POST(request: Request) {
  const { token, newPassword } = await request.json();

  if (!token || !newPassword) {
    return NextResponse.json(
      { error: "請提供完整的重設密碼資料" },
      { status: 400 }
    );
  }

  try {
    const connection = await createConnection(dbConfig);

    // 驗證 token 是否有效
    const [rows] = await connection.execute(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()",
      [token]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "驗證令牌無效或已過期" },
        { status: 400 }
      );
    }

    const email = rows[0].email;

    // 更新用戶密碼
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connection.execute("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    // 刪除已使用的 token
    await connection.execute(
      "DELETE FROM password_reset_tokens WHERE token = ?",
      [token]
    );

    await connection.end();
    return NextResponse.json({ message: "密碼重設成功" }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "伺服器發生錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}
