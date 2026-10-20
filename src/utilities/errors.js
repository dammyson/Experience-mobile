import {SESSION_EXPIRED_MESSAGE} from '../services/api';

// The request never got a response, so the server may or may not have acted on it
export const isNetworkError = error =>
  /network request failed|network error|timed? ?out/i.test(error?.message ?? error ?? '');

export const isSessionExpired = error => (error?.message ?? error) === SESSION_EXPIRED_MESSAGE;
