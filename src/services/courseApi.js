import { apiClient, cleanParams, unwrap } from './apiClient'

export const courseApi = {
  list: (params) => unwrap(apiClient.get('/courses', { params: cleanParams(params) })),
  create: (payload) => unwrap(apiClient.post('/courses', payload)),
  update: (id, payload) => unwrap(apiClient.patch(`/courses/${id}`, payload)),
  remove: (id) => unwrap(apiClient.delete(`/courses/${id}`)),

  listSubjects: (courseId, params) =>
    unwrap(apiClient.get(`/courses/${courseId}/subjects`, { params: cleanParams(params) })),
  createSubject: (courseId, payload) => unwrap(apiClient.post(`/courses/${courseId}/subjects`, payload)),
  updateSubject: (courseId, subjectId, payload) =>
    unwrap(apiClient.patch(`/courses/${courseId}/subjects/${subjectId}`, payload)),
  removeSubject: (courseId, subjectId) => unwrap(apiClient.delete(`/courses/${courseId}/subjects/${subjectId}`)),
}
