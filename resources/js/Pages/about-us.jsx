import React from "react";
import { Head, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    MapPin,
    Globe,
    Calendar,
    Clock,
    Users,
    Shield,
    Home,
} from "lucide-react";

const About = ({ auth }) => {
    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white transition-all duration-300 relative">
            <Head title="About Us - Triplus" />

            {/* Home Button */}
            <Link
                href="/home"
                className="fixed top-6 left-6 z-50 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all"
            >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
            </Link>

            {/* Hero Section */}
            <div className="relative h-64 md:h-72 overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 opacity-80"></div>
                <div className="absolute inset-0 bg-[url('/images/world.svg')] bg-no-repeat bg-center opacity-30 bg-fill"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="text-6xl font-extrabold mb-2 leading-tight"
                        >
                            About <span className="text-green-400">Us</span>
                        </motion.h1>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                        >
                            <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
                {/* Introduction */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    variants={fadeIn}
                    className="text-center max-w-4xl mx-auto mb-16"
                >
                    <p className="text-xl mb-8 leading-relaxed text-gray-300">
                        At Triplus, we're passionate about making your travel
                        dreams a reality. Our mission is to simplify trip
                        planning, connect you with unforgettable destinations,
                        and provide a seamless experience from start to finish.
                    </p>
                </motion.div>

                {/* Our Story and Vision */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* Our Story */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        variants={fadeIn}
                        className="bg-gray-800 bg-opacity-70 rounded-xl p-8 shadow-2xl backdrop-blur-sm border border-gray-700 h-full"
                    >
                        <h2 className="text-3xl font-bold mb-6 flex items-center">
                            <span className="bg-green-600 p-2 rounded-full mr-3">
                                <Users className="h-6 w-6" />
                            </span>
                            Our{" "}
                            <span className="text-green-500 ml-2">Story</span>
                        </h2>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>
                                Founded by a team of travel enthusiasts in 2020,
                                Triplus started with a simple idea: to create a
                                platform that inspires and empowers travelers
                                from all walks of life.
                            </p>
                            <p>
                                Our founders, having experienced the challenges
                                of travel planning firsthand, decided to build a
                                solution that combines cutting-edge technology
                                with personalized service to make travel
                                accessible to everyone.
                            </p>
                            <p>
                                Whether you're seeking a relaxing getaway or an
                                adventurous journey, we're here to guide you
                                every step of the way.
                            </p>
                        </div>
                    </motion.div>

                    {/* Our Vision */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        variants={fadeIn}
                        className="bg-gray-800 bg-opacity-70 rounded-xl p-8 shadow-2xl backdrop-blur-sm border border-gray-700 h-full"
                    >
                        <h2 className="text-3xl font-bold mb-6 flex items-center">
                            <span className="bg-green-600 p-2 rounded-full mr-3">
                                <Globe className="h-6 w-6" />
                            </span>
                            Our{" "}
                            <span className="text-green-500 ml-2">Vision</span>
                        </h2>
                        <div className="space-y-4 text-gray-300 leading-relaxed">
                            <p>
                                We envision a world where travel is not just
                                about destinations, but about transformative
                                experiences that broaden horizons and create
                                lasting memories.
                            </p>
                            <p>
                                Triplus aims to be the bridge connecting
                                cultures, people, and places, fostering
                                understanding and appreciation of our diverse
                                world.
                            </p>
                            <p>
                                By leveraging innovative technology and our deep
                                passion for exploration, we're working to make
                                every journey an enriching adventure that begins
                                the moment you visit our platform.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Our Mission */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    variants={fadeIn}
                    className="bg-gray-900 bg-opacity-30 rounded-xl p-8 shadow-2xl max-w-4xl mx-auto mb-16 border border-green-800"
                >
                    <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
                        <span className="bg-green-600 p-2 rounded-full mr-3">
                            <Shield className="h-6 w-6" />
                        </span>
                        Our <span className="text-green-500 ml-2">Mission</span>
                    </h2>
                    <div className="text-gray-200 leading-relaxed space-y-4">
                        <p>
                            We aim to make travel accessible, enjoyable, and
                            stress-free for everyone. By offering personalized
                            recommendations, secure booking options, and
                            top-notch support, we strive to be your trusted
                            travel companion.
                        </p>
                        <p>
                            Our commitment extends beyond just facilitating
                            bookings - we're dedicated to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                Promoting sustainable and responsible tourism
                                practices
                            </li>
                            <li>
                                Supporting local communities in popular
                                destinations
                            </li>
                            <li>
                                Making travel inclusive and accessible to
                                diverse audiences
                            </li>
                            <li>
                                Continuously innovating to meet the evolving
                                needs of modern travelers
                            </li>
                        </ul>
                    </div>
                </motion.div>

                {/* Why Choose Us */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    variants={fadeIn}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl font-bold mb-8">
                        Why Choose{" "}
                        <span className="text-green-500">Triplus</span>?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            whileHover={{
                                y: -10,
                                transition: { duration: 0.3 },
                            }}
                            className="bg-gray-800 bg-opacity-70 p-8 rounded-lg shadow-lg border border-gray-700"
                        >
                            <div className="bg-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                <Globe className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                Global Destinations
                            </h3>
                            <p className="text-gray-300">
                                Explore a world of possibilities with our
                                extensive network of destinations across six
                                continents and over 180 countries.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{
                                y: -10,
                                transition: { duration: 0.3 },
                            }}
                            className="bg-gray-800 bg-opacity-70 p-8 rounded-lg shadow-lg border border-gray-700"
                        >
                            <div className="bg-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                Easy Booking
                            </h3>
                            <p className="text-gray-300">
                                Book flights, hotels, and experiences with just
                                a few clicks. Our intuitive platform ensures
                                hassle-free planning every time.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{
                                y: -10,
                                transition: { duration: 0.3 },
                            }}
                            className="bg-gray-800 bg-opacity-70 p-8 rounded-lg shadow-lg border border-gray-700"
                        >
                            <div className="bg-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                <Clock className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">
                                24/7 Support
                            </h3>
                            <p className="text-gray-300">
                                Our dedicated team is always here to assist you,
                                day or night. Travel with confidence knowing
                                we've got your back.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Our Values */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    variants={fadeIn}
                    className="bg-gray-800 bg-opacity-70 rounded-xl p-8 shadow-2xl max-w-4xl mx-auto mb-16 border border-gray-700"
                >
                    <h2 className="text-3xl font-bold mb-6 text-center">
                        Our <span className="text-green-500">Values</span>
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                title: "Innovation",
                                description:
                                    "We embrace new technologies and ideas to continuously improve our service.",
                            },
                            {
                                title: "Integrity",
                                description:
                                    "We operate with transparency and honesty in all our interactions.",
                            },
                            {
                                title: "Inclusivity",
                                description:
                                    "We believe travel should be accessible to everyone, regardless of background.",
                            },
                            {
                                title: "Sustainability",
                                description:
                                    "We promote responsible travel practices that respect our planet.",
                            },
                        ].map((value, index) => (
                            <div key={index} className="flex items-start p-4">
                                <div className="bg-green-600 p-2 rounded-full mr-4 mt-1">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-green-400">
                                        {value.title}
                                    </h3>
                                    <p className="text-gray-300">
                                        {value.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    variants={fadeIn}
                    className="text-center bg-green-900 bg-opacity-40 rounded-xl p-8 shadow-xl max-w-3xl mx-auto border border-green-800"
                >
                    <h2 className="text-2xl font-bold mb-4">
                        Ready to Explore with{" "}
                        <span className="text-green-400">Triplus</span>?
                    </h2>
                    <p className="text-gray-300 mb-6">
                        Join thousands of satisfied travelers who have
                        discovered their perfect destinations with us.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="/register"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-300"
                        >
                            Sign Up Today
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
