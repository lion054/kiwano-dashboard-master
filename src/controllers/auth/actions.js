import * as types from './types';

export const authLogin = (user, token) => ({
  type: types.AUTH_LOGIN,
  payload: { user, token }
})
