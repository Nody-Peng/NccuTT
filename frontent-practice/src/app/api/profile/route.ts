import mysql from "mysql2/promise";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  let connection;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = String(session.user.id); // 確保是字串

    // 連接 MySQL 資料庫
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // 查詢使用者資料
    const [userRows] = await connection.execute(
      "SELECT * FROM Users WHERE user_id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = userRows[0];

    // 查詢使用者的報名資料（registrations），新增 registration_time
    const [registrationRows] = await connection.execute(
      `SELECT tp.register_id, tp.user_id, tp.name, tp.email, tp.gender, tp.phone, 
              tp.tournament_id, tp.division, tp.category, tp.team_name, tp.event_type, tp.registration_time,
              t.name AS tournament_name, t.start_date, t.end_date, t.location, t.user_id AS organizer_id
       FROM tournament_participants tp
       JOIN tournaments t ON tp.tournament_id = t.tournament_id
       WHERE tp.user_id = ? AND t.status = '報名中'`,
      [userId]
    );

    // 查詢使用者參加的比賽（tournaments）
    const [tournamentRows] = await connection.execute(
      `SELECT DISTINCT t.tournament_id, t.user_id AS organizer_id, t.name AS tournament_name, 
              t.location, t.start_date, t.end_date, t.description, t.status
       FROM tournaments t
       JOIN tournament_participants tp ON t.tournament_id = tp.tournament_id
       WHERE tp.user_id = ? AND t.status = '進行中'`,
      [userId]
    );

    // 查詢主辦者新增的比賽（organizedTournaments）
    const [organizedTournamentsRows] = await connection.execute(
      `SELECT t.tournament_id, t.user_id AS organizer_id, t.name AS tournament_name, 
              t.location, t.start_date, t.end_date, t.description, t.status
      FROM tournaments t
      WHERE t.user_id = ?`,
      [userId]
    );

    // 回傳整合資料
    return new Response(
      JSON.stringify({
        user: {
          user_id: String(user.user_id),
          name: user.name,
          email: user.email,
          profile_picture: user.profile_picture,
          is_organizer: Boolean(user.is_organizer),
        },
        registrations: registrationRows,
        tournaments: tournamentRows,
        organizedTournaments: organizedTournamentsRows,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Database error:", error);
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    if (connection) {
      await connection.end(); // 確保連線被關閉
    }
  }
}

//取消報名
export async function DELETE(req: Request) {
  let connection;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = String(session.user.id);

    // 解析請求中的 register_id
    const url = new URL(req.url);
    const registerId = url.searchParams.get("register_id");

    if (!registerId) {
      return new Response(JSON.stringify({ error: "Missing register_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Received register_id:", registerId);

    // 連接 MySQL 資料庫
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // 確認報名的 tournament_id
    const [registrationRows] = await connection.execute(
      "SELECT tournament_id FROM tournament_participants WHERE register_id = ? AND user_id = ?",
      [registerId, userId]
    );

    console.log("Registration rows:", registrationRows);

    if (registrationRows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Registration not found or not authorized" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const tournamentId = registrationRows[0].tournament_id;

    // 確認比賽的狀態
    const [tournamentRows] = await connection.execute(
      "SELECT status FROM tournaments WHERE tournament_id = ?",
      [tournamentId]
    );

    console.log("Tournament rows:", tournamentRows);

    if (tournamentRows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Tournament not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const tournamentStatus = tournamentRows[0].status;

    console.log("Tournament status:", tournamentStatus);

    if (tournamentStatus !== "報名中") {
      return new Response(
        JSON.stringify({ error: "比賽報名期限已截止，無法取消。" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 刪除報名資料
    const [result] = await connection.execute(
      "DELETE FROM tournament_participants WHERE register_id = ? AND user_id = ?",
      [registerId, userId]
    );

    console.log("Delete result:", result);

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ error: "Registration deletion failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Registration successfully cancelled" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Database error:", error);
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function POST(req) {
  let connection;

  try {
    // 從請求中解析 JSON 內容
    const { tournamentId, newStatus } = await req.json();

    // 驗證必填欄位
    if (!tournamentId || !newStatus) {
      return new Response(
        JSON.stringify({ message: "請提供有效的比賽編號和狀態" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 建立資料庫連線
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // 執行更新操作
    const [result] = await connection.execute(
      "UPDATE tournaments SET status = ? WHERE tournament_id = ?",
      [newStatus, tournamentId]
    );

    // 檢查更新結果
    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ message: "比賽不存在或更新失敗" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 成功回應
    return new Response(
      JSON.stringify({ message: "狀態更新成功" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("更新失敗：", error);
    return new Response(
      JSON.stringify({ message: "伺服器錯誤" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}