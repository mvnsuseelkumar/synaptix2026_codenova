import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

export const jobsAPI = {
    list: (params) => api.get('/jobs', { params }),
    get: (id) => api.get(`/jobs/${id}`),
    create: (data) => api.post('/jobs', data),
    update: (id, data) => api.put(`/jobs/${id}`, data),
    delete: (id) => api.delete(`/jobs/${id}`),
};

export const applicantAPI = {
    getProfile: () => api.get('/applicant/profile'),
    updateProfile: (data) => api.put('/applicant/profile', data),
    apply: (jobId) => api.post(`/applicant/apply/${jobId}`),
    getApplications: () => api.get('/applicant/applications'),
    getRecommendations: () => api.get('/applicant/recommendations'),
    getSkillGap: (jobId) => api.get(`/applicant/skill-gap/${jobId}`),
    validateProject: (data) => api.post('/applicant/validate-project', data),
};

export const resumeAPI = {
    upload: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/resume/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getInfo: () => api.get('/resume/me'),
    download: () => api.get('/resume/download', { responseType: 'blob' }),
    delete: () => api.delete('/resume/delete'),
    getApplicantInfo: (applicantId) => api.get(`/resume/applicant/${applicantId}/info`),
    downloadApplicant: (applicantId) => api.get(`/resume/applicant/${applicantId}`, { responseType: 'blob' }),
};

export const recruiterAPI = {
    updateProfile: (data) => api.put('/recruiter/profile', data),
    getMyJobs: () => api.get('/recruiter/jobs'),
    getCandidates: (jobId) => api.get(`/recruiter/jobs/${jobId}/candidates`),
    updateApplicationStatus: (appId, status) => api.put(`/recruiter/applications/${appId}/status`, { status }),
    getAnalytics: () => api.get('/recruiter/analytics'),
};

export const matchAPI = {
    getDetailedMatch: (jobId, applicantId) => api.get(`/match/${jobId}/${applicantId}`),
};

export default api;
