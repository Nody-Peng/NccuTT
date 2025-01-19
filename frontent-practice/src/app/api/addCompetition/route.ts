import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const data = await req.json();
    const { title, description, enrollDate, startDate, endDate, location, numOfTable } = data;

    if (!title || !enrollDate || !startDate || !endDate || !location || !numOfTable) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (!(new Date(enrollDate) < new Date(startDate) && new Date(startDate) < new Date(endDate))) {
      return NextResponse.json(
        { error: "請確認日期是否有誤：報名截止日期必須小於開始日期，且開始日期必須小於結束日期。" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    const [tournamentResult] = await connection.execute(
      `INSERT INTO Tournaments (user_id, name, location, start_date, end_date, description, enroll_date, num_of_table)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, title, location, startDate, endDate, description, enrollDate, numOfTable]
    );

    const tournamentId = tournamentResult.insertId;

    const [venueResult] = await connection.execute(
      `INSERT INTO Venues (tournament_id, venue) VALUES (?, ?)`,
      [tournamentId, location]
    );

    const venueId = venueResult.insertId;

    const sessionPromises = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Loop through each date in the range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const competitionDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      for (let sessionId = 1; sessionId < 11; sessionId++) {
        sessionPromises.push(
          connection.execute(
            `INSERT INTO Tournament_Sessions (tournament_id, competition_date, session_id) VALUES (?, ?, ?)`,
            [tournamentId, competitionDate, sessionId]
          )
        );
      }
    }
    await Promise.all(sessionPromises);

    const tablePromises = [];
    for (let i = 1; i <= numOfTable; i++) {
      tablePromises.push(
        connection.execute(
          `INSERT INTO Venue_Tables (venue_id, table_number) VALUES (?, ?)`,
          [venueId, i]
        )
      );
    }
    await Promise.all(tablePromises);

    await connection.end();

    return NextResponse.json(
      { message: "比賽新增成功！" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "比賽新增失敗，請確認欄位是否都有正確填寫。" },
      { status: 500 }
    );
  }
}