import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Sparkles,
    Award,
    Target,
    Heart,
    Rocket,
    TrendingUp,
    Users,
    Globe2,
    Plane,
    CheckCircle2,
    Star,
} from "lucide-react";

const About = ({ auth }) => {
    const user = auth?.user || null;
    const canGoBack = window.history.length > 2; // تغيير من 1 إلى 2

    const handleBack = () => {
        window.history.back(); // استخدام الطريقة الصحيحة
    };

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const scaleIn = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
    };

    // Timeline data
    const timeline = [
        {
            year: "2020",
            title: "The Beginning",
            description:
                "Triplus was born from a simple dream to revolutionize travel planning.",
        },
        {
            year: "2021",
            title: "Rapid Growth",
            description:
                "Reached 10,000+ happy travelers across 50+ destinations.",
        },
        {
            year: "2023",
            title: "Global Expansion",
            description:
                "Expanded services to 180+ countries with local partnerships.",
        },
        {
            year: "2025",
            title: "Innovation Leader",
            description:
                "Leading the industry with AI-powered travel recommendations.",
        },
    ];

    // Stats data
    const stats = [
        { icon: Users, value: "500K+", label: "Happy Travelers" },
        { icon: Globe2, value: "180+", label: "Countries" },
        { icon: Plane, value: "1M+", label: "Trips Booked" },
        { icon: Award, value: "50+", label: "Awards Won" },
    ];

    // Core values
    const values = [
        {
            icon: Heart,
            title: "Passion",
            description:
                "We love what we do and it shows in every interaction.",
            color: "from-pink-500 to-rose-500",
        },
        {
            icon: Target,
            title: "Excellence",
            description:
                "We strive for perfection in every detail of your journey.",
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: Rocket,
            title: "Innovation",
            description:
                "We constantly push boundaries to deliver better experiences.",
            color: "from-purple-500 to-indigo-500",
        },
        {
            icon: CheckCircle2,
            title: "Trust",
            description:
                "Your satisfaction and security are our top priorities.",
            color: "from-emerald-500 to-teal-500",
        },
    ];

    // What sets us apart
    const features = [
        "Personalized AI-powered recommendations",
        "24/7 multilingual customer support",
        "Price match guarantee",
        "Flexible booking & cancellation",
        "Exclusive deals & partnerships",
        "Sustainable travel options",
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Head title="About Triplus - Your Travel Story Begins Here" />

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
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">
                            Welcome to Triplus
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
                    >
                        Where Every Journey
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                            Tells a Story
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl text-gray-400 max-w-3xl mx-auto mb-12"
                    >
                        We're not just a travel platform. We're your companion
                        in creating unforgettable memories, one adventure at a
                        time.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <Link
                            href="/packages"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                        >
                            Start Your Adventure
                            <Rocket className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 border-y border-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="text-center"
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-4">
                                    <stat.icon className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-4xl font-bold text-white mb-2">
                                    {stat.value}
                                </h3>
                                <p className="text-gray-400">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="grid md:grid-cols-2 gap-12 items-center"
                    >
                        {/* Text Content */}
                        <div>
                            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                                <Star className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm font-semibold text-emerald-400">
                                    Our Story
                                </span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Built by Travelers,
                                <br />
                                <span className="text-emerald-400">
                                    For Travelers
                                </span>
                            </h2>

                            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                                <p>
                                    Triplus started in a small office with big
                                    dreams. Our founders, seasoned travelers
                                    frustrated with complicated booking systems,
                                    decided to create something better.
                                </p>
                                <p>
                                    What began as a simple idea has grown into a
                                    global platform trusted by hundreds of
                                    thousands of travelers worldwide. But our
                                    mission remains the same: make travel
                                    planning effortless and inspiring.
                                </p>
                                <p>
                                    Today, we're proud to be at the forefront of
                                    travel innovation, combining cutting-edge
                                    technology with genuine human care to
                                    deliver experiences that exceed
                                    expectations.
                                </p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative">
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-teal-500" />
                            <div className="space-y-8">
                                {timeline.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.2 }}
                                        className="relative pl-20"
                                    >
                                        <div className="absolute left-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-sm border-4 border-gray-950">
                                            {item.year}
                                        </div>
                                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                                            <h3 className="text-xl font-bold text-white mb-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-400">
                                                {item.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            What Drives{" "}
                            <span className="text-emerald-400">Us</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Our core values shape every decision we make and
                            every experience we create
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                variants={scaleIn}
                                whileHover={{ y: -10 }}
                                className="relative group"
                            >
                                <div
                                    className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                                    style={{
                                        background: `linear-gradient(to bottom right, ${value.color})`,
                                    }}
                                />
                                <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 group-hover:border-emerald-500/50 transition-all h-full">
                                    <div
                                        className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} mb-6`}
                                    >
                                        <value.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">
                                        {value.title}
                                    </h3>
                                    <p className="text-gray-400">
                                        {value.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* What Sets Us Apart */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Image/Visual Side */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-square rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-[url('/api/placeholder/600/600')] bg-cover bg-center opacity-10" />
                                <TrendingUp className="w-64 h-64 text-emerald-400/20" />
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center">
                                <Award className="w-16 h-16 text-white" />
                            </div>
                        </motion.div>

                        {/* Content Side */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Why Choose{" "}
                                <span className="text-emerald-400">
                                    Triplus
                                </span>
                                ?
                            </h2>
                            <p className="text-xl text-gray-400 mb-8">
                                We go beyond ordinary travel services to deliver
                                extraordinary experiences
                            </p>

                            <div className="space-y-4">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-emerald-500/50 transition-all"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-lg text-gray-300">
                                            {feature}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-12 text-center"
                    >
                        <div className="absolute inset-0 bg-[url('/api/placeholder/800/400')] bg-cover bg-center opacity-10" />
                        <div className="relative">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Ready to Start Your Journey?
                            </h2>
                            <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
                                Join half a million travelers who've discovered
                                their dream destinations with Triplus
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {!user ? (
                                    // Show for guests only
                                    <Link
                                        href="/booking"
                                        className="px-8 py-4 bg-white text-emerald-600 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg"
                                    >
                                        Create Free Account
                                    </Link>
                                ) : (
                                    // Show for logged in users
                                    <Link
                                        href="/booking"
                                        className="px-8 py-4 bg-white text-emerald-600 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg"
                                    >
                                        Go to All Trips
                                    </Link>
                                )}
                                <Link
                                    href="/destinations"
                                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all"
                                >
                                    Browse Destinations
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;
