// src/components/Home.tsx
import React from 'react'
import Widget from './widget'
import { useAuth } from '../context/AuthContext'

// test data
const tournaments = [
  {
    id: 1,
    name: '錦標賽 1',
    imageUrl: 'https://via.placeholder.com/300x200',
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-01-10'),
  },
  {
    id: 2,
    name: '錦標賽 2',
    imageUrl: 'https://via.placeholder.com/300x200',
    start_date: new Date('2024-02-01'),
    end_date: new Date('2024-02-15'),
  },
  {
    id: 3,
    name: '錦標賽 3',
    imageUrl: 'https://via.placeholder.com/300x200',
    start_date: new Date('2024-03-01'),
    end_date: new Date('2024-03-10'),
  },
]

const Home: React.FC = () => {
  const { isLoggedIn } = useAuth()
  return (
    <div>
      <h1>歡迎來到首頁！</h1>
      {isLoggedIn ? (
        <p>您已經登入，享受您的體驗！</p>
      ) : (
        <div>
          <p>請登入以獲得完整功能。</p>
          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            {tournaments.map((tournament) => (
              <Widget
                key={tournament.id}
                imageUrl={tournament.imageUrl}
                name={tournament.name}
                start_date={tournament.start_date}
                end_date={tournament.end_date}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
