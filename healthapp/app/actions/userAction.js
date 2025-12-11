import axios from 'axios';

export async function userAction() {
  try {
    const res = await axios.get(`/api/profile`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Verification failed'
    };
  }
}

export async function editProfileAction(personalInfo, insuranceInfo) {
  try {
    const res = await axios.patch(`/api/profile`, {personalInfo, insuranceInfo}, { withCredentials: true });
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Verification failed'
    };
  }
}

export async function addAllergy(allergy) {
  try {
    const res = await axios.post(`/api/profile/allergy`, {allergy}, { withCredentials: true });
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Verification failed'
    };
  }
}

export async function deleteAllergy(id) {
  try {
    const res = await axios.delete(`/api/profile/allergy/${id}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Verification failed'
    };
  }
}

export async function addChronic(chronicCondition) {
  try {
    const res = await axios.post(`/api/profile/chronic-condition`,{ chronicCondition }, { withCredentials: true });
    return res.data;
  } catch (error) {3
    return {
      success: false,
      message: error.response?.data?.message || 'Verification failed'
    };
  }
}

export async function deleteChronic(id) {
  try {
    const res = await axios.delete(`/api/profile/chronic-condition/${id}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Verification failed'
    };
  }
}


