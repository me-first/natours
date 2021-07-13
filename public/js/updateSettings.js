/*eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';

//type is either password or data
//data is data object containing name,email etc
export const updateSettings = async (data, type) => {
  try {
    const updateWhat = type === 'password' ? 'updateMyPassword' : 'updateMe';
    const result = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${updateWhat}`,
      data
    });
    if (result.data.status === 'success') {
      showAlert(
        'success',
        `Your ${type === 'password' ? 'password' : 'data'} updated successfully`
      );
      setTimeout(() => location.reload(true), 2000);
    }
  } catch (err) {
    if (err.response.data.status === 'error')
      showAlert('error', 'Something went wrong. Try Again!');
  }
};
