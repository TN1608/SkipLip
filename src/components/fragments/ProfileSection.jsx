import { useState, useEffect } from 'react';
import {Typography, Card, Button, Space, Empty, Spin, message, Popconfirm, Tag, Menu, Tooltip, Dropdown} from 'antd';
import {
    DeleteOutlined,
    FacebookFilled,
    InstagramOutlined,
    MailOutlined,
    ShareAltOutlined,
    TwitterOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import AuthServices from "@/api/AuthServices.js";

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
            const content = await AuthServices.getUserGeneratedContents(currentUserPhone);
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
            await AuthServices.unSaveContent(contentId);
            message.success("Content removed successfully!");
            fetchUserContent();
        } catch (error) {
            message.error("Failed to remove content.");
            console.error("Error unsaving content:", error);
        }
    };

    const handleShareMenuClick = (captionText, { key }) => {
        const encodedText = encodeURIComponent(captionText);
        let shareUrl = '';
        switch (key) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=&quote=${encodedText}`;
                window.open(shareUrl, '_blank');
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
                window.open(shareUrl, '_blank');
                break;
            case 'instagram':
                navigator.clipboard.writeText(captionText)
                    .then(() => message.success("Caption copied! Paste it into your Instagram post."))
                    .catch(() => message.error("Failed to copy caption."));
                break;
            case 'email':
                shareUrl = `mailto:?subject=Check%20out%20this%20caption&body=${encodedText}`;
                window.open(shareUrl, '_self');
                break;
            default:
                break;
        }
    };

    const getShareMenu = (captionText) => (
        <Menu
            onClick={(info) => handleShareMenuClick(captionText, info)}
            items={[
                {
                    key: 'facebook',
                    icon: <FacebookFilled style={{color: '#1877f3'}} />,
                    label: 'Share on Facebook',
                },
                {
                    key: 'twitter',
                    icon: <TwitterOutlined style={{color: '#1da1f2'}} />,
                    label: 'Share on Twitter',
                },
                {
                    key: 'instagram',
                    icon: <InstagramOutlined style={{color: '#e4405f'}} />,
                    label: 'Copy for Instagram',
                },
                {
                    key: 'email',
                    icon: <MailOutlined />,
                    label: 'Share via Email',
                },
            ]}
        />
    );

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
                            <Space>
                                <Paragraph
                                    key={index}
                                    copyable={{ tooltips: ['Copy', 'Copied!'] }}
                                    className="mb-1 pl-4 border-l-2 border-blue-500"
                                    style={{ marginBottom: 0 }}
                                >
                                    {caption}
                                </Paragraph>
                                <Tooltip title="Share">
                                    <Dropdown overlay={getShareMenu(caption)} trigger={['click']}>
                                        <Button icon={<ShareAltOutlined />} />
                                    </Dropdown>
                                </Tooltip>
                            </Space>
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