import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: "請先登入後再進行報名。" },
        { status: 401 }
      );
    }

    const user_id = session.user.id;
    const {
      name,
      email,
      phone,
      tournament_id,
      division,
      team_name,
      event_type,
      members, // 新增隊員資訊
    } = await req.json();

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

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

    // 插入報名資料
    const [result] = await connection.execute(
      `
      INSERT INTO Tournament_Participants (
        user_id,
        name,
        email,
        phone,
        tournament_id,
        division,
        category,
        team_name,
        event_type,
        registration_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        user_id,
        name,
        email,
        phone,
        tournament_id,
        division,
        "團體賽",
        team_name,
        event_type,
      ]
    );

    const register_id = result.insertId;

    // 插入隊員資料
    const memberInsertQueries = members.map((memberName: string) => {
      return connection.execute(
        `
        INSERT INTO Team_Members (register_id, member_name)
        VALUES (?, ?)
        `,
        [register_id, memberName]
      );
    });

    await Promise.all(memberInsertQueries); // 執行所有隊員的插入操作

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "團體報名資料已成功提交",
      registration_id: register_id,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "伺服器錯誤，請稍後再試。" },
      { status: 500 }
    );
  }
}
