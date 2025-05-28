import { useState, useEffect } from 'react';
import { Typography, Card, Button, Space, Empty, Spin, message, Popconfirm, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import AuthServices from "@/api/AuthServices.js";
import AIServices from "@/api/AIServices.js"; // Assuming your alias @ points to src

const { Title, Paragraph, Text } = Typography;

export const ProfileSection = ({ currentUserPhone }) => {
    const [userContent, setUserContent] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUserContent = async () => {
        if (!currentUserPhone) {
            setLoading(false);
            setUserContent([]);
            return;
        }
        setLoading(true);
        try {
            const content = await AuthServices.getUserGeneratedContents({ currentUserPhone });

            const transformContent = content.map(item => ({
                id: item.id,
                topic: item.topic || "Untitled",
                captions: Array.isArray(item.data) ? item.data : [item.data],
                savedAt: item.createdAt
            }));
            transformContent.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
            setUserContent(transformContent);
        } catch (error) {
            message.error("Failed to load your saved content.");
            console.error("Error fetching user content:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserContent();
    }, [currentUserPhone]);

    const handleUnsave = async (contentId) => {
        if (!currentUserPhone) return;
        try {
            await AIServices.unSaveContent({ captionId: contentId });
            message.success("Content removed successfully!");
            // Refresh content
            fetchUserContent();
        } catch (error) {
            message.error("Failed to remove content.");
            console.error("Error unsaving content:", error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spin size="large" tip="Loading your content..." /></div>;
    }

    if (!currentUserPhone) {
        return (
            <div className="text-center p-8">
                <Title level={3}>Profile</Title>
                <Paragraph>Please log in to view and manage your saved captions.</Paragraph>
            </div>
        );
    }


    if (userContent.length === 0) {
        return (
            <div className="text-center p-8">
                <Title level={3} className="mb-6">Your Saved Content</Title>
                <Empty description="You haven't saved any captions yet. Start creating in the Services section!" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:p-8"
        >
            <Title level={2} className="mb-6">Your Saved Content</Title>
            <Space direction="vertical" size="middle" className="w-full">
                {userContent.map((item) => (
                    <Card
                        key={item.id}
                        title={<Text strong>{item.topic || "Saved Caption Set"}</Text>}
                        hoverable
                        extra={
                            <Popconfirm
                                title="Are you sure you want to delete this saved content?"
                                onConfirm={() => handleUnsave(item.id)}
                                okText="Yes, Delete"
                                cancelText="No"
                            >
                                <Button icon={<DeleteOutlined />} danger type="text">
                                    Unsave
                                </Button>
                            </Popconfirm>
                        }
                    >
                        {item.captions && item.captions.map((caption, index) => (
                            <Paragraph key={index} copyable={{ tooltips: ['Copy', 'Copied!']}} className="mb-1 pl-4 border-l-2 border-blue-500">
                                {caption}
                            </Paragraph>
                        ))}
                        <Text type="secondary" style={{ fontSize: '0.8em', display: 'block', marginTop: '8px' }}>
                            Saved on: {new Date(item.savedAt).toLocaleDateString()}
                        </Text>
                    </Card>
                ))}
            </Space>
        </motion.div>
    );
};