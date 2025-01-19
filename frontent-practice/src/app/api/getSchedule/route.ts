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

    const [res] = await connection.execute(
      `
SELECT * FROM Tournament_Schedule WHERE tournament_id = ? AND division = ? AND event_type = ?
`,
      [tournament_id, division, event_type]
    )

    await connection.end()

    console.log('res', res)

    return NextResponse.json(
      {
        message: '查詢成功！',
        schedule: res,
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
