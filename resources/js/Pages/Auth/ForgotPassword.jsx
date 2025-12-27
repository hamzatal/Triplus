import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Home, LogIn, PhoneCall } from "lucide-react";
import { Head, Link, useForm } from "@inertiajs/react";

export default function ForgotPassword({ status }) {
    const [notification, setNotification] = useState(null);

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            email: "",
        });

    const validate = () => {
        const newErrors = {};
        if (!data.email) newErrors.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(data.email))
            newErrors.email = "Please enter a valid email address";
        return newErrors;
    };

    const submit = (e) => {
        e.preventDefault();
        clearErrors();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            Object.entries(validationErrors).forEach(([key, message]) =>
                setError(key, message)
            );
            setNotification({
                type: "error",
                message: "Please enter a valid email address.",
            });
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        post(route("password.email"), {
            onSuccess: () => {
                setNotification({
                    type: "success",
                    message: "Password reset link sent to your email!",
                });
                setTimeout(() => setNotification(null), 3000);
            },
            onError: () => {
                setNotification({
                    type: "error",
                    message: "Failed to send reset link. Please try again.",
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
            <Head title="Forgot Password - Triplus" />

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
                href={route("login")}
                className="fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all"
            >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
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

            <div className="hidden lg:flex w-1/2 items-center justify-center p-12">
                <div className="text-center space-y-6">
                    <Mail className="w-16 h-16 text-green-500 mx-auto animate-pulse" />
                    <h1 className="text-4xl font-bold text-white">
                        Welcome to{" "}
                        <span className="text-green-500">Triplus</span>
                    </h1>
                    <p className="text-gray-300 max-w-md mx-auto text-lg">
                        Forgot your password? No worries! Enter your email to
                        receive a secure link and get back to planning your next
                        adventure.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md p-8 rounded-xl shadow-xl bg-gray-800/90 backdrop-blur-sm hover:shadow-green-500/30 transition-shadow"
                >
                    <div className="text-center space-y-6">
                        <Mail className="w-16 h-16 text-green-500 mx-auto animate-pulse" />
                        <h2 className="text-2xl font-bold text-white">
                            Forgot Your Password?
                        </h2>
                    </div>

                    <p className="text-gray-300 mb-6 text-center text-sm">
                        Enter your email address and we will send you a link to
                        reset your password.
                    </p>

                    {status && (
                        <div className="mb-6 text-sm font-medium text-green-400 text-center">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className={`pl-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 ${
                                        errors.email ? "border-red-500" : ""
                                    }`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {processing
                                ? "Sending..."
                                : "Send Password Reset Link"}
                        </button>

                        <p className="text-center text-sm text-gray-400">
                            Remember your password?{" "}
                            <Link
                                href={route("login")}
                                className="text-green-400 font-medium hover:text-green-300 hover:underline transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
