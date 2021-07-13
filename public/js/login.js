/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email: email,
        password: password
      }
    });

    if (result.data.status === 'success') {
      showAlert('success', 'You Logged In Successfully!');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    console.log(result);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const result = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    });
    if (result.data.status === 'success') {
      showAlert('success', 'Logged Out Successfully');
      location.reload(true); //Page will reload again including its catch memory
    }
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Logout Failed! Try Again.');
  }
};
