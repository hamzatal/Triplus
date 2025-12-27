import React, { useState, useEffect } from "react";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    User, // Assuming this is for an icon, not used in the form directly
    Home,
    Shield, // Assuming this is for an icon
    PlaneIcon, // Assuming this is for an icon
    AmpersandIcon, // Assuming this is for an icon
    ShieldAlert,
    PhoneCall,
} from "lucide-react";
import { Head, Link, useForm, usePage } from "@inertiajs/react"; // Added usePage
import { motion, AnimatePresence } from "framer-motion"; // Added motion and AnimatePresence

// Notification Component (as provided by you)
const Notification = ({ message, type }) => {
    const [visible, setVisible] = useState(!!message);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 3000); // Notification visible for 3 seconds
            return () => clearTimeout(timer);
        }
    }, [message, type]); // Re-run effect if message or type changes

    if (!visible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-6 right-6 z-[100] p-4 rounded-md shadow-xl text-white text-sm font-medium ${
                type === "error" ? "bg-red-600" : "bg-green-600"
            }`}
        >
            {message}
        </motion.div>
    );
};

const AdminLoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    // Use flash messages from Inertia for notifications if available
    const { flash, errors: pageErrors } = usePage().props; // Get flash and global errors
    const [notification, setNotification] = useState(null); // Local notification state

    // Display flash messages
    useEffect(() => {
        if (flash?.success) {
            setNotification({ type: "success", message: flash.success });
        } else if (flash?.error) {
            setNotification({ type: "error", message: flash.error });
        } else if (
            pageErrors &&
            Object.keys(pageErrors).length > 0 &&
            !pageErrors.email &&
            !pageErrors.password
        ) {
            // Handle general page errors if not field-specific
            const generalError = Object.values(pageErrors)[0];
            if (typeof generalError === "string") {
                setNotification({ type: "error", message: generalError });
            }
        }
    }, [flash, pageErrors]);

    // Validation Functions (client-side, optional but good UX)
    const validateEmail = (email) => {
        if (!email) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
            return "Please enter a valid email address";
        if (email.length > 100) return "Email cannot exceed 100 characters";
        return null;
    };

    const validatePassword = (password) => {
        if (!password) return "Password is required";
        // Admin password length check can be less strict on client if server enforces it
        // if (password.length < 8) return "Admin password must be at least 8 characters long";
        return null;
    };

    const {
        data,
        setData,
        post,
        processing,
        errors, // These are server-side validation errors from Inertia
        reset,
        setError, // To manually set errors from client-side validation
        clearErrors,
    } = useForm({
        email: "",
        password: "",
        remember: true, // Default remember to true as in your original
    });

    useEffect(() => {
        // Clear password on component unmount for security
        return () => {
            reset("password");
        };
    }, []);

    const clientValidateForm = () => {
        // Renamed to avoid conflict
        const newClientErrors = {};
        const emailError = validateEmail(data.email);
        if (emailError) newClientErrors.email = emailError;
        const passwordError = validatePassword(data.password);
        if (passwordError) newClientErrors.password = passwordError;
        return newClientErrors;
    };

    const submit = (e) => {
        e.preventDefault();
        clearErrors(); // Clear previous server-side errors
        setNotification(null); // Clear previous local notifications

        const clientSideErrors = clientValidateForm();
        if (Object.keys(clientSideErrors).length > 0) {
            Object.keys(clientSideErrors).forEach((key) => {
                setError(key, clientSideErrors[key]); // Set errors for useForm to display
            });
            setNotification({
                type: "error",
                message: "Please fix the errors highlighted below.",
            });
            return;
        }

        // *** THE CRITICAL FIX IS HERE ***
        // Use the correct named route for the POST request: 'admin.login.submit'
        post(route("admin.login.submit"), {
            // data is automatically sent
            onSuccess: () => {
                // Inertia should automatically handle the redirect from the server.
                // A success notification will be set by the flash message from the server via useEffect.
                // No need for router.visit() here if server sends redirect.
                // setNotification({ // This would be a duplicate if flash message is set
                // type: "success",
                // });
            },
            onError: (serverErrors) => {
                // 'errors' state in useForm is automatically populated with serverErrors.
                // A general error notification can be shown if no specific field errors are returned,
                // or rely on flash.error from server.
                if (
                    !flash?.error &&
                    (!serverErrors || Object.keys(serverErrors).length === 0)
                ) {
                    setNotification({
                        type: "error",
                        message:
                            "Login failed. Please check your credentials or try again.",
                    });
                } else if (flash?.error) {
                    // Flash error is already handled by useEffect
                }
                // Server-side field errors (serverErrors) will be displayed automatically by Inertia if mapped to form fields
            },
            onFinish: () => {
                // This is called regardless of success or error
                // You might want to reset password field on failed attempts for security
                if (Object.keys(errors).length > 0 || (flash && flash.error)) {
                    reset("password");
                }
            },
        });
    };

    return (
        <div className="min-h-screen w-full relative bg-gray-900">
            {" "}
            {/* Added default bg */}
            <Head title="Admin Login - Triplus" />
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" // Reduced opacity
                style={{ backgroundImage: "url('/images/world.svg')" }} // Ensure this image exists
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black opacity-40 z-0" />{" "}
            {/* Adjusted opacity */}
            {/* Home Button */}
            <Link
                href={route("home")} // Assuming 'home' is your main homepage route
                className="fixed top-6 left-6 z-50 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all text-sm"
            >
                <Home className="w-4 h-4" /> {/* Slightly smaller icon */}
                <span className="font-medium">Home</span>
            </Link>
            {/* Contact Us Button */}
            <Link
                href={route("ContactPage")} // Assuming 'ContactPage' is a named route
                className="fixed top-20 left-6 z-50 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all text-sm" // Changed color for distinction
            >
                <PhoneCall className="w-4 h-4" />
                <span className="font-medium">Contact Us</span>
            </Link>
            <Notification // Using the improved Notification component
                message={notification?.message}
                type={notification?.type}
            />
            <div className="relative z-10 min-h-screen flex">
                {/* Left Decorative Panel (Hidden on small screens) */}
                <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white">
                    <div className="text-center space-y-8">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                duration: 0.5,
                                type: "spring",
                                stiffness: 120,
                            }}
                            className="bg-green-600/20 p-6 rounded-full inline-block mx-auto border-2 border-green-500"
                        >
                            <ShieldAlert className="w-20 h-20 text-green-400" />{" "}
                            {/* Changed icon */}
                        </motion.div>
                        <motion.h1
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-5xl font-bold text-white"
                        >
                            Triplus{" "}
                            <span className="text-green-400">Admin</span>
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-gray-300 max-w-md mx-auto text-lg"
                        >
                            Secure administrative access. Authorized personnel
                            only.
                        </motion.p>
                    </div>
                </div>

                {/* Right Login Form Panel */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md p-8 rounded-xl shadow-2xl bg-gray-800/90 backdrop-blur-md border border-gray-700"
                    >
                        {/* Mobile Header */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="bg-green-600/20 p-4 rounded-full inline-block mx-auto border border-green-500/50">
                                <ShieldAlert className="w-12 h-12 text-green-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mt-4">
                                <span className="text-green-400">
                                    Admin Panel
                                </span>
                            </h1>
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-2 flex items-center justify-center">
                            <Shield className="inline-block w-7 h-7 text-green-400 mr-2" />{" "}
                            {/* Consistent icon */}
                            Administrator Login
                        </h2>
                        <p className="text-gray-400 text-center mb-8 text-sm">
                            Enter your admin credentials to proceed.
                        </p>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-300 mb-1.5"
                                >
                                    Admin Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        id="email" // Added id for label
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className={`pl-10 w-full p-3 rounded-lg border bg-gray-700 text-white placeholder-gray-500 transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none ${
                                            errors.email
                                                ? "border-red-500"
                                                : "border-gray-600 hover:border-gray-500"
                                        }`}
                                        placeholder="admin@example.com"
                                        autoComplete="username"
                                    />
                                </div>
                                {errors.email && (
                                    <span className="text-red-500 text-xs mt-1.5 block">
                                        {errors.email}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-300 mb-1.5"
                                >
                                    Admin Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        id="password" // Added id for label
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        className={`pl-10 pr-10 w-full p-3 rounded-lg border bg-gray-700 text-white placeholder-gray-500 transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none ${
                                            errors.password
                                                ? "border-red-500"
                                                : "border-gray-600 hover:border-gray-500"
                                        }`}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors focus:outline-none"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="text-red-500 text-xs mt-1.5 block">
                                        {errors.password}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-xs sm:text-sm">
                                <label className="flex items-center text-gray-400 hover:text-gray-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                "remember",
                                                e.target.checked
                                            )
                                        }
                                        className="mr-2 h-4 w-4 rounded border-gray-500 text-green-600 focus:ring-green-500 bg-gray-700"
                                    />
                                    Remember me
                                </label>
                                {/* Assuming admin password reset is handled differently or not available */}
                                {/* <Link
                                    href={route("password.request")} // This is typically for user password reset
                                    className="font-medium text-green-500 hover:text-green-400 hover:underline transition-colors"
                                >
                                    Forgot password?
                                </Link> */}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 flex items-center justify-center bg-green-600 text-white rounded-lg font-semibold text-base transition-all hover:bg-green-700 active:bg-green-800 disabled:opacity-60 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                            >
                                <Shield className="w-5 h-5 mr-2.5" />
                                {processing
                                    ? "Signing In..."
                                    : "Access Admin Panel"}
                            </button>

                            <p className="text-center text-xs sm:text-sm text-gray-500 mt-8">
                                This panel is for authorized administrators
                                only.
                                <br />
                                Return to{" "}
                                <Link
                                    href={route("login")} // Route to user/company login
                                    className="font-medium text-green-500 hover:text-green-400 hover:underline transition-colors"
                                >
                                    User/Company Sign In
                                </Link>
                            </p>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
