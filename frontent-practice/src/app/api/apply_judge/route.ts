import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route"; // 引入 authOptions

export async function POST(req: Request) {
  try {
    // ✅ 獲取登入 Session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: "請先登入後再進行報名。" },
        { status: 401 }
      );
    }

    const user_id = session.user.id; // ✅ 從 Session 取得 user_id

    // ✅ 獲取表單提交的資料
    const {
      name,
      email,
      gender,
      phone,
      tournament_id,
      division,
      dietary_preference, // 新增：飲食習慣
      allergens,          // 新增：過敏原
    } = await req.json();

    // ✅ 資料庫連線
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // ✅ 檢查 Users 表是否存在該 user_id
    const [userRows] = await connection.execute(
      "SELECT * FROM Users WHERE user_id = ?",
      [user_id]
    );

    if ((userRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        { success: false, message: "使用者不存在，請重新登入。" },
        { status: 400 }
      );
    }

    // ✅ 插入報名資料到 Tournament_Participants
    const [participantResult] = await connection.execute(
      `
      INSERT INTO Tournament_Participants (
        user_id, name, email, gender, phone, tournament_id, division, registration_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        user_id,
        name,
        email,
        gender,
        phone,
        tournament_id,
        division,
      ]
    );

    const register_id = participantResult.insertId; // 獲取新插入的 register_id

    // ✅ 插入或更新 Judges 表資料
    const [judgeResult] = await connection.execute(
      `
      INSERT INTO Judges (judge_id, dietary_preference, allergens)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE dietary_preference = ?, allergens = ?
      `,
      [
        register_id,
        dietary_preference,
        allergens,
        dietary_preference,
        allergens,
      ]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "參賽資料已成功提交",
      registration_id: register_id, // 回傳新插入的 register_id
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "伺服器錯誤，請稍後再試。" },
      { status: 500 }
    );
  }
}
