// server/index.ts
import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import { authRouter } from './routes'

const app = express()
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

const PORT = 5001

app.get("/", (_req, res) => {
  res.send("Hello TypeScript with Express!");
});

app.use('/auth', authRouter)


app.listen(PORT, () => {
  console.log(`伺服器正在運行在 http://localhost:${PORT}`)
})
