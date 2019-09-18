// action types
export const API_REQUEST = 'API_REQUEST';
export const API_SUCCESS = 'API_SUCCESS';
export const API_ERROR = 'API_ERROR';

// action creators
export const apiRequest = (body: string, method: string, url: string, feature: string, data: any) => ({
  type: `${feature} ${API_REQUEST}`,
  payload: body,
  data,
  meta: {body, method, url, feature},
});

export const apiSuccess = (response: Response, feature: string, data: any) => ({
  type: `${feature} ${API_SUCCESS}`,
  payload: response,
  data,
  meta: {feature},
});

export const apiError = (error, feature: string, data: any) => ({
  type: `${feature} ${API_ERROR}`,
  payload: error,
  data,
  meta: {feature},
});
