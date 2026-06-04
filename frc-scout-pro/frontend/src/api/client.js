import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 15000 })

// ── TBA proxy ────────────────────────────────────────────────────────────────
export const tba = {
  status: () => api.get('/tba/status'),
  team: (num) => api.get(`/tba/team/${num}`),
  teamProfile: (num, year = 2026) => api.get(`/tba/team/${num}/profile?year=${year}`),
  teamMatches: (num, year = 2026) => api.get(`/tba/team/${num}/matches/${year}`),
  teamEventMatches: (num, key) => api.get(`/tba/team/${num}/event/${key}/matches`),
  events: (year = 2026) => api.get(`/tba/events/${year}`),
  event: (key) => api.get(`/tba/event/${key}`),
  eventFull: (key) => api.get(`/tba/event/${key}/full`),
  eventTeams: (key) => api.get(`/tba/event/${key}/teams`),
  eventMatches: (key) => api.get(`/tba/event/${key}/matches`),
  eventRankings: (key) => api.get(`/tba/event/${key}/rankings`),
  eventOprs: (key) => api.get(`/tba/event/${key}/oprs`),
  eventAlliances: (key) => api.get(`/tba/event/${key}/alliances`),
  eventAwards: (key) => api.get(`/tba/event/${key}/awards`),
  eventInsights: (key) => api.get(`/tba/event/${key}/insights`),
  match: (key) => api.get(`/tba/match/${key}`),
  districts: (year = 2026) => api.get(`/tba/districts/${year}`),
  districtRankings: (key) => api.get(`/tba/district/${key}/rankings`),
  districtEvents: (key) => api.get(`/tba/district/${key}/events`),
  teamsPage: (page = 0) => api.get(`/tba/teams/page/${page}`),
}

// ── Scouting data ─────────────────────────────────────────────────────────────
export const scout = {
  list: (eventKey = null) =>
    api.get('/scout/entries', { params: eventKey ? { event_key: eventKey } : {} }),
  create: (data) => api.post('/scout/entries', data),
  get: (id) => api.get(`/scout/entries/${id}`),
  update: (id, data) => api.put(`/scout/entries/${id}`, data),
  delete: (id) => api.delete(`/scout/entries/${id}`),
  teamEntries: (num) => api.get(`/scout/team/${num}/entries`),
  teamAverages: (num) => api.get(`/scout/team/${num}/averages`),
  summary: () => api.get('/scout/summary'),
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
        red: red.join(','),
        blue: blue.join(','),
        ...(eventKey ? { event_key: eventKey } : {}),
      },
    }),
}

export default api
