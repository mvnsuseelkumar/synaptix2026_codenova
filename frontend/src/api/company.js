import api from './axios'

export const getProfile = () => api.get('/company/profile')
export const updateProfile = (data) => api.put('/company/profile', data)
export const createOpportunity = (data) => api.post('/company/opportunities', data)
export const getOpportunities = () => api.get('/company/opportunities')
export const getOpportunity = (id) => api.get(`/company/opportunities/${id}`)
export const updateOpportunity = (id, data) => api.put(`/company/opportunities/${id}`, data)
export const deleteOpportunity = (id) => api.delete(`/company/opportunities/${id}`)
export const getRankings = (id, params) => api.get(`/company/opportunities/${id}/rankings`, { params })
export const updateApplicationStatus = (id, data) => api.put(`/company/applications/${id}/status`, data)
export const getApplicantDetail = (id) => api.get(`/company/applications/${id}`)
export const getNotifications = () => api.get('/company/notifications')
