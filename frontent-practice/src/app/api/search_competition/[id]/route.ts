import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// ✅ API 路由: /api/search_competition/[id]
export async function GET(req: Request, context: { params: { id?: string } }) {
  const tournamentId = context.params?.id;

  if (!tournamentId) {
    return NextResponse.json(
      { error: "Invalid tournament ID" },
      { status: 400 }
    );
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // ✅ 查詢賽程類別
    const [collegeSchedule] = await connection.execute(
      `SELECT type FROM Matches WHERE tournament_id = ? AND division = '大專組'`,
      [tournamentId]
    );

    const [societySchedule] = await connection.execute(
      `SELECT type FROM Matches WHERE tournament_id = ? AND division = '社會組'`,
      [tournamentId]
    );

    await connection.end();

    return NextResponse.json({
      college: {
        scheduleType: (collegeSchedule as any)[0]?.type || "未設定",
      },
      society: {
        scheduleType: (societySchedule as any)[0]?.type || "未設定",
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "無法獲取賽程數據" }, { status: 500 });
  }
}
