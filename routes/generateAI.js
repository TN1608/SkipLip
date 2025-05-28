const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Hàm tạo caption
const GeneratePostCaptions = async (socialNetwork, subject, tone) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Create 5 captions for a post on ${socialNetwork} about "${subject}" with a ${tone} tone. Each caption should be a maximum of 280 characters and suitable for the platform.`;
        const result = await model.generateContent(prompt);
        return result.response.text().split('\n').filter(c => c.trim()).slice(0, 5);
    } catch (error) {
        throw new Error(`Failed to generate captions: ${error.message}`);
    }
};

// Hàm tạo ý tưởng
const GetPostIdeas = async (topic) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Generate 5 post ideas about "${topic}" for social media. Each idea should be concise and a maximum of 100 characters.`;
        const result = await model.generateContent(prompt);
        return result.response.text().split('\n').filter(i => i.trim()).slice(0, 5);
    } catch (error) {
        throw new Error(`Failed to generate ideas: ${error.message}`);
    }
};

// Hàm tạo caption từ ý tưởng
const CreateCaptionsFromIdeas = async (idea) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Create 5 captions based on the post idea: "${idea}". Each caption should be a maximum of 280 characters and suitable for social media.`;
        const result = await model.generateContent(prompt);
        return result.response.text().split('\n').filter(c => c.trim()).slice(0, 5);
    } catch (error) {
        throw new Error(`Failed to generate captions from idea: ${error.message}`);
    }
};

// Export các hàm
module.exports = {
    GeneratePostCaptions,
    GetPostIdeas,
    CreateCaptionsFromIdeas
};