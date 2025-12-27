import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Home, UserPlus, PhoneCall } from "lucide-react";
import { Head, Link, useForm } from "@inertiajs/react";

const VerifyEmail = ({ status }) => {
    const [notification, setNotification] = useState(null);

    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route("verification.send"), {
            onSuccess: () => {
                setNotification({
                    type: "success",
                    message: "Verification link sent to your email!",
                });
                setTimeout(() => setNotification(null), 3000);
            },
            onError: () => {
                setNotification({
                    type: "error",
                    message: "Failed to send verification email.",
                });
                setTimeout(() => setNotification(null), 3000);
            },
        });
    };

    return (
        <div
            className="min-h-screen flex bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/images/world.png')" }}
        >
            <Head title="Email Verification - Triplus" />

            <Link
                href="/"
                className="fixed top-6 left-6 z-50 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all"
            >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
            </Link>

            <Link
                href="/ContactPage"
                className="fixed top-20 left-6 z-50 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all"
            >
                <PhoneCall className="w-5 h-5" />
                <span className="font-medium">Contact Us</span>
            </Link>

            <Link
                href={route("register")}
                className="fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all"
            >
                <UserPlus className="w-5 h-5" />
                <span>Register</span>
            </Link>

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white ${
                            notification.type === "success"
                                ? "bg-green-600"
                                : "bg-red-600"
                        }`}
                    >
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full flex flex-col justify-center items-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md p-8 rounded-xl shadow-xl bg-gray-800/90 backdrop-blur-sm hover:shadow-green-500/30 transition-shadow"
                >
                    <div className="text-center space-y-6">
                        <Mail className="w-16 h-16 text-green-500 mx-auto animate-pulse" />
                        <h2 className="text-2xl font-bold text-white">
                            Verify Your Email
                        </h2>
                    </div>
                    <p className="mt-4 mb-6 text-sm text-gray-300 text-center">
                        Thanks for signing up! Please verify your email address
                        by clicking the link we sent you. Didn’t receive it?
                        Resend below.
                    </p>

                    {status === "verification-link-sent" && (
                        <div className="mb-6 text-sm font-medium text-green-400 text-center">
                            A new verification link has been sent to your email.
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {processing
                                ? "Sending..."
                                : "Resend Verification Email"}
                        </button>

                        <div className="text-center">
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="text-sm text-green-400 hover:text-green-300 hover:underline transition-colors"
                            >
                                Log Out
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default VerifyEmail;
