import * as types from './types';

export const apiRequest = ({
  url,
  method,
  data = null,
  accessToken = null,
  onStart = () => {},
  onSuccess = () => {},
  onError = () => {},
  onAccessDenied = () => {},
  headers = null
}) => ({
  type: types.API_REQUEST,
  payload: {
    url,
    method,
    data,
    accessToken,
    onStart,
    onSuccess,
    onError,
    onAccessDenied,
    headers
  }
})
