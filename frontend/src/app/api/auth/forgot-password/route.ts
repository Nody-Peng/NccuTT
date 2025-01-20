import { NextResponse } from "next/server";
import { createConnection } from "mysql2/promise";
import crypto from "crypto";
import nodemailer from "nodemailer";

// 從環境變數中讀取資料庫配置
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT),
};

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "請提供電子郵件地址" }, { status: 400 });
  }

  try {
    const connection = await createConnection(dbConfig);

    // 檢查用戶是否存在
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "該電子郵件地址未註冊" },
        { status: 404 }
      );
    }

    // 生成重設密碼的 token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 小時有效期

    // 儲存 token 到資料庫（假設有一個 password_reset_tokens 表）
    await connection.execute(
      "INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)",
      [email, token, expiresAt]
    );

    // 發送驗證郵件
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "重設密碼驗證信",
      text: `請點擊以下連結重設您的密碼：\n\n${resetLink}`,
    });

    await connection.end();
    return NextResponse.json({ message: "驗證信已發送" }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "伺服器發生錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}
