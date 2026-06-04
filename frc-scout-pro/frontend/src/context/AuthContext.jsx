import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)   // full token payload
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try {
        const u = JSON.parse(stored)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(u)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  function login(tokenData) {
    localStorage.setItem('token', tokenData.access_token)
    localStorage.setItem('user', JSON.stringify(tokenData))
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenData.access_token}`
    setUser(tokenData)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  /** Call after admin regenerates code to update stored user */
  function updateTeamCode(code) {
    if (!user) return
    const updated = { ...user, team_code: code }
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateTeamCode }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
