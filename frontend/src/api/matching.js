import api from './axios'

export const triggerMatching = (opportunityId) => api.post(`/matching/run/${opportunityId}`)
export const getMatchingStatus = (opportunityId) => api.get(`/matching/status/${opportunityId}`)

// Admin endpoints
export const getFairnessLogs = () => api.get('/admin/fairness-logs')
export const resolveFairnessFlag = (id) => api.put(`/admin/fairness-logs/${id}/resolve`)
export const getAllUsers = () => api.get('/admin/users')
export const getStats = () => api.get('/admin/stats')
