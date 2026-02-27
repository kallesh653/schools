import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
};

export const academicAPI = {
  getYears: () => api.get('/academic/years'),
  getActiveYear: () => api.get('/academic/years').then(res => res.data.find(y => y.isActive)),
  createYear: (data) => api.post('/academic/years', data),
  updateYear: (id, data) => api.put(`/academic/years/${id}`, data),
  deleteYear: (id) => api.delete(`/academic/years/${id}`),
  getClasses: () => api.get('/academic/classes'),
  getClassById: (id) => api.get(`/academic/classes/${id}`),
  createClass: (data) => api.post('/academic/classes', data),
  updateClass: (id, data) => api.put(`/academic/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/academic/classes/${id}`),
  getSections: () => api.get('/academic/sections'),
  getSectionsByClass: (classId) => api.get(`/academic/sections/class/${classId}`),
  createSection: (data) => api.post('/academic/sections', data),
  updateSection: (id, data) => api.put(`/academic/sections/${id}`, data),
  deleteSection: (id) => api.delete(`/academic/sections/${id}`),
  getSubjects: () => api.get('/academic/subjects'),
  createSubject: (data) => api.post('/academic/subjects', data),
  updateSubject: (id, data) => api.put(`/academic/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/academic/subjects/${id}`),
};

export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  search: (query) => api.get(`/students/search?query=${query}`),
  getByClassSection: (classId, sectionId) => api.get(`/students/class/${classId}/section/${sectionId}`),
  getParent: (id) => api.get(`/students/${id}/parent`),
  createParent: (id, data) => api.post(`/students/${id}/parent`, data),
};

export const teacherAPI = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
};

export const attendanceAPI = {
  mark: (data) => api.post('/attendance/mark', data),
  getByDate: (date) => api.get(`/attendance/date/${date}`),
  getByClassSectionDate: (classId, sectionId, date) =>
    api.get(`/attendance/class/${classId}/section/${sectionId}/date/${date}`),
  getByStudent: (id) => api.get(`/attendance/student/${id}`),
  getTodayStats: () => api.get('/attendance/statistics/today'),
  getLeaves: () => api.get('/attendance/leaves'),
  applyLeave: (data) => api.post('/attendance/leaves', data),
  approveLeave: (id) => api.put(`/attendance/leaves/${id}/approve`),
  rejectLeave: (id, reason) => api.put(`/attendance/leaves/${id}/reject`, { reason }),
};

export const homeworkAPI = {
  getAll: () => api.get('/homework'),
  create: (data) => api.post('/homework', data),
  update: (id, data) => api.put(`/homework/${id}`, data),
  delete: (id) => api.delete(`/homework/${id}`),
  getByClass: (classId) => api.get(`/homework/class/${classId}`),
};

export const noticeAPI = {
  getAll: () => api.get('/notices'),
  getPublished: () => api.get('/notices/published'),
  create: (data) => api.post('/notices', data),
  update: (id, data) => api.put(`/notices/${id}`, data),
  delete: (id) => api.delete(`/notices/${id}`),
};

export const examinationAPI = {
  getAll: () => api.get('/examinations'),
  create: (data) => api.post('/examinations', data),
  update: (id, data) => api.put(`/examinations/${id}`, data),
  delete: (id) => api.delete(`/examinations/${id}`),
  getSchedules: (examId) => api.get(`/examinations/${examId}/schedules`),
  createSchedule: (data) => api.post('/examinations/schedules', data),
  updateSchedule: (id, data) => api.put(`/examinations/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/examinations/schedules/${id}`),
  getMarks: (examId) => api.get(`/examinations/${examId}/marks`),
  getMarksByStudentExam: (examId, studentId) => api.get(`/examinations/${examId}/student/${studentId}/marks`),
  createMarks: (data) => api.post('/examinations/marks', data),
  createMarksBulk: (data) => api.post('/examinations/marks/bulk', data),
  updateMarks: (id, data) => api.put(`/examinations/marks/${id}`, data),
  deleteMarks: (id) => api.delete(`/examinations/marks/${id}`),
};

export const feeAPI = {
  getStructures: () => api.get('/fees/structures'),
  getStructureById: (id) => api.get(`/fees/structures/${id}`),
  createStructure: (data) => api.post('/fees/structures', data),
  updateStructure: (id, data) => api.put(`/fees/structures/${id}`, data),
  deleteStructure: (id) => api.delete(`/fees/structures/${id}`),
  getAllPayments: () => api.get('/fees/payments'),
  getStudentPayments: (studentId) => api.get(`/fees/payments/student/${studentId}`),
  getStudentStatus: (studentId) => api.get(`/fees/status/student/${studentId}`),
  createPayment: (data) => api.post('/fees/payments', data),
  getDailyReport: (date) => api.get(`/fees/reports/daily?date=${date}`),
  getMonthlyReport: (startDate, endDate) =>
    api.get(`/fees/reports/monthly?startDate=${startDate}&endDate=${endDate}`),
};

export const transportAPI = {
  getRoutes: () => api.get('/transport/routes'),
  getActiveRoutes: () => api.get('/transport/routes/active'),
  getRouteById: (id) => api.get(`/transport/routes/${id}`),
  createRoute: (data) => api.post('/transport/routes', data),
  updateRoute: (id, data) => api.put(`/transport/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/transport/routes/${id}`),
  getStudentsByRoute: (routeId) => api.get(`/transport/routes/${routeId}/students`),
  assignRoute: (studentId, routeId) => api.put(`/transport/students/${studentId}/route`, { routeId }),
  removeRoute: (studentId) => api.delete(`/transport/students/${studentId}/route`),
};

export default api;
