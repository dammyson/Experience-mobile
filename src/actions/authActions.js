import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = (email, password) => async dispatch => {
  dispatch({type: 'AUTH_LOADING'});
  try {
    // TODO: replace with real API call
    // const response = await api.post('/auth/login', {email, password});
    // const {user, token} = response.data;
    // await AsyncStorage.setItem('token', token);
    const mockUser = {id: '1', email};
    const mockToken = 'mock-token';
    await AsyncStorage.setItem('token', mockToken);
    dispatch({type: 'AUTH_SUCCESS', payload: {user: mockUser, token: mockToken}});
  } catch (error) {
    dispatch({type: 'AUTH_ERROR', payload: error?.message || 'Login failed'});
  }
};

export const logout = () => async dispatch => {
  await AsyncStorage.removeItem('token');
  dispatch({type: 'AUTH_LOGOUT'});
};
