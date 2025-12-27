import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Home, LogIn, PhoneCall } from "lucide-react";
import { Head, Link, useForm } from "@inertiajs/react";

const ResetPassword = ({ token, email }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [notification, setNotification] = useState(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        return () => reset("password", "password_confirmation");
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!data.email) newErrors.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(data.email))
            newErrors.email = "Please enter a valid email address";
        else if (data.email.length > 100)
            newErrors.email = "Email cannot exceed 100 characters";

        if (!data.password) newErrors.password = "Password is required";
        else if (data.password.length < 8)
            newErrors.password = "Password must be at least 8 characters";
        else if (data.password.length > 50)
            newErrors.password = "Password cannot exceed 50 characters";

        if (!data.password_confirmation)
            newErrors.password_confirmation = "Confirm password is required";
        else if (data.password !== data.password_confirmation)
            newErrors.password_confirmation = "Passwords do not match";

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
                message: "Please fix the errors below.",
            });
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        post(route("password.store"), {
            onSuccess: () => {
                setNotification({
                    type: "success",
                    message:
                        "Password reset successfully! Redirecting to login...",
                });
                setTimeout(() => {
                    window.location.href = route("login");
                }, 2000);
            },
            onError: () => {
                setNotification({
                    type: "error",
                    message: "Failed to reset password. Please try again.",
                });
                setTimeout(() => setNotification(null), 3000);
            },
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <div
            className="min-h-screen flex bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/images/world.svg')" }}
        >
            <Head title="Reset Password - Triplus" />

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

            <div className="w-full flex flex-col justify-center items-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md p-8 rounded-xl shadow-xl bg-gray-800/90 backdrop-blur-sm hover:shadow-green-500/30 transition-shadow"
                >
                    <h2 className="text-2xl font-bold mb-6 text-white text-center">
                        Reset Your Password
                    </h2>

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

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className={`pl-10 pr-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 ${
                                        errors.password ? "border-red-500" : ""
                                    }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    className={`pl-10 pr-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 ${
                                        errors.password_confirmation
                                            ? "border-red-500"
                                            : ""
                                    }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {processing ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
