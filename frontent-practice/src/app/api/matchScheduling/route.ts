import mysql from 'mysql2/promise'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { tournament_id, division, gender, matchType } = await req.json()
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    })
    // 查詢資料庫
    const event_type = gender + matchType
    const [rows] = await connection.execute(
      `SELECT 
        register_id,
        tournament_id,
        division,
        event_type,
        name,
        team_name
      FROM Tournament_Participants
      WHERE tournament_id = ? AND event_type = ? AND division = ?`,
      [tournament_id, event_type, division]
    )

    let matchNumber = 1
    const matchPromises = []

    for (let i = 0; i < rows.length; i += 2) {
      const playerOne = rows[i].name
      const playerTwo = rows[i + 1]?.name

      // 如果選手數量是奇數，最後一個選手會直接進入下一輪
      if (!playerTwo) break

      // 插入賽程資訊到資料庫
      matchPromises.push(
        connection.execute(
          `INSERT INTO Tournament_Schedule (tournament_id, division, event_type, player_one_name, player_two_name, match_number)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            tournament_id,
            division,
            event_type,
            playerOne,
            playerTwo,
            matchNumber,
          ]
        )
      )
      matchNumber++
    }
    await Promise.all(matchPromises)

    const [res] = await connection.execute(
      `
SELECT * FROM Tournament_Schedule WHERE tournament_id = ? AND division = ? AND event_type = ?
`,
      [tournament_id, division, event_type]
    )

    await connection.end()

    console.log('rows', res)

    return NextResponse.json(
      {
        message: '賽程安排完成！',
        participants: res,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Database query failed' },
      { status: 500 }
    )
  }
}
