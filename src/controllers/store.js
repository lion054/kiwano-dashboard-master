import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import authReducer from './auth/reducer';
import socketReducer from './socket/reducer';

import apiMiddleware from '../middleware/api';

const reducers = combineReducers({
  auth: authReducer,
  socket: socketReducer
});

const store = createStore(reducers, applyMiddleware(thunk, apiMiddleware));

export default store;
