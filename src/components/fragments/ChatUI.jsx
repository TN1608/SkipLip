import {useState, useEffect, useRef} from "react";
import {
    Input,
    Button,
    Card,
    Avatar,
    Space,
    Select,
    Typography,
    message,
    Spin,
    Tag,
    Tooltip,
    Dropdown,
    Menu
} from "antd";
import {
    UserOutlined,
    RobotOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
    ShareAltOutlined,
    FacebookFilled, TwitterOutlined, InstagramOutlined, MailOutlined
} from '@ant-design/icons';
import {motion, AnimatePresence} from "framer-motion";
import AIServices from "@/services/AIServices.js";
import AuthServices from "@/services/AuthServices.js";

const {Paragraph, Text} = Typography;
const {Option} = Select;

const socialNetworks = ["Facebook", "Instagram", "Twitter"];
const tones = ["Friendly", "Luxury", "Relaxed", "Professional", "Bold", "Adventurous", "Witty", "Persuasive", "Empathetic"];

export const ChatUI = ({mode, initialIdea, onBack, currentUserPhone}) => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentStage, setCurrentStage] = useState(''); // e.g., 'ask_social', 'ask_topic', 'ask_tone', 'show_captions'
    const [formData, setFormData] = useState({
        socialNetwork: '',
        subject: '',
        tone: '',
        idea: initialIdea || ''
    });
    const [generatedCaptions, setGeneratedCaptions] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(scrollToBottom, [messages, generatedCaptions]);

    useEffect(() => {
        // Initial setup based on mode
        setMessages([]);
        setGeneratedCaptions([]);
        setFormData({socialNetwork: '', subject: '', tone: '', idea: initialIdea || ''});

        if (mode === 'scratch') {
            addAiMessage("Let's create some captions! Which social media platform are you targeting?", 'options', socialNetworks.map(n => ({
                value: n,
                label: n
            })));
            setCurrentStage('ask_social');
        } else if (mode === 'from_idea' && initialIdea) {
            addAiMessage(`Great! Let's create captions based on the idea: "${initialIdea}". Generating now...`);
            setCurrentStage('generate_from_idea');

            const fetchCaptions = async () => {
                setIsLoading(true);
                try {
                    const captions = await AIServices.createCaptionsFromIdeas(initialIdea);
                    setGeneratedCaptions(captions.map(cap => ({
                        id: Date.now() + Math.random(),
                        text: cap,
                        isSaved: false
                    })));
                    addAiMessage("Here are some captions based on your idea:", "captions_display");
                    setCurrentStage('show_captions');
                } catch (error) {
                    message.error("Failed to generate captions from idea.");
                    addAiMessage("Sorry, I couldn't generate captions for that idea. Would you like to try again or start from scratch?", "error");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCaptions();
        }
    }, [mode, initialIdea]);

    const addMessage = (text, sender, type = 'text', options = []) => {
        setMessages(prev => [...prev, {id: Date.now(), text, sender, type, options}]);
    };

    const addAiMessage = (text, type = 'text', options = []) => addMessage(text, 'ai', type, options);
    const addUserMessage = (text) => addMessage(text, 'user');

    const handleUserInput = async (value) => {
        const inputText = value.trim();
        if (!inputText && currentStage !== 'select_option') return;

        let nextStage = currentStage;
        let aiResponseText = "";
        let aiResponseType = 'text';
        let aiOptions = [];

        if (currentStage !== 'select_option') {
            addUserMessage(inputText);
        }
        setUserInput('');
        setIsLoading(true);

        let finalTone;

        try {
            if (currentStage === 'ask_social') {
                setFormData(prev => ({...prev, socialNetwork: inputText}));
                aiResponseText = `Got it, ${inputText}! Now, what topic do you want a caption for?`;
                nextStage = 'ask_topic';
            } else if (currentStage === 'ask_topic') {
                setFormData(prev => ({...prev, subject: inputText}));
                aiResponseText = `Interesting topic: "${inputText}"! What should your caption sound like?`;
                aiResponseType = 'options';
                aiOptions = tones.map(t => ({value: t, label: t}));
                nextStage = 'ask_tone';
            } else if (currentStage === 'ask_tone') {
                finalTone = inputText.trim();
                setFormData(prev => ({...prev, tone: finalTone}));
                aiResponseText = `Perfect! Generating ${finalTone} captions for ${formData.socialNetwork} about "${formData.subject}"...`;
                nextStage = 'generate_scratch';
            }

            if (nextStage === 'generate_scratch') {
                addAiMessage(aiResponseText);
                const body = {
                    socialNetwork: formData.socialNetwork,
                    subject: formData.subject,
                    tone: (currentStage === 'ask_tone' && finalTone ? finalTone : formData.tone),
                }
                const captions = await AIServices.generatePostCaptions(body);
                setGeneratedCaptions(captions.map(cap => ({
                    id: Date.now() + Math.random(),
                    text: cap,
                    isSaved: false
                })));
                addAiMessage("Here are your generated captions:", "captions_display");
                nextStage = 'show_captions';
            } else if (aiResponseText) {
                addAiMessage(aiResponseText, aiResponseType, aiOptions);
            }
            setCurrentStage(nextStage);

        } catch (error) {
            console.error("ChatUI Error:", error);
            addAiMessage("Oops! Something went wrong. Please try again.");
            message.error("An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelect = (optionValue) => {
        // addUserMessage(`Selected: ${optionValue}`);
        setUserInput(optionValue); // Set the input to the selected option
        setCurrentStage('select_option');
        handleUserInput(optionValue);
    };


    const handleSaveCaption = async (captionIndex, captionText) => {
        if (!currentUserPhone) {
            message.error("You need to be logged in to save captions.");
            return;
        }

        try {
            const topicForSave = formData.subject || formData.idea || "General Caption";
            const body = {
                topic: topicForSave,
                data: captionText,
                phone: currentUserPhone
            }
            await AuthServices.saveGeneratedContent(body);
            message.success("Caption saved!");
            setGeneratedCaptions(prev => prev.map((cap, idx) => idx === captionIndex ? {...cap, isSaved: true} : cap));
        } catch (error) {
            message.error("Failed to save caption.");
        }
    };

    const handleShareMenuClick = (captionText, {key}) => {
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
                    icon: <FacebookFilled style={{color: '#1877f3'}}/>,
                    label: 'Share on Facebook',
                    type: 'item',
                },
                {
                    key: 'twitter',
                    icon: <TwitterOutlined style={{color: '#1da1f2'}}/>,
                    label: 'Share on Twitter',
                    type: 'item',
                },
                {
                    key: 'instagram',
                    icon: <InstagramOutlined style={{color: '#e4405f'}}/>,
                    label: 'Copy for Instagram',
                    type: 'item',
                },
                {
                    key: 'email',
                    icon: <MailOutlined/>,
                    label: 'Share via Email',
                    type: 'item',
                },
            ]}
        />
    );

    return (
        <div
            className="flex flex-col h-[calc(100vh-220px)] md:h-[calc(100vh-200px)] max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
            <div className="p-4 border-b flex items-center">
                <Button icon={<ArrowLeftOutlined/>} onClick={onBack} className="mr-4">Back</Button>
                <RobotOutlined className="mr-2 text-xl text-blue-500"/>
                <Text strong>Skipli AI Caption Generator</Text>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0}}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <Card
                                size="small"
                                className={`max-w-xs md:max-w-md lg:max-w-lg shadow ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                            >
                                {msg.sender === 'ai' && <Avatar size="small" icon={<RobotOutlined/>}
                                                                className="mr-2 bg-blue-100 text-blue-600"/>}
                                {msg.sender === 'user' && <Avatar size="small" icon={<UserOutlined/>}
                                                                  className="mr-2 bg-gray-100 text-gray-600"/>}
                                <Paragraph
                                    className={msg.sender === 'user' ? 'text-white mb-0' : 'mb-0'}>{msg.text}</Paragraph>
                                {msg.type === 'options' && msg.sender === 'ai' && (
                                    <Space wrap className="mt-2">
                                        {msg.options.map(opt => (
                                            <Button key={opt.value} size="small"
                                                    onClick={() => handleOptionSelect(opt.value)}>{opt.label}</Button>
                                        ))}
                                    </Space>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {generatedCaptions.length > 0 && currentStage === 'show_captions' && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col gap-4">
                        {generatedCaptions.map((caption, index) => (
                            <Card key={caption.id} className="mb-0 shadow-sm hover:shadow-md transition-shadow"
                                  size="small">
                                <Paragraph className="mb-2">{caption.text}</Paragraph>
                                {index !== 0 && (
                                    <Space>
                                        <Tooltip title="Save Caption">
                                            <Button
                                                icon={<SaveOutlined/>}
                                                onClick={() => handleSaveCaption(index, caption.text)}
                                                disabled={caption.isSaved}
                                            >
                                                {caption.isSaved ? 'Saved' : 'Save'}
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Share">
                                            <Dropdown overlay={getShareMenu(caption.text)} trigger={['click']}>
                                                <Button icon={<ShareAltOutlined/>}>Share</Button>
                                            </Dropdown>
                                        </Tooltip>
                                    </Space>
                                )}
                            </Card>
                        ))}
                        <Button type="dashed" onClick={onBack} className="mt-4">Create another caption</Button>
                    </motion.div>)}
                <div ref={messagesEndRef}/>
            </div>

            {currentStage !== 'show_captions' && currentStage !== 'generate_from_idea' && currentStage !== 'generate_scratch' && (
                <div className="p-4 border-t">
                    {isLoading && <div className="text-center mb-2"><Spin/> Thinking...</div>}
                    <Input.Search
                        placeholder={
                            currentStage === 'ask_social' ? "e.g., Facebook, Instagram..." :
                                currentStage === 'ask_topic' ? "e.g., Summer vacation, New product launch..." :
                                    currentStage === 'ask_tone' ? "Type or select a tone..." :
                                        "Type your message..."
                        }
                        enterButton="Send"
                        size="large"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onSearch={() => {
                            if (userInput.trim()) handleUserInput(userInput);
                        }}
                        loading={isLoading}
                        disabled={isLoading}
                    />
                    {currentStage === 'ask_tone' && messages.some(m => m.type === 'options' && m.sender === 'ai') && (
                        <div className="mt-2">
                            <Text type="secondary">Or select a tone: </Text>
                            <Select
                                style={{width: '100%'}}
                                placeholder="Choose a tone"
                                onChange={handleOptionSelect}
                                disabled={isLoading}
                            >
                                {tones.map(tone => <Option key={tone} value={tone}>{tone}</Option>)}
                            </Select>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};