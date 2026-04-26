


// // authSlicer.js
// import { createSlice } from "@reduxjs/toolkit"

// const initialState = {
//   admin_details: [],
//   selected_user: null,
// }

// const suggestedUsersInitialState = {
//   suggested_users: []
// }

// // Auth Slice
// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setAuthUser: (state, action) => {
//       state.admin_details = action.payload
//     },
//     removeAuthUser: (state) => {
//       state.admin_details = null
//     },
//     setSelectedUser: (state, action) => {
//       state.selected_user = action.payload
//     },
//     removeSelectedUser: (state) => {
//       state.selected_user = null
//     },
//   },
// })

// // Suggested Users Slice
// const suggestedUsersSlice = createSlice({
//   name: "suggestedUsers",
//   initialState: suggestedUsersInitialState,
//   reducers: {
//     setSuggestedUsers: (state, action) => {
//       state.suggested_users = action.payload
//     },
//     removeSuggestedUsers: (state) => {
//       state.suggested_users = []
//     },
//   },
// })

// export const { setAuthUser, removeAuthUser, setSelectedUser, removeSelectedUser } = authSlice.actions
// export const { setSuggestedUsers, removeSuggestedUsers } = suggestedUsersSlice.actions

// export const authReducer = authSlice.reducer
// export const suggestedUsersReducer = suggestedUsersSlice.reducer
