import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 15000 })

// Attach token from localStorage on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto-logout on 401 — stale or invalid token
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  me:             ()     => api.get('/auth/me'),
  members:        ()     => api.get('/auth/team/members'),
  setRole:        (uid, role) => api.put(`/auth/team/members/${uid}/role?role=${role}`),
  removeMember:   (uid) => api.delete(`/auth/team/members/${uid}`),
  regenerateCode: ()     => api.post('/auth/team/regenerate-code'),
}

// ── TBA proxy ─────────────────────────────────────────────────────────────────
export const tba = {
  status:          ()        => api.get('/tba/status'),
  team:            (num)     => api.get(`/tba/team/${num}`),
  teamProfile:     (num, year = 2026) => api.get(`/tba/team/${num}/profile?year=${year}`),
  teamMatches:     (num, year = 2026) => api.get(`/tba/team/${num}/matches/${year}`),
  events:          (year = 2026)      => api.get(`/tba/events/${year}`),
  event:           (key)     => api.get(`/tba/event/${key}`),
  eventFull:       (key)     => api.get(`/tba/event/${key}/full`),
  eventTeams:      (key)     => api.get(`/tba/event/${key}/teams`),
  eventMatches:    (key)     => api.get(`/tba/event/${key}/matches`),
  eventRankings:   (key)     => api.get(`/tba/event/${key}/rankings`),
  eventOprs:       (key)     => api.get(`/tba/event/${key}/oprs`),
  eventAlliances:  (key)     => api.get(`/tba/event/${key}/alliances`),
  eventAwards:     (key)     => api.get(`/tba/event/${key}/awards`),
  eventInsights:   (key)     => api.get(`/tba/event/${key}/insights`),
  match:           (key)     => api.get(`/tba/match/${key}`),
  districts:       (year = 2026) => api.get(`/tba/districts/${year}`),
  districtRankings:(key)     => api.get(`/tba/district/${key}/rankings`),
  districtEvents:  (key)     => api.get(`/tba/district/${key}/events`),
  teamsPage:       (page = 0)    => api.get(`/tba/teams/page/${page}`),
}

// ── Scouting ──────────────────────────────────────────────────────────────────
export const scout = {
  list:         (eventKey = null) =>
    api.get('/scout/entries', { params: eventKey ? { event_key: eventKey } : {} }),
  create:       (data)   => api.post('/scout/entries', data),
  get:          (id)     => api.get(`/scout/entries/${id}`),
  update:       (id, data) => api.put(`/scout/entries/${id}`, data),
  delete:       (id)     => api.delete(`/scout/entries/${id}`),
  teamEntries:  (num)    => api.get(`/scout/team/${num}/entries`),
  teamAverages: (num)    => api.get(`/scout/team/${num}/averages`),
  summary:      (eventKey = null) =>
    api.get('/scout/summary', { params: eventKey ? { event_key: eventKey } : {} }),
  assignments:  (eventKey = null) =>
    api.get('/scout/assignments', { params: eventKey ? { event_key: eventKey } : {} }),
  createAssignment:  (data)  => api.post('/scout/assignments', data),
  bulkAssignments:   (data)  => api.post('/scout/assignments/bulk', data),
  deleteAssignment:  (id)    => api.delete(`/scout/assignments/${id}`),
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analytics = {
  picklist: (weights = {}, eventKey = null) =>
    api.get('/analytics/picklist', {
      params: { ...weights, ...(eventKey ? { event_key: eventKey } : {}) },
    }),
  predict: (red, blue, eventKey = null) =>
    api.get('/analytics/predict', {
      params: {
        red:  red.join(','),
        blue: blue.join(','),
        ...(eventKey ? { event_key: eventKey } : {}),
      },
    }),
}

export default api
