const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Hàm tạo caption
const GeneratePostCaptions = async (socialNetwork, subject, tone) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Tạo 5 caption cho bài đăng trên ${socialNetwork} về chủ đề "${subject}" với giọng điệu ${tone}. Mỗi caption tối đa 280 ký tự, phù hợp với nền tảng.`;
        const result = await model.generateContent(prompt);
        const captions = result.response.text().split('\n').filter(c => c.trim()).slice(0, 5);
        return captions;
    } catch (error) {
        throw new Error(`Failed to generate captions: ${error.message}`);
    }
};

// Hàm tạo ý tưởng
const GetPostIdeas = async (topic) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Tạo 5 ý tưởng bài đăng về chủ đề "${topic}" cho mạng xã hội. Mỗi ý tưởng ngắn gọn, tối đa 100 ký tự.`;
        const result = await model.generateContent(prompt);
        const ideas = result.response.text().split('\n').filter(i => i.trim()).slice(0, 5);
        return ideas;
    } catch (error) {
        throw new Error(`Failed to generate ideas: ${error.message}`);
    }
};

// Hàm tạo caption từ ý tưởng
const CreateCaptionsFromIdeas = async (idea) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Tạo 5 caption dựa trên ý tưởng bài đăng: "${idea}". Mỗi caption tối đa 280 ký tự, phù hợp với mạng xã hội.`;
        const result = await model.generateContent(prompt);
        const captions = result.response.text().split('\n').filter(c => c.trim()).slice(0, 5);
        return captions;
    } catch (error) {
        throw new Error(`Failed to generate captions from idea: ${error.message}`);
    }
};