import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// ✅ API 路由: /api/grouping/[id]
export async function GET(req: Request, context: { params: { id?: string } }) {
  const tournamentId = context.params?.id;

  if (!tournamentId) {
    return NextResponse.json({ error: "Invalid tournament ID" }, { status: 400 });
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // ✅ 查詢各組別報名情況
    const [collegeIndividual] = await connection.execute(
      `SELECT COUNT(DISTINCT register_id) AS count FROM tournament_participants
       WHERE tournament_id = ? AND division = '大專組' AND category = '個人賽'`,
      [tournamentId]
    );

    const [collegeTeam] = await connection.execute(
      `SELECT COUNT(DISTINCT register_id) AS count FROM tournament_participants
       WHERE tournament_id = ? AND division = '大專組' AND category = '團體賽'`,
      [tournamentId]
    );

    const [societyIndividual] = await connection.execute(
      `SELECT COUNT(DISTINCT register_id) AS count FROM tournament_participants
       WHERE tournament_id = ? AND division = '社會組' AND category = '個人賽'`,
      [tournamentId]
    );

    const [societyTeam] = await connection.execute(
      `SELECT COUNT(DISTINCT register_id) AS count FROM tournament_participants
       WHERE tournament_id = ? AND division = '社會組' AND category = '團體賽'`,
      [tournamentId]
    );

    await connection.end();

    return NextResponse.json({
      college: {
        individual: (collegeIndividual as any)[0].count,
        team: (collegeTeam as any)[0].count,
      },
      society: {
        individual: (societyIndividual as any)[0].count,
        team: (societyTeam as any)[0].count,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "無法獲取報名數據" }, { status: 500 });
  }
}
