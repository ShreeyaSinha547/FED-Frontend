import { useState, useRef, useEffect } from 'react';
import styles from './chatbot.module.scss';
import { IoCloseOutline, IoSend, IoMic, IoMicOff } from 'react-icons/io5';
import { BiSolidMessageSquareDetail } from 'react-icons/bi';
import { IoSparkles } from 'react-icons/io5';
import chatbotAPI from '../../services/chatbotAPI';

const Chatbot = () => {
    const chatbotName = import.meta.env.VITE_CHATBOT_NAME || 'Sage';

    const [messages, setMessages] = useState([
        {
            id: 1,
            text: `Hello! I'm **${chatbotName}**, your personal assistant for FED KIIT. 🚀\\n\\nAsk me about our team, upcoming events, or how to join the society!`,
            isUser: false,
            timestamp: new Date(),
        }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
    const chatboxRef = useRef(null);
    const recognitionRef = useRef(null);

    // Suggested prompts
    const suggestedPrompts = [
        "What is FED?",
        "Who is the president?",
        "Tell me about FED events",
        "How can I join FED?"
    ];

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Toggle chatbot
    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    // Send message handler
    const sendMessage = async (messageText = null) => {
        const textToSend = messageText || userInput;
        if (!textToSend?.trim()) return;

        // Add user message
        const userMessage = {
            id: messages.length + 1,
            text: textToSend,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsTyping(true);

        try {
            // Call real chatbot API
            const response = await chatbotAPI.sendMessage(textToSend);

            const botResponse = {
                id: messages.length + 2,
                text: response.success ? response.response : 'Sorry, I encountered an error. Please try again.',
                isUser: false,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorResponse = {
                id: messages.length + 2,
                text: 'Sorry, I\'m having trouble connecting. Please make sure the backend is running on port 4000.',
                isUser: false,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Voice recognition
    const startVoiceRecognition = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setUserInput(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopVoiceRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const toggleVoiceRecognition = () => {
        if (isListening) {
            stopVoiceRecognition();
        } else {
            startVoiceRecognition();
        }
    };

    // Notify parent window that chatbot is ready (for iframe embedding)
    useEffect(() => {
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'CHATBOT_READY' }, '*');
        }
    }, []);

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    className={styles.chatbotToggle}
                    onClick={toggleChatbot}
                    aria-label="Open Chat"
                >
                    <BiSolidMessageSquareDetail size={38} />
                    <div className={styles.pulseRing}></div>
                </button>
            )}

            {/* Backdrop Overlay */}
            {isOpen && (
                <div className={styles.backdrop} onClick={toggleChatbot}></div>
            )}

            {/* Chatbot Container */}
            {isOpen && (
                <div className={styles.chatbotContainer}>
                    {/* Header */}
                    <header className={styles.chatbotHeader}>
                        <div className={styles.headerContent}>
                            <div className={styles.avatarContainer}>
                                <img
                                    src="https://uploads-ssl.webflow.com/629d87f593841156e4e0d9a4/62eeaa9927e6aea4ff13590e_FedLogo.png"
                                    alt="FED Logo"
                                    className={styles.avatar}
                                />
                                <div className={styles.statusIndicator}></div>
                            </div>
                            <div className={styles.headerText}>
                                <h2 className={styles.title}>{chatbotName}</h2>
                                <p className={styles.subtitle}>
                                    <IoSparkles size={12} /> AI Assistant
                                </p>
                            </div>
                        </div>
                        <button
                            className={styles.closeButton}
                            onClick={toggleChatbot}
                            aria-label="Close Chat"
                        >
                            <IoCloseOutline size={26} />
                        </button>
                    </header>

                    {/* Messages Area */}
                    <div className={styles.messagesArea} ref={chatboxRef}>
                        {messages.map((message, index) => (
                            <div
                                key={message.id}
                                className={`${styles.messageWrapper} ${message.isUser ? styles.userWrapper : styles.botWrapper
                                    }`}
                            >
                                {!message.isUser && (
                                    <div className={styles.messageAvatar}>
                                        <img
                                            src="https://uploads-ssl.webflow.com/629d87f593841156e4e0d9a4/62eeaa9927e6aea4ff13590e_FedLogo.png"
                                            alt="Bot"
                                        />
                                    </div>
                                )}
                                <div className={styles.messageContent}>
                                    <div
                                        className={`${styles.message} ${message.isUser ? styles.userMessage : styles.botMessage
                                            }`}
                                    >
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: message.text
                                                    .replace(/@fedkiit/gi, '[@fedkiit](https://www.instagram.com/fedkiit/)')
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #ffffff; text-decoration: underline; font-weight: 600;">$1</a>')
                                                    .replace(/(?<!href=")(https?:\/\/[^\s<"]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #ffffff; text-decoration: underline; font-weight: 600;">$1</a>')
                                                    .replace(/\n/g, '<br/>')
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className={`${styles.messageWrapper} ${styles.botWrapper}`}>
                                <div className={styles.messageAvatar}>
                                    <img
                                        src="https://uploads-ssl.webflow.com/629d87f593841156e4e0d9a4/62eeaa9927e6aea4ff13590e_FedLogo.png"
                                        alt="Bot"
                                    />
                                </div>
                                <div className={styles.typingIndicator}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        {/* Show suggested prompts only for first message */}
                        {messages.length === 1 && !isTyping && (
                            <div className={styles.suggestedPrompts}>
                                <p className={styles.promptsLabel}>Quick actions:</p>
                                <div className={styles.promptsGrid}>
                                    {suggestedPrompts.map((prompt, index) => (
                                        <button
                                            key={index}
                                            className={styles.promptButton}
                                            onClick={() => sendMessage(prompt)}
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className={styles.inputArea}>
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything about FED..."
                            className={styles.messageInput}
                        />
                        <button
                            className={`${styles.voiceButton} ${isListening ? styles.listening : ''}`}
                            onClick={toggleVoiceRecognition}
                            aria-label={isListening ? "Stop Recording" : "Start Voice Input"}
                            type="button"
                        >
                            {isListening ? <IoMicOff size={20} /> : <IoMic size={20} />}
                        </button>
                        <button
                            className={styles.sendButton}
                            onClick={() => sendMessage()}
                            disabled={!userInput.trim()}
                            aria-label="Send Message"
                        >
                            <IoSend size={20} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
