import axios from 'axios';
import { backendUrl } from './auth';

export async function verifyOtpAction(email, otp) {
    try {
        console.log("backend", email)
        const res = await axios.post(`${backendUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true });
        return res.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Verification failed'
        };
    }
}

export async function resendOtpAction(email) {
    try {
        const res = await axios.post(`${backendUrl}/api/auth/resend-otp`,{ email });
        console.log(res)
        return res.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to resend OTP'
        };
    }
}
