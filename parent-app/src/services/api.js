import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://schoolm.aksoftware.tech/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
};

// parentId = user.entityId (Parent entity ID from login response)
export const parentAPI = {
  getChildren: (parentId) => api.get(`/students/parent/${parentId}`),
};

export const studentAPI = {
  getById: (id) => api.get(`/students/${id}`),
};

export const attendanceAPI = {
  getByStudent: (id) => api.get(`/attendance/student/${id}`),
  applyLeave: (data) => api.post('/attendance/leaves', data),
};

export const feeAPI = {
  getStructures: () => api.get('/fees/structures'),
  getPaymentsByStudent: (studentId) => api.get(`/fees/payments/student/${studentId}`),
  getStatusByStudent: (studentId) => api.get(`/fees/status/student/${studentId}`),
};

export const examinationAPI = {
  getAll: () => api.get('/examinations'),
  getSchedules: (examId) => api.get(`/examinations/${examId}/schedules`),
  getMarksByStudentAndExam: (examId, studentId) =>
    api.get(`/examinations/${examId}/student/${studentId}/marks`),
};

export const homeworkAPI = {
  getByClass: (classId) => api.get(`/homework/class/${classId}`),
};

export const noticeAPI = {
  getPublished: () => api.get('/notices/published'),
  getAll: () => api.get('/notices'),
};

export default api;
