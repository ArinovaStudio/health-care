import axios from "axios";

export async function signupAction(user) {
    try {
        const res = await axios.post(`/api/auth/register`, user);
        return res.data;
    } catch(error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Registration failed'
        }
    }    
}

export async function logInAction(user) {
    try {
        const res = await axios.post(`/api/auth/login`, user, {
            withCredentials: true
        });
        return res.data
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Verification failed'
        };
    }
}
export async function logOutAction() {
        const res = await axios.post(`/api/auth/logout`,
            {},
            {
                withCredentials: true
            });
        return res.data
    }

