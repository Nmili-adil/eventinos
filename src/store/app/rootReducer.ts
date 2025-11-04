import { combineReducers } from 'redux'
import authReducer from '../features/auth/auth.reducer'
import forgetpasswordReducer from '../features/forgotpassword/forgotPassword.reducer'
import eventReducrer from '../features/events/events.reducer'
import usersReducer from '../features/users/users.reducer'
import analyticsReducer from '../features/analytics/analytics.reducer'

const rootReducer = combineReducers({
  auth: authReducer,
  forgotPassword: forgetpasswordReducer,
  events: eventReducrer,
  users: usersReducer,
  analytics: analyticsReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer