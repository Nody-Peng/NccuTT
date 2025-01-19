import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

// ✅ 處理 POST 註冊請求
export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // ✅ 驗證輸入
    if (!name || !email || !password) {
      return NextResponse.json({ error: "所有欄位皆為必填！" }, { status: 400 });
    }

    // ✅ 密碼加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 連接 MySQL
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // ✅ 檢查是否已存在該用戶
    const [existingUser] = await connection.execute(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );

    if ((existingUser as any[]).length > 0) {
      await connection.end();
      return NextResponse.json({ error: "該電子郵件已被註冊。" }, { status: 409 });
    }

    // ✅ 插入新使用者資料
    await connection.execute(
      `INSERT INTO Users (
        user_id, name, email, password, profile_picture, is_organizer, google_id, provider, created_at, last_login
      ) VALUES (
        UUID(), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
      )`,
      [
        name,                                   // 使用者名稱
        email,                                  // 電子郵件
        hashedPassword,                         // 加密後密碼
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", // 預設頭貼
        0,                                      // is_organizer 預設為 0
        null,                                   // google_id 為 NULL（手動註冊）
        "credentials"                           // provider 設為 credentials
      ]
    );

    await connection.end();

    return NextResponse.json({ message: "註冊成功！" }, { status: 201 });
  } catch (error) {
    console.error("註冊錯誤:", error);
    return NextResponse.json({ error: "伺服器錯誤，請稍後再試。" }, { status: 500 });
  }
}
