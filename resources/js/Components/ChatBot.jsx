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
    MapPin,
    Sparkles,
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
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
            },
        },
    };

    const suggestionVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4 },
        },
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
        let sections = text
            .split("===SECTION===")
            .map((section) => section.trim());

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

            sections = sections.filter((section) => section.length > 0);

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
                        <Calendar size={18} className="text-emerald-400" />
                    ) : title.includes("Cost") || title.includes("التكاليف") ? (
                        <DollarSign size={18} className="text-emerald-400" />
                    ) : title.includes("Attractions") ||
                      title.includes("المعالم") ? (
                        <MapPin size={18} className="text-emerald-400" />
                    ) : (
                        <Luggage size={18} className="text-emerald-400" />
                    );

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm p-5 rounded-2xl mb-3 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 shadow-lg"
                    >
                        <div className="flex items-center gap-3 mb-3 pb-2 border-b border-emerald-500/20">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                {icon}
                            </div>
                            <h3 className="text-base font-bold text-emerald-300 tracking-wide">
                                {title}
                            </h3>
                        </div>
                        <div className="text-gray-200">
                            <ReactMarkdown
                                components={{
                                    h1: ({ node, ...props }) => (
                                        <h1
                                            className="text-lg font-bold mt-3 mb-2 text-white"
                                            {...props}
                                        />
                                    ),
                                    h2: ({ node, ...props }) => (
                                        <h2
                                            className="text-base font-semibold mt-3 mb-2 text-emerald-200"
                                            {...props}
                                        />
                                    ),
                                    h3: ({ node, ...props }) => (
                                        <h3
                                            className="text-sm font-medium mt-2 mb-1 text-emerald-300"
                                            {...props}
                                        />
                                    ),
                                    p: ({ node, ...props }) => (
                                        <p
                                            className="text-sm leading-relaxed mb-2 text-gray-300"
                                            {...props}
                                        />
                                    ),
                                    ul: ({ node, ...props }) => (
                                        <ul
                                            className="list-none pl-0 mb-2 space-y-1"
                                            {...props}
                                        />
                                    ),
                                    li: ({ node, ...props }) => (
                                        <li
                                            className="text-sm flex items-start gap-2 mb-1.5"
                                            {...props}
                                        >
                                            <span className="text-emerald-400 mt-1.5">
                                                •
                                            </span>
                                            <span className="flex-1">
                                                {props.children}
                                            </span>
                                        </li>
                                    ),
                                }}
                            >
                                {section}
                            </ReactMarkdown>
                        </div>
                    </motion.div>
                );
            });
        }
        return (
            <div className="text-gray-200">
                <ReactMarkdown
                    components={{
                        h1: ({ node, ...props }) => (
                            <h1
                                className="text-lg font-bold mt-3 mb-2 text-white"
                                {...props}
                            />
                        ),
                        h2: ({ node, ...props }) => (
                            <h2
                                className="text-base font-semibold mt-3 mb-2 text-emerald-200"
                                {...props}
                            />
                        ),
                        h3: ({ node, ...props }) => (
                            <h3
                                className="text-sm font-medium mt-2 mb-1 text-emerald-300"
                                {...props}
                            />
                        ),
                        p: ({ node, ...props }) => (
                            <p
                                className="text-sm leading-relaxed mb-2"
                                {...props}
                            />
                        ),
                        ul: ({ node, ...props }) => (
                            <ul
                                className="list-none pl-0 mb-2 space-y-1"
                                {...props}
                            />
                        ),
                        li: ({ node, ...props }) => (
                            <li
                                className="text-sm flex items-start gap-2 mb-1.5"
                                {...props}
                            >
                                <span className="text-emerald-400 mt-1.5">
                                    •
                                </span>
                                <span className="flex-1">{props.children}</span>
                            </li>
                        ),
                    }}
                >
                    {messageText}
                </ReactMarkdown>
            </div>
        );
    };

    const suggestions = [
        {
            text: { en: "Destinations", ar: "الوجهات" },
            icon: <Map size={16} />,
            prompt: {
                en: "Suggest popular travel destinations for a week-long trip.",
                ar: "اقترح وجهات سفر شعبية لرحلة مدتها أسبوع.",
            },
        },
        {
            text: { en: "Budget", ar: "الميزانية" },
            icon: <Luggage size={16} />,
            prompt: {
                en: "How can I plan a trip on a budget? Suggest affordable destinations.",
                ar: "كيف أخطط لرحلة بميزانية محدودة؟ اقترح وجهات بأسعار معقولة.",
            },
        },
        {
            text: { en: "Best Time", ar: "أفضل وقت" },
            icon: <Calendar size={16} />,
            prompt: {
                en: "When is the best time to travel to popular destinations?",
                ar: "متى هو أفضل وقت للسفر إلى الوجهات الشعبية؟",
            },
        },
        {
            text: { en: "Help", ar: "مساعدة" },
            icon: <Sparkles size={16} />,
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
                    .scrollbar-modern::-webkit-scrollbar {
                        width: 8px;
                    }
                    .scrollbar-modern::-webkit-scrollbar-thumb {
                        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
                        border-radius: 10px;
                    }
                    .scrollbar-modern::-webkit-scrollbar-track {
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 10px;
                    }
                    .scrollbar-modern {
                        scrollbar-color: #10b981 rgba(15, 23, 42, 0.5);
                        scrollbar-width: thin;
                    }
                    
                    @keyframes shimmer {
                        0% { background-position: -1000px 0; }
                        100% { background-position: 1000px 0; }
                    }
                    
                    .animate-shimmer {
                        animation: shimmer 3s infinite linear;
                        background: linear-gradient(
                            90deg,
                            transparent 0%,
                            rgba(16, 185, 129, 0.1) 50%,
                            transparent 100%
                        );
                        background-size: 1000px 100%;
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
                            className="w-96 h-screen flex flex-col shadow-2xl"
                            style={{
                                background:
                                    "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                            }}
                        >
                            {/* Header */}
                            <div className="relative p-6 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 overflow-hidden">
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-300 rounded-full blur-3xl"></div>
                                </div>

                                <div className="relative flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <motion.div
                                            className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30"
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            <Plane className="w-7 h-7 text-white drop-shadow-lg" />
                                        </motion.div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                                                Triplus AI
                                            </h4>
                                            <p className="text-xs text-emerald-100/80 font-medium">
                                                {currentLanguage === "ar"
                                                    ? "مساعدك الذكي للسفر"
                                                    : "Your Smart Travel Assistant"}
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={toggleChat}
                                        className="text-white/90 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10 backdrop-blur-sm"
                                    >
                                        <X className="w-6 h-6" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 scrollbar-modern">
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
                                            {msg.sender === "bot" && (
                                                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3 mt-1 shadow-lg">
                                                    <Plane
                                                        size={16}
                                                        className="text-white"
                                                    />
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[75%] ${
                                                    msg.sender === "user"
                                                        ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-3xl rounded-tr-md px-5 py-3 shadow-lg"
                                                        : "bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm text-gray-100 rounded-3xl rounded-tl-md px-5 py-4 shadow-xl border border-slate-700/50"
                                                }`}
                                            >
                                                {formatMessage(
                                                    msg.text,
                                                    msg.language
                                                )}
                                                {msg.sender === "bot" && (
                                                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-700/50">
                                                        <Sparkles
                                                            size={12}
                                                            className="text-emerald-400"
                                                        />
                                                        <p className="text-xs text-emerald-400/80 font-medium">
                                                            Triplus AI
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                                            <motion.div
                                                animate={{ rotate: [0, 360] }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 2,
                                                    ease: "linear",
                                                }}
                                            >
                                                <Plane
                                                    size={16}
                                                    className="text-white"
                                                />
                                            </motion.div>
                                        </div>
                                        <div className="flex items-center gap-2 px-5 py-3 rounded-3xl rounded-tl-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 shadow-xl">
                                            <div className="flex gap-1">
                                                <motion.div
                                                    className="w-2 h-2 bg-emerald-400 rounded-full"
                                                    animate={{
                                                        scale: [1, 1.3, 1],
                                                    }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 1,
                                                        delay: 0,
                                                    }}
                                                />
                                                <motion.div
                                                    className="w-2 h-2 bg-emerald-400 rounded-full"
                                                    animate={{
                                                        scale: [1, 1.3, 1],
                                                    }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 1,
                                                        delay: 0.2,
                                                    }}
                                                />
                                                <motion.div
                                                    className="w-2 h-2 bg-emerald-400 rounded-full"
                                                    animate={{
                                                        scale: [1, 1.3, 1],
                                                    }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 1,
                                                        delay: 0.4,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm text-emerald-300 font-medium">
                                                {currentLanguage === "ar"
                                                    ? "جارٍ التخطيط"
                                                    : "Planning"}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Suggestions */}
                            <div className="px-5 py-4 bg-gradient-to-b from-slate-900/50 to-slate-900/80 backdrop-blur-sm border-t border-slate-700/50">
                                <div className="grid grid-cols-2 gap-2">
                                    {suggestions.map((suggestion, index) => (
                                        <motion.button
                                            key={index}
                                            variants={suggestionVariants}
                                            initial="hidden"
                                            animate="visible"
                                            whileHover={{
                                                scale: 1.05,
                                                y: -2,
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                handleSuggestionClick(
                                                    suggestion
                                                )
                                            }
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm text-emerald-300 text-sm font-medium rounded-2xl hover:from-emerald-600/20 hover:to-emerald-700/20 transition-all duration-300 border border-slate-700/50 hover:border-emerald-500/50 shadow-lg"
                                        >
                                            {suggestion.icon}
                                            <span>
                                                {suggestion.text[
                                                    currentLanguage
                                                ] || suggestion.text.en}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Input Area */}
                            <form
                                onSubmit={handleSubmit}
                                className="p-5 bg-gradient-to-t from-slate-900 to-slate-900/80 backdrop-blur-sm border-t border-slate-700/50"
                            >
                                <div className="relative flex items-center gap-3">
                                    <div className="relative flex-1">
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
                                            className="w-full px-5 py-4 rounded-2xl bg-slate-800/80 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border border-slate-700/50 text-sm font-medium shadow-lg transition-all duration-300"
                                            dir={
                                                currentLanguage === "ar"
                                                    ? "rtl"
                                                    : "ltr"
                                            }
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 animate-shimmer pointer-events-none" />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className={`flex-shrink-0 p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300 shadow-lg ${
                                            isLoading
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                    >
                                        <Send className="w-5 h-5 text-white" />
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
