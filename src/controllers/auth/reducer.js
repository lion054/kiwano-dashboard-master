import * as types from './types';

const initialState = {
  user: {},
  apiToken: ''
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.AUTH_LOGIN:
      const { user, token } = action.payload;
      return {
        ...state,
        user,
        apiToken: token
      };
    default:
      return state;
  }
};

export default authReducer;