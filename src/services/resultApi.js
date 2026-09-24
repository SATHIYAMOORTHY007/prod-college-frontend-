import { apiClient, cleanParams, unwrap } from './apiClient'

export const resultApi = {
  list: (params) => unwrap(apiClient.get('/results', { params: cleanParams(params) })),
  get: (id) => unwrap(apiClient.get(`/results/${id}`)),
  create: (payload) => unwrap(apiClient.post('/results', payload)),
  updateMarks: (id, marks) => unwrap(apiClient.patch(`/results/${id}/marks`, { marks })),

  /** @param {'submit'|'approve'|'reject'|'publish'} action */
  transition: (id, action, note) => unwrap(apiClient.post(`/results/${id}/${action}`, note ? { note } : {})),
  bulkTransition: (action, resultIds, note) =>
    unwrap(apiClient.post(`/results/bulk/${action}`, { resultIds, ...(note ? { note } : {}) })),
}
