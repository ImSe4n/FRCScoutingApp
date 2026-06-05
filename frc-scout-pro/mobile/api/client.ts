import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend's IP when running on a real device.
// For emulator: Android uses 10.0.2.2, iOS simulator uses localhost.
// For Expo Go on a physical device, use your computer's LAN IP.
export const API_BASE_URL = 'http://10.32.167.65'; // change to your machine's IP for physical device

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/api/auth/login', { username, password }),
  register: (data: object) => api.post('/api/auth/register', data),
  me: () => api.get('/api/auth/me'),
  getMembers: () => api.get('/api/auth/team/members'),
  updateRole: (uid: number, role: string) =>
    api.put(`/api/auth/team/members/${uid}/role`, { role }),
  removeMember: (uid: number) => api.delete(`/api/auth/team/members/${uid}`),
  regenerateCode: () => api.post('/api/auth/team/regenerate-code'),
};

export const tbaAPI = {
  getTeam: (num: string | number) => api.get(`/api/tba/team/${num}`),
  getTeamEvents: (num: string | number) => api.get(`/api/tba/team/${num}/events`),
  getTeamMatches: (num: string | number) => api.get(`/api/tba/team/${num}/matches`),
  getTeamAwards: (num: string | number) => api.get(`/api/tba/team/${num}/awards`),
  getEvents: () => api.get('/api/tba/events'),
  getEvent: (key: string) => api.get(`/api/tba/event/${key}`),
  getEventTeams: (key: string) => api.get(`/api/tba/event/${key}/teams`),
  getEventMatches: (key: string) => api.get(`/api/tba/event/${key}/matches`),
  getEventRankings: (key: string) => api.get(`/api/tba/event/${key}/rankings`),
  getEventOPRs: (key: string) => api.get(`/api/tba/event/${key}/oprs`),
  getEventAlliances: (key: string) => api.get(`/api/tba/event/${key}/alliances`),
  getEventAwards: (key: string) => api.get(`/api/tba/event/${key}/awards`),
};

export const scoutAPI = {
  getEntries: () => api.get('/api/scout/entries'),
  createEntry: (data: object) => api.post('/api/scout/entries', data),
  updateEntry: (id: number, data: object) => api.put(`/api/scout/entries/${id}`, data),
  deleteEntry: (id: number) => api.delete(`/api/scout/entries/${id}`),
  getAverages: (teamNum: string | number) =>
    api.get(`/api/scout/team/${teamNum}/averages`),
  getSummary: () => api.get('/api/scout/summary'),
  getAssignments: () => api.get('/api/scout/assignments'),
  createAssignment: (data: object) => api.post('/api/scout/assignments', data),
  deleteAssignment: (id: number) => api.delete(`/api/scout/assignments/${id}`),
  bulkAssignments: (data: object) => api.post('/api/scout/assignments/bulk', data),
};

export const analyticsAPI = {
  getPicklist: (params: object) => api.get('/api/analytics/picklist', { params }),
  predict: (params: object) => api.get('/api/analytics/predict', { params }),
};

export default api;
