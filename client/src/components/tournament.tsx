// src/components/Home.tsx
import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation } from 'react-router-dom';

const Tournament: React.FC = () => {
  const { isLoggedIn } = useAuth()
  const location = useLocation();
  const { name } = location.state || { name: '未指定比賽名稱' };
  return (
    <div style={{ display: 'flex' }}>
      <h1>{name}</h1>
      {isLoggedIn ? (
        <p>您已經登入，享受您的體驗！</p>
      ) : (
        <div>
          <p>請登入以獲得完整功能。</p>
        </div>
      )}
    </div>
  )
}

export default Tournament
