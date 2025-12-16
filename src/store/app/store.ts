import { applyMiddleware, legacy_createStore } from "redux";
import rootReducer from "./rootReducer";
import { thunk } from 'redux-thunk'

const store = legacy_createStore(
    rootReducer, 
    applyMiddleware(thunk) as any
)


export  type AppDispatch = typeof store.dispatch
export default store;