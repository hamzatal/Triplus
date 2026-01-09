import React, { useState, useEffect } from "react";
import { Head, useForm, Link, router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    CheckCircle2,
    AlertCircle,
    MessageCircle,
    Headphones,
    Globe,
    Zap,
} from "lucide-react";
import Footer from "../Components/Footer";

const Contact = ({ auth }) => {
    const canGoBack = window.history.length > 2;
    const [notification, setNotification] = useState(null);

    const handleBack = () => {
        window.history.back();
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const { data, setData, processing, errors, reset, setError, clearErrors } =
        useForm({
            name: "",
            email: "",
            subject: "",
            message: "",
        });

    const validate = () => {
        const newErrors = {};
        if (!data.name) newErrors.name = "Name is required";
        else if (data.name.length < 2)
            newErrors.name = "Name must be at least 2 characters";
        else if (data.name.length > 50)
            newErrors.name = "Name cannot exceed 50 characters";

        if (!data.email) newErrors.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(data.email))
            newErrors.email = "Please enter a valid email address";
        else if (data.email.length > 100)
            newErrors.email = "Email cannot exceed 100 characters";

        if (!data.subject) newErrors.subject = "Subject is required";
        else if (data.subject.length < 3)
            newErrors.subject = "Subject must be at least 3 characters";
        else if (data.subject.length > 100)
            newErrors.subject = "Subject cannot exceed 100 characters";

        if (!data.message) newErrors.message = "Message is required";
        else if (data.message.length < 10)
            newErrors.message = "Message must be at least 10 characters";
        else if (data.message.length > 500)
            newErrors.message = "Message cannot exceed 500 characters";

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearErrors();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            Object.entries(validationErrors).forEach(([key, message]) =>
                setError(key, message)
            );
            setNotification({
                type: "error",
                message: "Please fix the errors below.",
            });
            return;
        }

        try {
            const response = await axios.post("/contacts", data);
            setNotification({
                type: "success",
                message: response.data.message || "Message sent successfully!",
            });
            reset();
        } catch (error) {
            setNotification({
                type: "error",
                message:
                    error.response?.data?.message ||
                    "An error occurred while sending your message.",
            });
        }
    };

    // Contact methods
    const contactMethods = [
        {
            icon: Mail,
            title: "Email Us",
            description: "Our team will respond within 24 hours",
            contact: "support@triplus.com",
            color: "from-emerald-500 to-teal-500",
            action: "mailto:support@triplus.com",
        },
        {
            icon: Phone,
            title: "Call Us",
            description: "Mon-Fri from 8am to 6pm",
            contact: "+962-777777777",
            color: "from-blue-500 to-cyan-500",
            action: "tel:+962777777777",
        },
       
       
    ];

    // FAQ data
    const faqs = [
        {
            question: "How quickly will I receive a response?",
            answer: "We typically respond to all inquiries within 24 hours during business days.",
        },
        {
            question: "What information should I include in my message?",
            answer: "Please provide as much detail as possible about your inquiry to help us assist you better.",
        },
        {
            question: "Do you offer phone support?",
            answer: "Yes! Our phone support is available Monday through Friday, 8am to 6pm EST.",
        },
        {
            question: "Are prices updated in real-time?",
            answer: "Yes, all prices are updated automatically based on availability.",
        },
        {
            question: "Do I need an account to book?",
            answer: "Creating an account helps you track bookings, but guest booking is also available.",
        },
        
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Head title="Contact Us - Let's Connect | Triplus" />

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        className="fixed top-6 right-6 z-50 max-w-md"
                    >
                        <div
                            className={`rounded-xl shadow-2xl border backdrop-blur-sm p-4 flex items-start gap-3 ${
                                notification.type === "success"
                                    ? "bg-emerald-900/90 border-emerald-500/50"
                                    : "bg-red-900/90 border-red-500/50"
                            }`}
                        >
                            {notification.type === "success" ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                                <p className="font-semibold mb-1">
                                    {notification.type === "success"
                                        ? "Success!"
                                        : "Error"}
                                </p>
                                <p className="text-sm text-gray-200">
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back Button */}
            {canGoBack && (
                <button
                    onClick={handleBack}
                    className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm text-white rounded-full border border-gray-700 hover:bg-gray-700 hover:border-emerald-500 transition-all shadow-lg"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Back</span>
                </button>
            )}

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full"
                    >
                        <Headphones className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">
                            We're Here to Help
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
                    >
                        Let's Start a
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                            Conversation
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl text-gray-400 max-w-3xl mx-auto"
                    >
                        Have questions? We'd love to hear from you. Send us a
                        message and we'll respond as soon as possible.
                    </motion.p>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {contactMethods.map((method, index) => (
                            <motion.a
                                key={index}
                                href={method.action}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="relative group"
                            >
                                <div
                                    className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                                    style={{
                                        background: `linear-gradient(to bottom right, ${method.color})`,
                                    }}
                                />
                                <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 group-hover:border-emerald-500/50 transition-all h-full">
                                    <div
                                        className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${method.color} mb-4`}
                                    >
                                        <method.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {method.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-3">
                                        {method.description}
                                    </p>
                                    <p className="text-emerald-400 font-medium text-sm">
                                        {method.contact}
                                    </p>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content - Form & Info */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-5 gap-12">
                        {/* Left Side - Form (3 columns) */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-3"
                        >
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-gray-700">
                                <div className="mb-8">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-3">
                                        Send us a{" "}
                                        <span className="text-emerald-400">
                                            Message
                                        </span>
                                    </h2>
                                    <p className="text-gray-400">
                                        Fill out the form below and we'll get
                                        back to you shortly
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    {/* Name & Email Row */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Your Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all ${
                                                    errors.name
                                                        ? "border-red-500"
                                                        : "border-gray-600 hover:border-emerald-500"
                                                }`}
                                                placeholder="John Doe"
                                            />
                                            {errors.name && (
                                                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all ${
                                                    errors.email
                                                        ? "border-red-500"
                                                        : "border-gray-600 hover:border-emerald-500"
                                                }`}
                                                placeholder="john@example.com"
                                            />
                                            {errors.email && (
                                                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.subject}
                                            onChange={(e) =>
                                                setData(
                                                    "subject",
                                                    e.target.value
                                                )
                                            }
                                            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all ${
                                                errors.subject
                                                    ? "border-red-500"
                                                    : "border-gray-600 hover:border-emerald-500"
                                            }`}
                                            placeholder="How can we help you?"
                                        />
                                        {errors.subject && (
                                            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.subject}
                                            </p>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Your Message *
                                        </label>
                                        <textarea
                                            value={data.message}
                                            onChange={(e) =>
                                                setData(
                                                    "message",
                                                    e.target.value
                                                )
                                            }
                                            rows="6"
                                            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all resize-none ${
                                                errors.message
                                                    ? "border-red-500"
                                                    : "border-gray-600 hover:border-emerald-500"
                                            }`}
                                            placeholder="Tell us more about your inquiry..."
                                        />
                                        <div className="flex justify-between items-center mt-2">
                                            {errors.message ? (
                                                <p className="text-red-400 text-sm flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.message}
                                                </p>
                                            ) : (
                                                <div />
                                            )}
                                            <span className="text-xs text-gray-500">
                                                {data.message.length}/500
                                            </span>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Message
                                                <Send className="w-5 h-5" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            </div>
                        </motion.div>

                        {/* Right Side - Info & FAQ (2 columns) */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-2 space-y-6"
                        >
                            {/* Quick Response Time */}
                            <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/30">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2">
                                            Quick Response Time
                                        </h3>
                                        <p className="text-sm text-gray-300">
                                            We pride ourselves on responding
                                            quickly. Expect to hear from us
                                            within 24 hours.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* FAQ Section */}
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                                    Quick Answers
                                </h3>
                                <div className="space-y-4">
                                    {faqs.map((faq, index) => (
                                        <div
                                            key={index}
                                            className="border-b border-gray-700 last:border-0 pb-4 last:pb-0"
                                        >
                                            <h4 className="font-semibold text-white mb-2 text-sm">
                                                {faq.question}
                                            </h4>
                                            <p className="text-sm text-gray-400">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;
