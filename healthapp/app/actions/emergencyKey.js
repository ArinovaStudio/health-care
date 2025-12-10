import axios from "axios";
import { backendUrl } from "./auth";

export async function generateKeyAction() {
    try {
        const res = await axios.post(`${backendUrl}/api/profile/generate-emergency-key`,{} ,{ withCredentials: true });
        return res.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Verification failed'
        };
    }
}