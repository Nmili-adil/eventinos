// store/reducers/index.ts
import { combineReducers } from 'redux'
import authReducer from '../features/auth/auth.reducer'

const rootReducer = combineReducers({
  auth: authReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer