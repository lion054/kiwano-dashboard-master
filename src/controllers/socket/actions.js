import { message } from 'antd';
import * as types from './types';

let ws = null;
let users = [];

const connectToServer = (dispatch, getState) => {
  const {
    auth: { user, apiToken }
  } = getState();
  fetch(`${process.env.REACT_APP_API_ENDPOINT}/users`, {
    headers: {
      'Authorization': `Bearer ${apiToken}`
    }
  }).then(response => {
    if (response.ok) {
      return response.json();
    }
    return response.json().then(json => {
      throw new Error(json.error);
    });
  }).then(json => {
    users = json;
    ws = new WebSocket(process.env.REACT_APP_SOCKET_ENDPOINT);

    ws.onopen = () => {
      // connection opened
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('something'); // send a message
        ws.send(JSON.stringify({
          command: 'register',
          userId: user.id
        }));
      }
    };

    ws.onmessage = (e) => {
      // a message was received
      const data = JSON.parse(e.data);
      switch (data.command) {
        case 'register':
          for (let i = 0; i < users.length; i++) {
            const userId = users[i].id;
            users[i].connected = !!data.result[userId];
          }
          dispatch({
            type: types.CONNECT_TO_CHAT_SUCCESS,
            payload: users
          });
          break;
        case 'message':
          dispatch({
            type: types.RECEIVE_MESSAGE,
            payload: data
          });
          break;
        default:
          break;
      }
    };

    ws.onerror = (e) => {
      // an error occurred
      console.log(e.message);
    };

    ws.onclose = (e) => {
      // connection closed
      // console.log(e.code, e.reason);
      console.log(e.type, e.message);
      connectToServer(getState);
    };
  }).catch(error => {
    message.error(error);
  });
}

export const openSocket = () => {
  return (dispatch, getState) => {
    connectToServer(dispatch, getState);
  }
}

export const fetchLatestMessages = (messages) => ({
  type: types.FETCH_LATEST_MESSAGES,
  payload: messages
})

export const fetchMoreMessages = (messages) => ({
  type: types.FETCH_MORE_MESSAGES,
  payload: messages
})

function waitForSocket(socket, callback, dispatch, getState) {
  setTimeout(() => {
    switch (socket.readyState) {
      case WebSocket.CONNECTING:
        waitForSocket(socket, callback, dispatch, getState); // Retry after delay
        break;
      case WebSocket.OPEN:
        callback();
        break;
      case WebSocket.CLOSING:
        waitForSocket(socket, callback, dispatch, getState); // Wait for socket to be closed
        break;
      case WebSocket.CLOSED:
        connectToServer(dispatch, getState);
        waitForSocket(socket, callback, dispatch, getState); // Wait for reconnection to be successful
        break;
      default:
        break;
    }
  }, 5);
}

export const sendMessage = (from, to, body) => {
  return (dispatch, getState) => {
    waitForSocket(ws, () => { // OPEN
      ws.send(JSON.stringify({
        command: 'message',
        from,
        to,
        body
      }));
    }, dispatch, getState);
  }
}
