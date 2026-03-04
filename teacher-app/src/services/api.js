import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://schoolm.aksoftware.tech/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const teacherAPI = {
  getById: (id) => api.get(`/teachers/${id}`),
  getMyAssignments: () => api.get('/teachers/my-assignments'),
  getMyClassTeacherInfo: () => api.get('/teachers/my-class-teacher-info'),
  setClassTeacher: (teacherId, classId) => api.put(`/teachers/${teacherId}/class-teacher/${classId}`),
  removeClassTeacher: (classId) => api.delete(`/teachers/class-teacher/${classId}`),
  getClassTeacher: (classId) => api.get(`/teachers/class-teacher/${classId}`),
};

export const classAPI = {
  getAll: () => api.get('/academic/classes'),
};

export const sectionAPI = {
  getByClass: (classId) => api.get(`/academic/sections/class/${classId}`),
};

export const subjectAPI = {
  getAll: () => api.get('/academic/subjects'),
};

export const examinationAPI = {
  getAll: () => api.get('/examinations'),
  getById: (id) => api.get(`/examinations/${id}`),
  getMarks: (examId) => api.get(`/examinations/${examId}/marks`),
  getStudentMarks: (examId, studentId) => api.get(`/examinations/${examId}/student/${studentId}/marks`),
};

export const studentAPI = {
  getById: (id) => api.get(`/students/${id}`),
  getByClassAndSection: (classId, sectionId) =>
    api.get(`/students/class/${classId}/section/${sectionId}`),
};

export const attendanceAPI = {
  mark: (data) => api.post('/attendance/mark', data),
  getByClassSectionDate: (classId, sectionId, date) =>
    api.get(`/attendance/class/${classId}/section/${sectionId}/date/${date}`),
  getByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
};

export const homeworkAPI = {
  getAll: () => api.get('/homework'),
  getByClass: (classId) => api.get(`/homework/class/${classId}`),
  getByClassSection: (classId, sectionId) =>
    api.get(`/homework/class/${classId}/section/${sectionId}`),
  create: (data) => api.post('/homework', data),
  update: (id, data) => api.put(`/homework/${id}`, data),
  delete: (id) => api.delete(`/homework/${id}`),
};

export const marksAPI = {
  create: (data) => api.post('/examinations/marks', data),
  createBulk: (data) => api.post('/examinations/marks/bulk', data),
  update: (id, data) => api.put(`/examinations/marks/${id}`, data),
};

export const noticeAPI = {
  getAll: () => api.get('/notices'),
  getPublished: () => api.get('/notices/published'),
  create: (data) => api.post('/notices', data),
};

export default api;
