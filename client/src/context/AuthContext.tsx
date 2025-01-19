// context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  name: string | null
  setIsLoggedIn: (value: boolean) => void
  setName: (value: string | null) => void
  logout: () => void
}

// 添加 children 的類型
interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [name, setName] = useState<string | null>(null)

  const logout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setName(null)
  }

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, name, setIsLoggedIn, setName, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

