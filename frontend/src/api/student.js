import api from './axios'

export const getProfile = () => api.get('/student/profile')
export const updateProfile = (data) => api.put('/student/profile', data)
export const uploadResume = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/student/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}
export const getResumeStatus = () => api.get('/student/resume/status')
export const getOpportunities = (params) => api.get('/student/opportunities', { params })
export const getOpportunityDetail = (id) => api.get(`/student/opportunities/${id}`)
export const applyToOpportunity = (id) => api.post(`/student/opportunities/${id}/apply`)
export const getApplications = (params) => api.get('/student/applications', { params })
export const getApplicationDetail = (id) => api.get(`/student/applications/${id}`)
export const getNotifications = () => api.get('/student/notifications')
export const markNotificationRead = (id) => api.put(`/student/notifications/${id}/read`)
