import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  let connection;

  try {
    const { id } = params;  // 從 URL 動態參數取得比賽 ID

    if (!id) {
      return NextResponse.json({ error: "缺少必要參數：tournament_id" }, { status: 400 });
    }

    // ✅ 正確解析前端傳來的 JSON 資料
    const updatedData = await req.json();

    if (!Array.isArray(updatedData) || updatedData.length === 0) {
      throw new Error("缺少必要參數：更新資料");
    }

    // ✅ 建立資料庫連線
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    await connection.beginTransaction();  // ✅ 開啟交易

    // ✅ 更新比賽資料
    for (const item of updatedData) {
      const updateFields = [];
      const updateValues = [];

      // ✅ 轉換日期與場次為 session_id
      let sessionId;
      if (item.date && item.session_time) {
        const formattedDate = item.date.replace(/\//g, "-");

        const [sessionResult] = await connection.execute(
          `SELECT ts.tournament_session_id 
           FROM Tournament_Sessions ts
           JOIN Sessions s ON ts.session_id = s.session_id
           WHERE DATE(ts.competition_date) = ? AND s.session_time = ? AND ts.tournament_id = ?`,
          [formattedDate, item.session_time, id]
        );

        if (sessionResult.length === 0) {
          throw new Error(`日期 ${formattedDate} 和場次 ${item.session_time} 對應不到任何場次記錄`);
        }

        sessionId = sessionResult[0].tournament_session_id;
        updateFields.push("session_id = ?");
        updateValues.push(sessionId);
      }

      // ✅ 轉換場地名稱為 venue_id
      let venueId;
      if (item.venue) {
        const [venueResult] = await connection.execute(
          `SELECT venue_id FROM Venues WHERE venue = ? AND tournament_id = ?`,
          [item.venue, id]
        );

        if (venueResult.length === 0) {
          throw new Error(`場地 ${item.venue} 不存在`);
        }

        venueId = venueResult[0].venue_id;
        updateFields.push("venue_id = ?");
        updateValues.push(venueId);
      }

      // ✅ 轉換桌號為 table_id 並檢查是否重複
      if (item.table && venueId && sessionId) {
        const [tableResult] = await connection.execute(
          `SELECT table_id FROM Venue_Tables WHERE table_number = ? AND venue_id = ?`,
          [item.table, venueId]
        );

        if (tableResult.length === 0) {
          throw new Error(`桌號 ${item.table} 不存在於場地 ${item.venue}`);
        }

        const tableId = tableResult[0].table_id;

        // ✅ 檢查 `table_id` 和 `session_id` 是否已存在（避免違反 UNIQUE 約束）
        const [duplicateCheck] = await connection.execute(
          `SELECT match_id FROM Matches WHERE table_id = ? AND session_id = ? AND match_id != ?`,
          [tableId, sessionId, item.match_id]
        );

        if (duplicateCheck.length > 0) {
          throw new Error(`桌號 ${item.table} 在相同場次已被使用，請選擇不同的桌號或場次`);
        }

        updateFields.push("table_id = ?");
        updateValues.push(tableId);
      }

      // ✅ 如果沒有要更新的欄位，跳過
      if (updateFields.length === 0) {
        continue;
      }

      // ✅ 更新 Matches 資料
      const updateQuery = `
        UPDATE Matches 
        SET ${updateFields.join(", ")} 
        WHERE match_id = ?`;

      updateValues.push(item.match_id);

      await connection.execute(updateQuery, updateValues);
    }

    await connection.commit();  // ✅ 提交交易

    return NextResponse.json({ message: "更新成功" }, { status: 200 });
  } catch (error) {
    console.error("Error:", error.message);
    if (connection) {
      await connection.rollback();  // ❌ 發生錯誤時回滾
      await connection.end();
    }
    return NextResponse.json(
      { error: error.message || "更新失敗" },
      { status: 500 }
    );
  }
}
