import axiosConfig from "@utils/axiosConfig.js";

const authServices = {
    getUser: async (phone) => {
        try {
            const response = await axiosConfig.get('/users/get-user', {
                params: {phone},
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error.message);
            throw new Error(`Failed to fetch user: ${error.message}`);
        }
    },
    sendOTP: async (phone) => {
        try {
            const response = await axiosConfig.post('/api/send-otp', {
                    phone: phone,
                });
            return response.data;
        } catch (error) {
            console.error('Error sending OTP:', error.message);
            throw new Error(`Failed to send OTP: ${error.message}`);
        }
    },
    verifyOTP: async (phone, code) => {
        try {
            const response = await axiosConfig.post('/api/verify-otp', {phone, code}, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error verifying OTP:', error.message);
            throw new Error(`Failed to verify OTP: ${error.message}`);
        }
    },
}

export default authServices;