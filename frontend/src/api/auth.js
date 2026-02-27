import api from './axios'

export const registerStudent = (data) => api.post('/auth/register/student', data)
export const registerCompany = (data) => api.post('/auth/register/company', data)
export const login = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')
export const logout = () => api.post('/auth/logout')
