import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import db from '../../models'

const router = express.Router()
const { User } = db

// 建議從環境變數中獲取密鑰
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key'

// 獲取所有使用者
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll()
    return res.status(200).json(users)
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ error: err.message })
  }
})

// 登入
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    // 根據 email 查詢資料庫
    const user = await User.findOne({ where: { email } })
    console.log('Found user:', user)

    if (!user) {
      return res.status(404).json({ message: '密碼錯誤或使用者不存在' })
    }
    // 若用戶不存在或密碼驗證不成功，返回錯誤

    if (bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: '密碼錯誤或使用者不存在' })
    }

    // 生成 JWT Token
    const token = jwt.sign(
      { userId: user.user_id, role: user.role }, // Payload
      SECRET_KEY, // Secret Key
      { expiresIn: '1h' } // Token 有效期
    )

    // 返回成功訊息，包含 token 和 username
    res.status(200).json({
      email: email,
      username: user.username,
      role: user.role,
      phone: user.phone,
      jwtToken: 'Bearer ' + token,
    })
  } catch (error) {
    console.error('登入錯誤:', error)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// 註冊
router.post('/register', async (req, res) => {
  const { email, password, is_student, phone, role, username, gender } =
    req.body

  if (!email || !password || !username || !gender) {
    return res.status(400).json({
      error: '請提供完整的資料，包括 email, password, username 和 gender',
    })
  }

  try {
    const existingUser = await User.findOne({ where: { username } })
    if (existingUser) {
      return res.status(409).json({ error: '帳號已經存在' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({
      email,
      password: hashedPassword,
      is_student,
      phone,
      role,
      username,
      gender,
    })

    return res.status(201).json({
      message: '註冊成功',
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    })
  }
})

export default router
