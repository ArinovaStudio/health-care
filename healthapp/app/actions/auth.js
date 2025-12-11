import axios from "axios";

export const backendUrl = "";

export async function signupAction(user) {
    const res = await axios.post(`/api/auth/register`, user);
    return res.data;
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

export async function logOutAction(user) {
    const res = await axios.post(`/api/auth/logout`, user,
        {
            withCredentials: true
        });
    return res.data
}

