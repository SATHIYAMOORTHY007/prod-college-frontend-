import { createSlice } from '@reduxjs/toolkit'
import { readPreference } from '../../utils/storage'

/**
 * Only genuinely global UI state lives here. Form values, modal
 * visibility of a single page, filters etc. stay in component state.
 */
const initialState = {
  sidebarCollapsed: readPreference('sidebarCollapsed', false),
  mobileSidebarOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    toggleMobileSidebar(state) {
      state.mobileSidebarOpen = !state.mobileSidebarOpen
    },
    closeMobileSidebar(state) {
      state.mobileSidebarOpen = false
    },
  },
})

export const { toggleSidebar, toggleMobileSidebar, closeMobileSidebar } = uiSlice.actions
export default uiSlice.reducer
