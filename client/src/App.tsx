// App.tsx
import React from 'react'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import Home from './components/Home'
import Register from './components/Registration'
import Login from './components/Login'
import { AuthProvider, useAuth } from './context/AuthContext'
import Tournament from './components/tournament'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* topbar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              height: '50px',
              borderBottom: '1px solid #ccc',
            }}
          >
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'left',
                width: '85%',
                borderRight: '1px solid #ccc',
              }}
            >
              <Link style={{ padding: '30px' }} to="/">
                首頁
              </Link>
              {/* <Link to="/schedule">報名</Link> */}
            </nav>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                width: '15%',
              }}
            >
              <LoginDisplay /> {/* 顯示用戶名稱或登入按鈕 */}
            </div>
          </div>
          <div style={{ flex: 1, padding: '10px' }}>
            {/* 主要內容路由 */}
            <Routes>
              <Route path="/" element={<Home />} /> {/* 根路徑指向 Home */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/tournament" element={<Tournament />}></Route>
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

// 顯示用戶名稱或登入按鈕的組件
const LoginDisplay: React.FC = () => {
  const { isLoggedIn, name, logout } = useAuth()

  return (
    <>
      {isLoggedIn ? (
        <>
          <span style={{ marginRight: '10px' }}>歡迎, {name}!</span>
          <button onClick={logout}>登出</button>
        </>
      ) : (
        <>
          <Link to="/register" style={{ marginRight: '10px' }}>
            註冊
          </Link>
          <Link to="/login">登入</Link>
        </>
      )}
    </>
  )
}

export default App
