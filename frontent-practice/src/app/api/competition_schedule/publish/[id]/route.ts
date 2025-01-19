import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  let connection;

  try {
    const { id } = params;  // 從 URL 動態參數取得比賽 ID
    const { searchParams } = new URL(req.url);
    const division = searchParams.get("division");  // 組別

    if (!id) {
      return NextResponse.json({ error: "缺少必要參數：tournament_id" }, { status: 400 });
    }

    // ✅ 建立資料庫連線
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // ✅ 查詢特定組別是否全部發布
    const [rows] = await connection.execute(
      `SELECT COUNT(*) AS total, 
              SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) AS published
       FROM Matches
       WHERE tournament_id = ? AND division = ?`,
      [id, division]
    );

    await connection.end();

    if (rows.length === 0 || rows[0].total === 0) {
      return NextResponse.json({ message: "找不到比賽資料" }, { status: 404 });
    }

    // ✅ 強制型別轉換成數字
    const total = Number(rows[0].total);
    const published = Number(rows[0].published);

    // ✅ 修正比較邏輯（確保數值比較）
    const isPublished = total === published && total !== 0;

    console.log(`比賽ID: ${id} 組別: ${division} ➔ 總場次: ${total}, 已發布: ${published}, 狀態: ${isPublished}`);

    return NextResponse.json({ is_published: isPublished ? 1 : 0 }, { status: 200 });

  } catch (error) {
    console.error("❗ 資料庫錯誤:", error.message);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
