import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "請填寫完整的電子郵件和密碼" },
        { status: 400 }
      );
    }

    // ✅ 連接 MySQL 資料庫
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // ✅ 查詢使用者
    const [rows] = await connection.execute(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );

    if ((rows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ error: "該電子郵件尚未註冊" }, { status: 404 });
    }

    const user = (rows as any)[0];

    // ✅ 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await connection.end();
      return NextResponse.json({ error: "密碼錯誤" }, { status: 401 });
    }

    // ✅ 更新最後登入時間 (last_login)
    await connection.execute(
      "UPDATE Users SET last_login = NOW() WHERE user_id = ?",
      [user.user_id]
    );

    await connection.end();

    // ✅ 建立與 Google OAuth 相同的 JWT
    const token = sign(
      {
        sub: user.user_id,   // ✅ 與 NextAuth 結構一致
        name: user.name,
        email: user.email,
        picture: user.profile_picture,
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    );

    // ✅ 寫入 Cookie（與 NextAuth 相同）
    const cookieStore = await cookies();  // ⚠️ 修正 cookies() 加上 await
    cookieStore.set("next-auth.session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 天
    });

    // ✅ 回傳登入成功
    return NextResponse.json(
      {
        message: "登入成功",
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          image: user.profile_picture,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("登入錯誤:", error);
    return NextResponse.json(
      { error: "請使用 Google 登入" },
      { status: 500 }
    );
  }
}
