import qs from 'qs';
import { isEmpty } from 'lodash/fp';
import HttpStatus from 'http-status-codes';

import { API_REQUEST } from '../controllers/api/types';

const apiMiddleware = ({ dispatch }) => next => action => {
  next(action);

  if (action.type !== API_REQUEST) {
    return;
  }

  const {
    url,
    method,
    data,
    accessToken,
    onStart,
    onSuccess,
    onError,
    onAccessDenied
  } = action.payload;

  let { headers } = action.payload;
  let request = null;

  if (method === 'GET') {
    let path = process.env.REACT_APP_API_ENDPOINT + url;
    if (!isEmpty(data)) {
      path += '?' + qs.stringify(data);
    }
    headers = headers || {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    request = fetch(path, { headers });
  } else if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    headers = headers || {};
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json;charset=UTF-8';
    }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    request = fetch(process.env.REACT_APP_API_ENDPOINT + url, {
      method,
      body: (data instanceof FormData) ? data : JSON.stringify(data),
      headers
    });
  } else if (method === 'DELETE') {
    headers = headers || {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    request = fetch(process.env.REACT_APP_API_ENDPOINT + url, {
      method,
      headers
    });
  }

  if (!request) {
    return;
  }
  onStart();
  request.then(response => {
    if (response.ok) {
      return response.json().then(json => {
        if (json.success === false) {
          if (json.errors) {
            onError(json.errors);
          } else if (json.error) {
            onError(json.error);
          } else {
            throw new Error('Unknown Error');
          }
          return;
        }
        onSuccess(json);
      });
    } else {
      const text = HttpStatus.getStatusText(response.status);
      throw new Error(text);
    }
  }).catch(error => {
    console.log(url, error);
    onError(error.message);

    if (error.response && error.response.status === 403) {
      onAccessDenied(url);
    }
  });
}

export default apiMiddleware;
