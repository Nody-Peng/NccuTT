// src/components/widget.tsx
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { formatDate } from '../context/kits'

function Widget({
  imageUrl,
  name,
  start_date,
  end_date,
}: {
  imageUrl: string
  name: string
  start_date: Date
  end_date: Date
}) {
  const { isLoggedIn } = useAuth()
  const date_string: string =
    formatDate(start_date) + '~' + formatDate(end_date)
  return (
    <Link
      to="/tournament"
      state={{ name }}
      style={{
        display: 'block',
        width: '300px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        backgroundColor: '#fff',
        textAlign: 'center',
        justifyItems: 'left',
      }}
    >
      {/* 照片區域 */}
      <div
        style={{
          width: '100%',
          height: '200px',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      {/* 文字區域 */}
      <p
        style={{
          padding: '10px 15px',
          margin: 0,
          fontSize: '16px',
          color: '#333',
        }}
      >
        {name}
      </p>
      <p
        style={{
          padding: '10px 15px',
          margin: 0,
          fontSize: '16px',
          color: '#333',
        }}
      >
        {date_string}
      </p>
    </Link>
  )
}
export default Widget
