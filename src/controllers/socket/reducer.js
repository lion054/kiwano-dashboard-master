import * as types from './types';

const initialState = {
  users: [],
  messages: []
};

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.CONNECT_TO_CHAT_SUCCESS:
      return {
        ...state,
        users: action.payload
      };
    case types.CONNECT_TO_CHAT_FAIL:
      return {
        ...state,
        users: []
      };
    case types.FETCH_LATEST_MESSAGES:
      return {
        ...state,
        messages: action.payload
      };
    case types.FETCH_MORE_MESSAGES:
      // Deal with side effect, due to server broadcast for multiple devices
      // The same message may be reached multiple times
      const payload = action.payload.filter(newMsg => !state.messages.find(oldMsg => oldMsg.id === newMsg.id));
      return {
        ...state,
        messages: state.messages.concat(payload)
      };
    case types.RECEIVE_MESSAGE:
      // Deal with side effect, due to server broadcast for multiple devices
      // The same message may be reached multiple times
      const found = state.messages.find(message => message.id === action.payload.id);
      return found ? state : {
        ...state,
        messages: [action.payload].concat(state.messages)
      };
    default:
      return state;
  }
};

export default messageReducer;