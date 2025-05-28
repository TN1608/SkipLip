import {useState} from "react";
import {Button, Input, Card, Typography, Space, message, Spin} from "antd";
import {motion} from "framer-motion";
import AIServices from "@/services/AIServices.js";
import {ChatUI} from "@fragments/ChatUI.jsx";

const {Title, Paragraph} = Typography;

export const ServiceSection = ({currentUserPhone}) => {
    const [view, setView] = useState('initial');
    const [topicInput, setTopicInput] = useState('');
    const [ideas, setIdeas] = useState([]);
    const [selectedIdeaForChat, setSelectedIdeaForChat] = useState(null);
    const [chatMode, setChatMode] = useState('scratch');
    const [loading, setLoading] = useState(false);

    const handleStartFromScratch = () => {
        setChatMode('scratch');
        setView('chat');
    };

    const handleGetInspired = () => {
        setView('get_inspired_topic');
        setIdeas([]);
        setTopicInput('');
    };

    const handleTopicSubmit = async () => {
        if (!topicInput.trim()) {
            message.error("Please enter a topic.");
            return;
        }
        setLoading(true);
        try {
            const fetchedIdeas = await AIServices.getPostIdeas(topicInput);
            setIdeas(fetchedIdeas);
            setView('show_ideas');
        } catch (error) {
            message.error("Failed to fetch ideas. Please try again.");
            console.error("Error fetching ideas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleIdeaSelect = (idea) => {
        setSelectedIdeaForChat(idea);
        setChatMode('from_idea');
        setView('chat');
    };

    const resetToInitial = () => {
        setView('initial');
        setTopicInput('');
        setIdeas([]);
        setSelectedIdeaForChat(null);
    }

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spin size="large"/></div>;
    }

    if (view === 'chat') {
        return <ChatUI mode={chatMode} initialIdea={selectedIdeaForChat} onBack={resetToInitial}
                       currentUserPhone={currentUserPhone}/>;
    }

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.5}}
            className="p-4 md:p-8"
        >
            {view === 'initial' && (
                <div className="text-center">
                    <Title level={2} className="mb-6">How would you like to start?</Title>
                    <Space direction="vertical" size="large" className="w-full md:w-1/2">
                        <Button type="primary" block size="large" onClick={handleStartFromScratch}>
                            🚀 Start from Scratch
                        </Button>
                        <Button block size="large" onClick={handleGetInspired}>
                            💡 Get Inspired (Find Ideas)
                        </Button>
                    </Space>
                </div>
            )}

            {view === 'get_inspired_topic' && (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 20}}
                    className="max-w-lg mx-auto"
                >
                    <Button onClick={() => setView('initial')} className="mb-4">Back</Button>
                    <Title level={3} className="mb-4 text-center">Get Inspired</Title>
                    <Paragraph className="text-center mb-6">What topic do you want ideas for?</Paragraph>
                    <div className={"flex flex-col gap-2 items-center"}>
                        <Input
                            placeholder="e.g., Summer travel, Healthy recipes, AI technology"
                            value={topicInput}
                            onChange={(e) => setTopicInput(e.target.value)}
                            onPressEnter={handleTopicSubmit}
                            size="large"
                            className="mb-4"
                        />
                        <Button type="primary" block size="large" onClick={handleTopicSubmit} loading={loading}>
                            Find Ideas
                        </Button>
                    </div>
                </motion.div>
            )}

            {view === 'show_ideas' && (
                <div className="max-w-xl mx-auto">
                    <Button onClick={() => setView('get_inspired_topic')} className="mb-4">Back</Button>
                    <Title level={3} className="mb-4 text-center">Here are some ideas for "{topicInput}":</Title>
                    {ideas.length > 0 ? (
                        <Space direction="vertical" className="w-full">
                            {ideas.map((idea, index) => (
                                <Card key={index} hoverable onClick={() => handleIdeaSelect(idea)}
                                      className="cursor-pointer">
                                    <Paragraph>{idea}</Paragraph>
                                </Card>
                            ))}
                        </Space>
                    ) : (
                        <Paragraph className="text-center">No ideas found for this topic. Try another one!</Paragraph>
                    )}
                </div>
            )}
        </motion.div>
    );
};