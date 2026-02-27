import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({
    user: null, token: null, loading: true,
    login: async () => { }, register: async () => { }, logout: () => { }, updateUser: () => { },
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const skipMeRef = useRef(false);

    useEffect(() => {
        if (skipMeRef.current) {
            skipMeRef.current = false;
            setLoading(false);
            return;
        }
        if (token) {
            authAPI.getMe()
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { access_token, user: userData } = res.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        skipMeRef.current = true;
        setUser(userData);
        setToken(access_token);
    };

    const register = async (name, email, password, role) => {
        const res = await authAPI.register({ name, email, password, role });
        const { access_token, user: userData } = res.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        skipMeRef.current = true;
        setUser(userData);
        setToken(access_token);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const updateUser = (u) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
