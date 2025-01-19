// components/Login.tsx
import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom' // 導入 useNavigate
import { useAuth } from '../context/AuthContext' // 確保導入 useAuth

const Login: React.FC = () => {
  const { setIsLoggedIn, setName } = useAuth() // 使用上下文
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    try {
      const response = await axios.post('http://localhost:5001/api/login', {
        username,
        password,
      })

      const { token, name } = response.data // 獲取用戶名稱
      localStorage.setItem('token', token)
      setIsLoggedIn(true) // 設置登錄狀態
      setName(name) // 設置用戶名稱

      setUsername('')
      setPassword('')
      navigate('/')
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || '登入失敗')
      } else {
        setError('伺服器錯誤，請稍後再試')
      }
    }
  }

  return (
    <div>
      <h2>登入</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">用戶名:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">密碼:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">登入</button>
      </form>
    </div>
  )
}

export default Login
