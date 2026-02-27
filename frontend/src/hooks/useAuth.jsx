import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            return
        }
        try {
            const res = await getMe()
            setUser(res.data)
        } catch {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadUser()
    }, [loadUser])

    const loginUser = (token, userData) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }

    const logoutUser = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        navigate('/login')
    }

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, loadUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be inside AuthProvider')
    return context
}
