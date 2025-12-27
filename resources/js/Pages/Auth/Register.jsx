import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    Home,
    Building2,
    ChevronRight,
    PhoneCall,
} from "lucide-react";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [notification, setNotification] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [accountType, setAccountType] = useState("user");

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
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "user",
        company_name: "",
        license_number: "",
    });

    useEffect(() => {
        return () => reset("password", "password_confirmation");
    }, []);

    useEffect(() => {
        setData("role", accountType);
    }, [accountType]);

    const validateName = (name) => {
        if (!name) return "Name is required";
        if (name.length < 2) return "Name must be at least 2 characters long";
        if (name.length > 50) return "Name cannot exceed 50 characters";
        if (!/^[a-zA-Z\s'-]+$/.test(name))
            return "Name can only contain letters, spaces, hyphens, and apostrophes";
        return null;
    };

    const validateCompanyName = (companyName) => {
        if (accountType === "company" && !companyName)
            return "Company name is required";
        if (companyName && companyName.length < 2)
            return "Company name must be at least 2 characters long";
        if (companyName && companyName.length > 100)
            return "Company name cannot exceed 100 characters";
        return null;
    };

    const validateLicenseNumber = (licenseNumber) => {
        if (accountType === "company" && !licenseNumber)
            return "License number is required";
        if (licenseNumber && licenseNumber.length > 50)
            return "License number cannot exceed 50 characters";
        if (licenseNumber && !/^[a-zA-Z0-9-]+$/.test(licenseNumber))
            return "License number can only contain letters, numbers, and hyphens";
        return null;
    };

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
        if (password.length < 8)
            return "Password must be at least 8 characters long";
        if (password.length > 64) return "Password cannot exceed 64 characters";
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        if (!hasUpperCase)
            return "Password must contain at least one uppercase letter";
        if (!hasLowerCase)
            return "Password must contain at least one lowercase letter";
        if (!hasNumbers) return "Password must contain at least one number";
        if (!hasSpecialChar)
            return "Password must contain at least one special character";
        return null;
    };

    const validateConfirmPassword = (password, confirmPassword) => {
        if (!confirmPassword) return "Please confirm your password";
        if (password !== confirmPassword) return "Passwords do not match";
        return null;
    };

    const validate = () => {
        const newErrors = {};
        if (currentStep === 1) {
            if (!accountType) newErrors.role = "Please select an account type";
        }
        if (currentStep === 2) {
            const nameError = validateName(data.name);
            if (nameError) newErrors.name = nameError;
            const companyNameError = validateCompanyName(data.company_name);
            if (companyNameError) newErrors.company_name = companyNameError;
            const licenseNumberError = validateLicenseNumber(
                data.license_number
            );
            if (licenseNumberError)
                newErrors.license_number = licenseNumberError;
            const emailError = validateEmail(data.email);
            if (emailError) newErrors.email = emailError;
        }
        if (currentStep === 3) {
            const passwordError = validatePassword(data.password);
            if (passwordError) newErrors.password = passwordError;
            const confirmPasswordError = validateConfirmPassword(
                data.password,
                data.password_confirmation
            );
            if (confirmPasswordError)
                newErrors.password_confirmation = confirmPasswordError;
        }
        return newErrors;
    };

    const handleNextStep = () => {
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
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
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
        const routeName =
            accountType === "company" ? "company.register" : "register";
        post(route(routeName), {
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                password_confirmation: data.password_confirmation,
                ...(accountType === "company" && {
                    company_name: data.company_name,
                    license_number: data.license_number,
                }),
            },
            onSuccess: () => {
                setNotification({
                    type: "success",
                    message:
                        accountType === "company"
                            ? "Company registration successful! Redirecting to dashboard..."
                            : "Registration successful! Please verify your email.",
                });
                setTimeout(() => setNotification(null), 2000);
            },
            onError: (serverErrors) => {
                setNotification({
                    type: "error",
                    message:
                        serverErrors.email ||
                        serverErrors.company_name ||
                        serverErrors.license_number ||
                        "Registration failed. Please try again.",
                });
                setTimeout(() => setNotification(null), 3000);
            },
        });
    };

    const renderStepIndicator = () => {
        return (
            <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-2">
                    {[1, 2, 3].map((step) => (
                        <React.Fragment key={step}>
                            <div
                                className={`rounded-full h-10 w-10 flex items-center justify-center font-medium
                                    ${
                                        currentStep === step
                                            ? "bg-green-600 text-white"
                                            : currentStep > step
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-700 text-gray-300"
                                    }`}
                            >
                                {step}
                            </div>
                            {step < 3 && (
                                <ChevronRight
                                    className={`w-5 h-5 ${
                                        currentStep > step
                                            ? "text-green-500"
                                            : "text-gray-500"
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-white">
                                Choose Account Type
                            </h3>
                            <p className="text-sm text-gray-400 mt-2">
                                Select the type of account you want to create
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                className={`p-6 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center
                                    ${
                                        accountType === "user"
                                            ? "border-green-500 bg-green-600/20"
                                            : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                                    }`}
                                onClick={() => setAccountType("user")}
                            >
                                <User
                                    className={`w-12 h-12 mb-4 ${
                                        accountType === "user"
                                            ? "text-green-400"
                                            : "text-gray-400"
                                    }`}
                                />
                                <h4 className="text-lg font-medium text-white">
                                    Individual
                                </h4>
                                <p className="text-sm text-gray-400 text-center mt-2">
                                    For personal travel and experiences
                                </p>
                            </div>
                            <div
                                className={`p-6 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center
                                    ${
                                        accountType === "company"
                                            ? "border-green-500 bg-green-600/20"
                                            : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                                    }`}
                                onClick={() => setAccountType("company")}
                            >
                                <Building2
                                    className={`w-12 h-12 mb-4 ${
                                        accountType === "company"
                                            ? "text-green-400"
                                            : "text-gray-400"
                                    }`}
                                />
                                <h4 className="text-lg font-medium text-white">
                                    Company
                                </h4>
                                <p className="text-sm text-gray-400 text-center mt-2">
                                    For managing travel services and listings
                                </p>
                            </div>
                        </div>
                        {errors.role && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.role}
                            </p>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-white">
                                {accountType === "company"
                                    ? "Company Information"
                                    : "Personal Information"}
                            </h3>
                            <p className="text-sm text-gray-400 mt-2">
                                {accountType === "company"
                                    ? "Tell us about your company"
                                    : "Tell us who you are"}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {accountType === "company"
                                    ? "Contact Person Name"
                                    : "Full Name"}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className={`pl-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                        errors.name ? "border-red-500" : ""
                                    }`}
                                    placeholder={
                                        accountType === "company"
                                            ? "Contact Person Name"
                                            : "Your Name"
                                    }
                                />
                            </div>
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        {accountType === "company" && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Company Name
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.company_name}
                                            onChange={(e) =>
                                                setData(
                                                    "company_name",
                                                    e.target.value
                                                )
                                            }
                                            className={`pl-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                                errors.company_name
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                            placeholder="Your Company Name"
                                        />
                                    </div>
                                    {errors.company_name && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.company_name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        License Number
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.license_number}
                                            onChange={(e) =>
                                                setData(
                                                    "license_number",
                                                    e.target.value
                                                )
                                            }
                                            className={`pl-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                                errors.license_number
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                            placeholder="Company License Number"
                                        />
                                    </div>
                                    {errors.license_number && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.license_number}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
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
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-white">
                                Set Password
                            </h3>
                            <p className="text-sm text-gray-400 mt-2">
                                Create a secure password for your account
                            </p>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    className={`pl-10 pr-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                        errors.password_confirmation
                                            ? "border-red-500"
                                            : ""
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
                            {errors.password_confirmation && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderStepButtons = () => {
        return (
            <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                    <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-all"
                    >
                        Back
                    </button>
                ) : (
                    <div></div>
                )}
                <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                    disabled={processing}
                >
                    <span>
                        {currentStep === 3
                            ? processing
                                ? "Creating Account..."
                                : "Complete Registration"
                            : "Next"}
                    </span>
                    {currentStep < 3 && <ChevronRight className="w-5 h-5" />}
                </button>
            </div>
        );
    };

    return (
        <div
            className="min-h-screen flex bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/images/world.png')" }}
        >
            <Head title="Register - Triplus" />
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
                        Join <span className="text-green-500">Triplus</span>
                    </h1>
                    <p className="text-gray-300 max-w-md mx-auto text-lg">
                        {accountType === "company"
                            ? "Create a company account to list your travel services, packages, and destinations."
                            : "Create an account to start planning your next adventure. Discover new destinations and explore the world with us."}
                    </p>
                </div>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
                <div className="w-full max-w-md p-8 rounded-xl shadow-xl bg-gray-800/90 backdrop-blur-sm">
                    {renderStepIndicator()}
                    {renderStepContent()}
                    {renderStepButtons()}
                    <p className="text-center text-sm text-gray-400 mt-6">
                        Already have an account?{" "}
                        <Link
                            href={route("login")}
                            className="text-green-400 font-medium hover:text-green-300 hover:underline transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
