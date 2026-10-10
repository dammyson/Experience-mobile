import AsyncStorage from '@react-native-async-storage/async-storage';
import {authAPI, customerAPI} from '../services/api';

export const login = (email, password) => async dispatch => {
  dispatch({type: 'AUTH_LOADING'});
  try {
    const response = await authAPI.login({email, password});
    const {user, token, refresh_token} = response.data;

    await AsyncStorage.setItem('token', token);
    if (refresh_token) {
      await AsyncStorage.setItem('refreshToken', refresh_token);
    }
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');

    dispatch({type: 'AUTH_SUCCESS', payload: {user, token}});

    // Fetch full profile after login
    try {
      const profileResponse = await customerAPI.getProfile();
      const profileData = profileResponse.data;
      await AsyncStorage.setItem('profile', JSON.stringify(profileData));
      dispatch({type: 'PROFILE_SUCCESS', payload: profileData});
    } catch (profileError) {
      console.log('Failed to fetch profile after login:', profileError.message);
    }
  } catch (error) {
    dispatch({type: 'AUTH_ERROR', payload: error?.message || 'Login failed'});
  }
};

export const register = ({firstName, lastName, email, phoneNumber, password}) => async dispatch => {
  dispatch({type: 'AUTH_LOADING'});
  try {
    const response = await authAPI.register({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    });
    dispatch({type: 'REGISTER_SUCCESS', payload: response});
    return response;
  } catch (error) {
    dispatch({type: 'AUTH_ERROR', payload: error?.message || 'Registration failed'});
    throw error;
  }
};

export const getProfile = () => async dispatch => {
  dispatch({type: 'PROFILE_LOADING'});
  try {
    const response = await customerAPI.getProfile();
    const profileData = response.data;

    await AsyncStorage.setItem('profile', JSON.stringify(profileData));
    dispatch({type: 'PROFILE_SUCCESS', payload: profileData});
    return profileData;
  } catch (error) {
    dispatch({type: 'PROFILE_ERROR', payload: error?.message || 'Failed to fetch profile'});
    throw error;
  }
};

export const loadUserFromStorage = () => async dispatch => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userStr = await AsyncStorage.getItem('user');
    const profileStr = await AsyncStorage.getItem('profile');

    if (token && userStr) {
      const user = JSON.parse(userStr);
      dispatch({type: 'AUTH_SUCCESS', payload: {user, token}});

      if (profileStr) {
        const profile = JSON.parse(profileStr);
        dispatch({type: 'PROFILE_SUCCESS', payload: profile});
      }

      // Refresh profile from API
      try {
        const response = await customerAPI.getProfile();
        const freshProfile = response.data;
        await AsyncStorage.setItem('profile', JSON.stringify(freshProfile));
        dispatch({type: 'PROFILE_SUCCESS', payload: freshProfile});
      } catch (err) {
        console.log('Failed to refresh profile:', err.message);
      }
    }
  } catch (error) {
    console.log('Failed to load user from storage:', error.message);
  }
};

export const logout = () => async dispatch => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('profile');
  } catch (error) {
    console.log('Error clearing storage:', error);
  }
  dispatch({type: 'AUTH_LOGOUT'});
};
