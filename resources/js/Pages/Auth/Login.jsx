import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Home,
    Building2,
    User,
    PhoneCall,
} from "lucide-react";
import { Head, Link, useForm, usePage, router } from "@inertiajs/react";

export default function Login({ status }) {
    const { auth } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const [notification, setNotification] = useState(null);
    const [accountType, setAccountType] = useState(
        auth.company ? "company" : "user"
    );

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            email: "",
            password: "",
            remember: false,
        });

    useEffect(() => {
        return () => reset("password");
    }, []);

    useEffect(() => {
        if (auth.company && accountType === "company") {
            router.visit(route("home"), { replace: true });
        }
    }, [auth.company, accountType]);

    const validateEmail = (email) => {
        if (!email) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
            return "Please enter a valid email address";
        return null;
    };

    const validatePassword = (password) => {
        if (!password) return "Password is required";
        return null;
    };

    const validate = () => {
        const newErrors = {};
        const emailError = validateEmail(data.email);
        if (emailError) newErrors.email = emailError;
        const passwordError = validatePassword(data.password);
        if (passwordError) newErrors.password = passwordError;
        return newErrors;
    };

    const handleSubmit = (e) => {
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
        const routeName = accountType === "company" ? "company.login" : "login";
        post(route(routeName), {
            onSuccess: () => {
                setTimeout(() => {
                    router.visit(route("home"), { replace: true });
                }, 1000);
            },
            onError: (serverErrors) => {
                setNotification({
                    type: "error",
                    message:
                        serverErrors.email ||
                        "Login failed. Please check your credentials.",
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
            <Head title="Log in - Triplus" />
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
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-4 left-1/3 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg z-20 text-white ${
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
                <div className="text-center space-y-8">
                    <div className="bg-green-600/20 p-6 rounded-full inline-block mx-auto">
                        {accountType === "company" ? (
                            <Building2 className="w-20 h-20 text-green-500" />
                        ) : (
                            <User className="w-20 h-20 text-green-500" />
                        )}
                    </div>
                    <h1 className="text-5xl font-bold text-white">
                        Welcome to{" "}
                        <span className="text-green-500">Triplus</span>
                    </h1>
                    <p className="text-gray-300 max-w-md mx-auto text-lg">
                        {accountType === "company"
                            ? "Log in to manage companies and create your travel ."
                            : "Log in to start planning your next adventure with us."}
                    </p>
                </div>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-2">
                <div className="w-full max-w-md p-5 rounded-xl shadow-xl bg-gray-800/90 backdrop-blur-sm">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-white">
                            Log in to Your Account
                        </h3>
                        <p className="text-sm text-gray-400 mt-2">
                            Select your account type to continue
                        </p>
                    </div>
                    {status && (
                        <div className="mb-4 text-sm text-green-500">
                            {status}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center ${
                                accountType === "user"
                                    ? "border-green-500 bg-green-600/20"
                                    : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                            }`}
                            onClick={() => setAccountType("user")}
                        >
                            <User
                                className={`w-8 h-8 mb-2 ${
                                    accountType === "user"
                                        ? "text-green-400"
                                        : "text-gray-400"
                                }`}
                            />
                            <h4 className="text-sm font-medium text-white">
                                Individual
                            </h4>
                        </div>
                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center ${
                                accountType === "company"
                                    ? "border-green-500 bg-green-600/20"
                                    : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                            }`}
                            onClick={() => setAccountType("company")}
                        >
                            <Building2
                                className={`w-8 h-8 mb-2 ${
                                    accountType === "company"
                                        ? "text-green-400"
                                        : "text-gray-400"
                                }`}
                            />
                            <h4 className="text-sm font-medium text-white">
                                Company
                            </h4>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className={`pl-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none ${
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
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className={`pl-10 pr-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none ${
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
                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                    className="mr-2 rounded border-gray-600 text-green-500 focus:ring-green-500"
                                />
                                Remember me
                            </label>
                            <Link
                                href={route("password.request")}
                                className="text-sm text-green-400 hover:text-green-300 hover:underline transition-colors"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50"
                        >
                            {processing ? "Logging in..." : "Log in"}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-400 mt-6">
                        Don’t have an account?{" "}
                        <Link
                            href={route("register")}
                            className="text-green-400 font-medium hover:text-green-300 hover:underline transition-colors"
                        >
                            Sign up
                        </Link>
                        <span> / </span>
                        <Link
                            href={
                                auth.admin
                                    ? route("admin.dashboard")
                                    : route("admin.login")
                            }
                            className="text-red-400 font-medium hover:text-green-300 hover:underline transition-colors"
                        >
                            Admin ?
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
