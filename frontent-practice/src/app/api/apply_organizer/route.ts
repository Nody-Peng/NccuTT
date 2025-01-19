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
        { success: false, message: "請先登入後再進行申請。" },
        { status: 401 }
      );
    }

    const user_id = session.user.id; // ✅ 從 Session 取得 user_id

    // ✅ 建立資料庫連線
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // ✅ 檢查該使用者是否已經在申請成為主辦方
    const [userRows] = await connection.execute(
      "SELECT is_organizer, is_applying FROM Users WHERE user_id = ?",
      [user_id]
    );

    if ((userRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        { success: false, message: "使用者不存在，請重新登入。" },
        { status: 400 }
      );
    }

    const user = (userRows as any[])[0];

    // ✅ 如果已是主辦方或正在申請，回傳對應訊息
    if (user.is_organizer) {
      await connection.end();
      return NextResponse.json(
        { success: false, message: "你已經是主辦方了。" },
        { status: 400 }
      );
    }

    if (user.is_applying) {
      await connection.end();
      return NextResponse.json(
        { success: false, message: "你的申請正在審核中，請稍候。" },
        { status: 400 }
      );
    }

    // ✅ 更新 Users 表的 is_applying 欄位為 TRUE
    await connection.execute(
      "UPDATE Users SET is_applying = TRUE WHERE user_id = ?",
      [user_id]
    );

    // ✅ 關閉連線
    await connection.end();

    // ✅ 回傳成功訊息
    return NextResponse.json({
      success: true,
      message: "申請成功！請等待審核。",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "伺服器錯誤，請稍後再試。" },
      { status: 500 }
    );
  }
}
