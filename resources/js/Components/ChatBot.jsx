import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plane,
    Map,
    Luggage,
    Send,
    X,
    Calendar,
    DollarSign,
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const ChatBot = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            text: "مرحبًا بك في Triplus AI! أنا هنا لتخطيط رحلتك المثالية. أخبرني عن خطط سفرك أو جرب اقتراحًا أدناه!",
            sender: "bot",
            language: "ar",
        },
        {
            text: "Welcome to Triplus AI! I'm here to plan your dream trip. Tell me about your travel plans or try a suggestion below!",
            sender: "bot",
            language: "en",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const [currentLanguage, setCurrentLanguage] = useState("en");
    const messagesEndRef = useRef(null);

    // Hide tooltip after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowTooltip(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Animation variants
    const chatVariants = {
        hidden: { x: "100%", opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 20 },
        },
        exit: { x: "100%", opacity: 0, transition: { duration: 0.3 } },
    };

    const messageVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    };

    const suggestionVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = inputMessage.trim();
        const userLanguage = detectLanguage(userMessage);
        setCurrentLanguage(userLanguage);

        setMessages((prev) => [
            ...prev,
            { text: userMessage, sender: "user", language: userLanguage },
        ]);
        setInputMessage("");
        setIsLoading(true);

        try {
            await axios.get("/sanctum/csrf-cookie");
            const response = await axios.post("/chatbot", {
                message: userMessage,
            });
            const botMessage = response.data.response;
            const botLanguage = response.data.language || userLanguage;

            const botText =
                typeof botMessage === "string"
                    ? botMessage
                    : JSON.stringify(botMessage);

            setMessages((prev) => [
                ...prev,
                {
                    text: botText,
                    sender: "bot",
                    language: botLanguage,
                },
            ]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    text:
                        userLanguage === "ar"
                            ? "عذرًا، حدث خطأ. حاول مرة أخرى."
                            : "Sorry, something went wrong. Please try again.",
                    sender: "bot",
                    language: userLanguage,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = async (suggestion) => {
        const suggestionText =
            suggestion.text[currentLanguage] || suggestion.text.en;
        setMessages((prev) => [
            ...prev,
            { text: suggestionText, sender: "user", language: currentLanguage },
        ]);
        setIsLoading(true);

        try {
            await axios.get("/sanctum/csrf-cookie");
            const response = await axios.post("/chatbot", {
                message:
                    suggestion.prompt[currentLanguage] || suggestion.prompt.en,
            });
            const botMessage = response.data.response;
            const botLanguage = response.data.language || currentLanguage;

            const botText =
                typeof botMessage === "string"
                    ? botMessage
                    : JSON.stringify(botMessage);

            setMessages((prev) => [
                ...prev,
                {
                    text: botText,
                    sender: "bot",
                    language: botLanguage,
                },
            ]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    text:
                        currentLanguage === "ar"
                            ? "عذرًا، حدث خطأ. حاول مرة أخرى."
                            : "Sorry, something went wrong. Please try again.",
                    sender: "bot",
                    language: currentLanguage,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    const detectLanguage = (message) => {
        return /[ء-ي]/.test(message) ? "ar" : "en";
    };

    const parseSections = (text) => {
        // Primary split by ===SECTION===
        let sections = text
            .split("===SECTION===")
            .map((section) => section.trim());

        // If no sections found, try splitting by Markdown headers (##)
        if (sections.length <= 1) {
            const headerRegex = /(^##\s*.+?)(?=\n##|\n$)/gms;
            sections = [];
            let match;
            let lastIndex = 0;

            while ((match = headerRegex.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    sections.push(text.slice(lastIndex, match.index).trim());
                }
                sections.push(match[0].trim());
                lastIndex = match.index + match[0].length;
            }

            if (lastIndex < text.length) {
                sections.push(text.slice(lastIndex).trim());
            }

            // Filter out empty sections
            sections = sections.filter((section) => section.length > 0);

            // If still no sections, return the whole text as one section
            if (sections.length === 0) {
                sections = [text.trim()];
            }
        }

        return sections;
    };

    const formatMessage = (messageText, language) => {
        const sections = parseSections(messageText);
        if (sections.length > 1) {
            return sections.map((section, index) => {
                const titleMatch = section.match(/^#{1,3}\s*(.*?)$/m);
                const title = titleMatch
                    ? titleMatch[1]
                    : `Section ${index + 1}`;
                const icon =
                    title.includes("Itinerary") || title.includes("الجدول") ? (
                        <Calendar size={16} />
                    ) : title.includes("Cost") || title.includes("التكاليف") ? (
                        <DollarSign size={16} />
                    ) : title.includes("Attractions") ||
                      title.includes("المعالم") ? (
                        <Map size={16} />
                    ) : (
                        <Luggage size={16} />
                    );

                return (
                    <div
                        key={index}
                        className="bg-gray-800 p-4 rounded-lg shadow-md mb-2 border border-green-600"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            {icon}
                            <h3 className="text-sm font-semibold text-green-300">
                                {title}
                            </h3>
                        </div>
                        <ReactMarkdown
                            components={{
                                h1: ({ node, ...props }) => (
                                    <h1
                                        className="text-md font-bold mt-2 mb-1"
                                        {...props}
                                    />
                                ),
                                h2: ({ node, ...props }) => (
                                    <h2
                                        className="text-sm font-semibold mt-2 mb-1"
                                        {...props}
                                    />
                                ),
                                h3: ({ node, ...props }) => (
                                    <h3
                                        className="text-xs font-medium mt-1 mb-1"
                                        {...props}
                                    />
                                ),
                                p: ({ node, ...props }) => (
                                    <p className="text-xs mb-1" {...props} />
                                ),
                                ul: ({ node, ...props }) => (
                                    <ul
                                        className="list-disc pl-4 mb-1 text-xs"
                                        {...props}
                                    />
                                ),
                                li: ({ node, ...props }) => (
                                    <li className="mb-0.5" {...props} />
                                ),
                            }}
                        >
                            {section}
                        </ReactMarkdown>
                    </div>
                );
            });
        }
        return (
            <ReactMarkdown
                components={{
                    h1: ({ node, ...props }) => (
                        <h1
                            className="text-md font-bold mt-2 mb-1"
                            {...props}
                        />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2
                            className="text-sm font-semibold mt-2 mb-1"
                            {...props}
                        />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3
                            className="text-xs font-medium mt-1 mb-1"
                            {...props}
                        />
                    ),
                    p: ({ node, ...props }) => (
                        <p className="text-xs mb-1" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                        <ul
                            className="list-disc pl-4 mb-1 text-xs"
                            {...props}
                        />
                    ),
                    li: ({ node, ...props }) => (
                        <li className="mb-0.5" {...props} />
                    ),
                }}
            >
                {messageText}
            </ReactMarkdown>
        );
    };

    const suggestions = [
        {
            text: { en: "Destinations", ar: "الوجهات" },
            icon: <Map size={14} />,
            prompt: {
                en: "Suggest popular travel destinations for a week-long trip.",
                ar: "اقترح وجهات سفر شعبية لرحلة مدتها أسبوع.",
            },
        },
        {
            text: { en: "Budget", ar: "الميزانية" },
            icon: <Luggage size={14} />,
            prompt: {
                en: "How can I plan a trip on a budget? Suggest affordable destinations.",
                ar: "كيف أخطط لرحلة بميزانية محدودة؟ اقترح وجهات بأسعار معقولة.",
            },
        },
        {
            text: { en: "Best Time", ar: "أفضل وقت" },
            icon: <Plane size={14} />,
            prompt: {
                en: "When is the best time to travel to popular destinations?",
                ar: "متى هو أفضل وقت للسفر إلى الوجهات الشعبية؟",
            },
        },
        {
            text: { en: "Help", ar: "مساعدة" },
            icon: <Calendar size={14} />,
            prompt: {
                en: "How can you assist me with my travel plans?",
                ar: "كيف يمكنك مساعدتي في تخطيط رحلتي؟",
            },
        },
    ];

    return (
        <>
            <style>
                {`
                    .scrollbar-custom::-webkit-scrollbar {
                        width: 6px;
                    }
                    .scrollbar-custom::-webkit-scrollbar-thumb {
                        background-color: #6b7280; /* gray-500 */
                        border-radius: 3px;
                    }
                    .scrollbar-custom::-webkit-scrollbar-track {
                        background: #1f2937; /* gray-800 */
                    }
                    .scrollbar-custom {
                        scrollbar-color: #6b7280 #1f2937; /* Firefox support */
                        scrollbar-width: thin;
                    }
                `}
            </style>
            <div className="fixed bottom-0 right-0 z-50">
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleChat}
                        aria-label="Toggle chat assistant"
                        className="w-16 h-16 bg-gradient-to-br from-green-600 to-gray-900 hover:from-green-500 hover:to-gray-800 rounded-tl-full shadow-lg transition-all duration-300 flex items-center justify-center relative overflow-hidden"
                    >
                        <div
                            className="absolute inset-0 rounded-tl-full"
                            style={{
                                background:
                                    "linear-gradient(135deg, #16a34a 0%, #4b5563 50%, #1f2937 100%)",
                                borderBottom: "2px solid #4b5563",
                                boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.5)",
                            }}
                        >
                            <div
                                className="absolute w-8 h-4 bg-green-700 opacity-50 rounded-full"
                                style={{ top: "20%", left: "30%" }}
                            />
                            <div
                                className="absolute w-6 h-3 bg-green-700 opacity-50 rounded-full"
                                style={{ top: "40%", left: "20%" }}
                            />
                        </div>
                        {!isChatOpen && (
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 12,
                                    ease: "linear",
                                }}
                                className="absolute w-32 h-32"
                                style={{ transformOrigin: "80% 80%" }}
                            >
                                <div className="absolute left-full top-1/2 -translate-y-1/2 rotate-[90deg]">
                                    <Plane className="text-white w-5 h-5" />
                                </div>
                            </motion.div>
                        )}
                        {isChatOpen && (
                            <X className="w-6 h-6 text-white z-10" />
                        )}
                    </motion.button>
                </div>

                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            variants={chatVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-80 h-screen bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-4 bg-gradient-to-r from-green-600 to-green-700 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center">
                                        <Plane className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">
                                            Triplus AI
                                        </h4>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleChat}
                                    className="text-white hover:text-green-300 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </motion.button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/80 scrollbar-custom">
                                {messages
                                    .filter(
                                        (msg) =>
                                            !msg.language ||
                                            msg.language === currentLanguage
                                    )
                                    .map((msg, index) => (
                                        <motion.div
                                            key={index}
                                            variants={messageVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className={`flex ${
                                                msg.sender === "user"
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >
                                            <div
                                                className={`max-w-[80%] p-3 rounded-lg shadow-md ${
                                                    msg.sender === "user"
                                                        ? "bg-gray-700 text-white"
                                                        : "bg-gradient-to-r from-green-600 to-green-700 text-white"
                                                }`}
                                            >
                                                {formatMessage(
                                                    msg.text,
                                                    msg.language
                                                )}
                                                {msg.sender === "bot" && (
                                                    <p className="text-xs mt-1 text-green-300 opacity-80 flex items-center gap-1">
                                                        <Plane size={12} />—
                                                        Triplus AI
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center justify-start gap-2"
                                    >
                                        <div className="flex items-center gap-1 p-3 rounded-lg bg-green-700">
                                            <motion.div
                                                animate={{ rotate: [0, 360] }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 1,
                                                }}
                                            >
                                                <Plane
                                                    size={14}
                                                    className="text-white"
                                                />
                                            </motion.div>
                                            <span className="text-xs text-white">
                                                {currentLanguage === "ar"
                                                    ? "جارٍ التخطيط ..."
                                                    : "Planning ..."}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 bg-gray-900 border-t border-gray-800">
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((suggestion, index) => (
                                        <motion.button
                                            key={index}
                                            variants={suggestionVariants}
                                            initial="hidden"
                                            animate="visible"
                                            whileHover={{
                                                scale: 1.05,
                                                boxShadow:
                                                    "0 4px 12px rgba(34, 197, 94, 0.3)",
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                handleSuggestionClick(
                                                    suggestion
                                                )
                                            }
                                            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-green-700 to-green-800 text-white text-sm rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-sm"
                                        >
                                            {suggestion.icon}
                                            {suggestion.text[currentLanguage] ||
                                                suggestion.text.en}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="p-4 bg-gray-900 border-t border-gray-800"
                            >
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) =>
                                            setInputMessage(e.target.value)
                                        }
                                        onKeyDown={handleKeyDown}
                                        placeholder={
                                            currentLanguage === "ar"
                                                ? "اسأل عن رحلتك..."
                                                : "Ask about your trip..."
                                        }
                                        className="w-full p-3 pr-12 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-600 placeholder-gray-400 text-sm"
                                        dir={
                                            currentLanguage === "ar"
                                                ? "rtl"
                                                : "ltr"
                                        }
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className={`absolute right-3 p-2 rounded-full bg-green-600 hover:bg-green-500 transition-all duration-300 ${
                                            isLoading ? "opacity-50" : ""
                                        }`}
                                    >
                                        <Send className="w-4 h-4 text-white" />
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default ChatBot;
