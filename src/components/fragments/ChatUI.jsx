import React, { useState, useEffect } from 'react';
import { Button, Input, Card, List, message, Divider, Spin, Modal } from 'antd';
import { motion } from 'framer-motion';
import { FaSave, FaShareAlt, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const ChatUI = ({ phoneNumber, serviceType }) => {
    const [step, setStep] = useState(1);
    const [socialNetwork, setSocialNetwork] = useState('');
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('');
    const [ideas, setIdeas] = useState([]);
    const [selectedIdea, setSelectedIdea] = useState('');
    const [captions, setCaptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [savedContents, setSavedContents] = useState([]);

    // Tones for "Start from Scratch"
    const tones = [
        'Friendly', 'Luxury', 'Relaxed', 'Professional', 'Bold',
        'Adventurous', 'Witty', 'Persuasive', 'Empathetic'
    ];

    // Load saved contents on mount
    useEffect(() => {
        if (phoneNumber) {
            fetchSavedContents();
        }
    }, [phoneNumber]);

    // Fetch saved contents
    const fetchSavedContents = async () => {
        try {
            const response = await axios.get('/api/auth/get-user-generated-contents', {
                params: { phone_number: phoneNumber }
            });
            setSavedContents(response.data);
        } catch (error) {
            message.error('Failed to load saved contents');
        }
    };

    // Handle social media selection
    const handleSocialMediaSelect = (platform) => {
        setSocialNetwork(platform);
        setStep(2);
    };

    // Handle topic submission
    const handleTopicSubmit = async () => {
        if (!topic) {
            message.error('Please enter a topic');
            return;
        }
        if (serviceType === 'start-from-scratch') {
            setStep(3);
        } else if (serviceType === 'get-inspired') {
            setLoading(true);
            try {
                const response = await axios.post('/api/auth/get-post-ideas', { topic });
                setIdeas(response.data);
                setStep(4);
            } catch (error) {
                message.error('Failed to generate ideas');
            }
            setLoading(false);
        }
    };

    // Handle tone selection
    const handleToneSelect = async (selectedTone) => {
        setTone(selectedTone);
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/generate-post-captions', {
                socialNetwork,
                subject: topic,
                tone: selectedTone
            });
            setCaptions(response.data);
            setStep(4);
        } catch (error) {
            message.error('Failed to generate captions');
        }
        setLoading(false);
    };

    // Handle idea selection
    const handleIdeaSelect = async (idea) => {
        setSelectedIdea(idea);
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/create-captions-from-ideas', { idea });
            setCaptions(response.data);
            setStep(5);
        } catch (error) {
            message.error('Failed to generate captions');
        }
        setLoading(false);
    };

    // Handle save caption
    const handleSave = async (caption) => {
        try {
            await axios.post('/api/auth/save-generated-content', {
                topic: serviceType === 'start-from-scratch' ? `${socialNetwork} - ${topic}` : selectedIdea,
                data: caption,
                phoneNumber
            });
            message.success('Caption saved successfully');
            fetchSavedContents();
        } catch (error) {
            message.error('Failed to save caption');
        }
    };

    // Handle share caption
    const handleShare = (caption) => {
        Modal.info({
            title: 'Share Caption',
            content: (
                <div>
                    <p>{caption}</p>
                    <p>Copy the caption above or share it directly on your preferred platform!</p>
                </div>
            ),
            onOk() {}
        });
    };

    // Handle unsave caption
    const handleUnsave = async (captionId) => {
        try {
            await axios.post('/api/auth/unsave-content', { captionId });
            message.success('Caption unsaved successfully');
            fetchSavedContents();
        } catch (error) {
            message.error('Failed to unsave caption');
        }
    };

    return (
        <div className="bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen py-10 px-4">
            <motion.div
                className="container mx-auto max-w-3xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h2
                    className="text-3xl font-bold mb-8 text-center text-gray-800"
                    variants={itemVariants}
                >
                    {serviceType === 'start-from-scratch' ? 'Create Your Caption' : 'Get Inspired'}
                </motion.h2>

                {loading ? (
                    <div className="text-center">
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        {step === 1 && serviceType === 'start-from-scratch' && (
                            <motion.div variants={itemVariants}>
                                <p className="text-lg mb-4 text-center">
                                    Which social media platform would you like to create a caption for?
                                </p>
                                <div className="flex justify-center gap-4">
                                    {['Facebook', 'Instagram', 'Twitter'].map((platform) => (
                                        <Button
                                            key={platform}
                                            type="primary"
                                            size="large"
                                            onClick={() => handleSocialMediaSelect(platform)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {platform}
                                        </Button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {(step === 2 || (step === 1 && serviceType === 'get-inspired')) && (
                            <motion.div variants={itemVariants}>
                                <p className="text-lg mb-4 text-center">
                                    {serviceType === 'start-from-scratch'
                                        ? `What topic do you want a caption for on ${socialNetwork}?`
                                        : 'What topic do you want ideas for?'}
                                </p>
                                <Input
                                    placeholder="Enter your topic"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="mb-4"
                                    size="large"
                                />
                                <div className="text-center">
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={handleTopicSubmit}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Submit <FaArrowRight className="ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && serviceType === 'start-from-scratch' && (
                            <motion.div variants={itemVariants}>
                                <p className="text-lg mb-4 text-center">
                                    What should your caption sound like?
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    {tones.map((toneOption) => (
                                        <Button
                                            key={toneOption}
                                            type={tone === toneOption ? 'primary' : 'default'}
                                            onClick={() => handleToneSelect(toneOption)}
                                            className={tone === toneOption ? 'bg-blue-600' : 'bg-gray-200 text-black'}
                                        >
                                            {toneOption}
                                        </Button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && serviceType === 'get-inspired' && (
                            <motion.div variants={itemVariants}>
                                <p className="text-lg mb-4 text-center">Select an idea:</p>
                                <List
                                    dataSource={ideas}
                                    renderItem={(idea) => (
                                        <List.Item>
                                            <Card
                                                hoverable
                                                onClick={() => handleIdeaSelect(idea)}
                                                className="w-full"
                                            >
                                                {idea}
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </motion.div>
                        )}

                        {(step === 4 && serviceType === 'start-from-scratch') || (step === 5 && serviceType === 'get-inspired') ? (
                            <motion.div variants={itemVariants}>
                                <p className="text-lg mb-4 text-center">Generated Captions:</p>
                                <List
                                    grid={{ gutter: 16, column: 1 }}
                                    dataSource={captions}
                                    renderItem={(caption, index) => (
                                        <List.Item>
                                            <Card
                                                title={`Caption ${index + 1}`}
                                                extra={
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="link"
                                                            onClick={() => handleSave(caption)}
                                                            icon={<FaSave />}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            type="link"
                                                            onClick={() => handleShare(caption)}
                                                            icon={<FaShareAlt />}
                                                        >
                                                            Share
                                                        </Button>
                                                    </div>
                                                }
                                            >
                                                {caption}
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </motion.div>
                        ) : null}

                        {savedContents.length > 0 && (
                            <motion.div variants={itemVariants} className="mt-12">
                                <Divider>Saved Contents</Divider>
                                <List
                                    grid={{ gutter: 16, column: 1 }}
                                    dataSource={savedContents}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <Card
                                                title={item.topic}
                                                extra={
                                                    <Button
                                                        type="link"
                                                        onClick={() => handleUnsave(item.id)}
                                                        className="text-red-500"
                                                    >
                                                        Unsave
                                                    </Button>
                                                }
                                            >
                                                {item.data}
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </motion.div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ChatUI;