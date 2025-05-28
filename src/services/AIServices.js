import axiosConfig from "@utils/axiosConfig.js";

const AIServices = {
    generatePostCaptions: async (body) => {
        try {
            const response = await axiosConfig.post('/api/generate-post-captions', body);
            return response.data;
        } catch (error) {
            console.error('Error generating post captions:', error.message);
            throw new Error(`Failed to generate post captions: ${error.message}`);
        }
    },
    getPostIdeas: async (topic) => {
        try {
            const response = await axiosConfig.post('/api/get-post-ideas', {}, {
                params: { topic },
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error getting post ideas:', error.message);
            throw new Error(`Failed to get post ideas: ${error.message}`);
        }
    },
    createCaptionsFromIdeas: async (idea) => {
        try {
            const response = await axiosConfig.post('/api/create-captions-from-ideas', { idea });
            return response.data;
        } catch (error) {
            console.error('Error creating captions from ideas:', error.message);
            throw new Error(`Failed to create captions from ideas: ${error.message}`);
        }
    },
}

export default AIServices;