import { combineReducers } from 'redux'
import authReducer from '../features/auth/auth.reducer'
import forgetpasswordReducer from '../features/forgotpassword/forgotPassword.reducer'
import eventReducrer from '../features/events/events.reducer'
import usersReducer from '../features/users/users.reducer'
import analyticsReducer from '../features/analytics/analytics.reducer'
import { categoryReducer } from '../features/categories/categories.reducer'
import { badgesReducer } from '../features/badges/badges.reducer'
import rolesReducer from '../features/roles/roles.reducer'
import { membersReducer } from '../features/members/members.reducer'

const rootReducer = combineReducers({
  auth: authReducer,
  forgotPassword: forgetpasswordReducer,
  events: eventReducrer,
  users: usersReducer,
  analytics: analyticsReducer,
  categories: categoryReducer,
  badges : badgesReducer,
  roles: rolesReducer,  
  members: membersReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer