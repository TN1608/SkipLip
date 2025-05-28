import axiosConfig from "@utils/axiosConfig.js";

const authServices = {
    getUser: async (phone) => {
        try {
            const response = await axiosConfig.get('/users/get-user', {
                params: phone,
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
    getUserGeneratedContents: async (phone) => {
        try {
            const response = await axiosConfig.get('/api/get-user-generated-contents', {}, {
                params: phone,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user generated contents:', error.message);
            throw new Error(`Failed to fetch user generated contents: ${error.message}`);
        }
    },
    saveGeneratedContent: async (body) => {
        try {
            const response = await axiosConfig.post('/api/save-generated-content', body);
            return response.data;
        } catch (error) {
            console.error('Error saving generated content:', error.message);
            throw new Error(`Failed to save generated content: ${error.message}`);
        }
    },

    unSaveContent: async (captionId) => {
        try {
            const response = await axiosConfig.post('/api/unsave-content', {
                captionId
            });
            return response.data;
        } catch (error) {
            console.error('Error unsaving content:', error.message);
            throw new Error(`Failed to unsave content: ${error.message}`);
        }
    }
}

export default authServices;