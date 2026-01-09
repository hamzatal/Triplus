import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Mail,
    Pen,
    Save,
    Camera,
    UserCircle2,
    FileText,
    Phone,
    Lock,
    AlertTriangle,
    X,
    Eye,
    EyeOff,
    CheckCircle,
    Shield,
    Sparkles,
    LogOut,
    Settings,
    Bell,
} from "lucide-react";
import NavBar from "../Components/Nav";
import Footer from "../Components/Footer";
import toast, { Toaster } from "react-hot-toast";

const UserProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showDeactivationSuccessModal, setShowDeactivationSuccessModal] =
        useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showDeactivatePassword, setShowDeactivatePassword] = useState(false);
    const [user, setUser] = useState(null);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [processingPw, setProcessingPw] = useState(false);
    const [processingDeactivate, setProcessingDeactivate] = useState(false);

    const [data, setData] = useState({
        name: "",
        email: "",
        avatar: null,
        bio: "",
        phone: "",
    });

    const [pwData, setPwData] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const [deactivateData, setDeactivateData] = useState({
        password: "",
        deactivation_reason: "",
    });

    const getCsrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.content : "";
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("/api/profile", {
                    headers: {
                        Accept: "application/json",
                        "X-CSRF-TOKEN": getCsrfToken(),
                    },
                });
                if (!response.ok) {
                    toast.error(
                        `Failed to load profile: ${response.statusText}`
                    );
                    return;
                }
                const result = await response.json();
                if (result.status === "success") {
                    setUser(result.user);
                    setData({
                        name: result.user.name || "",
                        email: result.user.email || "",
                        avatar: null,
                        bio: result.user.bio || "",
                        phone: result.user.phone || "",
                    });
                } else {
                    toast.error("Failed to load profile.");
                }
            } catch (error) {
                toast.error("Error loading profile.");
            }
        };
        fetchUser();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPwData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleDeactivateChange = (e) => {
        const { name, value } = e.target;
        setDeactivateData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/gif",
            ];
            if (!validTypes.includes(file.type)) {
                toast.error(
                    "Invalid file type. Please upload an image (jpeg, png, jpg, gif)."
                );
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error(
                    "File too large. Please upload an image smaller than 2MB."
                );
                return;
            }
            setData((prev) => ({ ...prev, avatar: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("bio", data.bio);
        formData.append("phone", data.phone);
        if (data.avatar) {
            formData.append("avatar", data.avatar);
        }
        formData.append("_method", "POST");

        try {
            const response = await fetch("/api/profile", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": getCsrfToken(),
                },
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                setUser(result.user);
                setData({
                    name: result.user.name,
                    email: result.user.email,
                    avatar: null,
                    bio: result.user.bio,
                    phone: result.user.phone,
                });
                setIsEditing(false);
                setPreviewImage(null);
                toast.success(result.status);
            } else {
                setErrors(
                    result.errors || { general: "Failed to update profile." }
                );
                toast.error(
                    "Failed to update profile. Please check the errors."
                );
            }
        } catch (error) {
            toast.error("Error updating profile.");
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setProcessingPw(true);
        setErrors({});

        try {
            const response = await fetch("/api/profile/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                },
                body: JSON.stringify(pwData),
            });
            const result = await response.json();
            if (response.ok) {
                setPwData({
                    current_password: "",
                    password: "",
                    password_confirmation: "",
                });
                toast.success(result.status);
            } else {
                setErrors(
                    result.errors || { general: "Failed to update password." }
                );
                toast.error(
                    "Failed to update password. Please check the errors."
                );
            }
        } catch (error) {
            toast.error("Error updating password.");
        } finally {
            setProcessingPw(false);
        }
    };

    const handleDeactivateAccount = async (e) => {
        e.preventDefault();
        setProcessingDeactivate(true);
        setErrors({});

        try {
            const response = await fetch("/api/profile/deactivate", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                },
                body: JSON.stringify(deactivateData),
            });

            const result = await response.json();

            if (response.ok) {
                setShowDeactivateModal(false);
                setShowDeactivationSuccessModal(true);
            } else {
                setErrors(
                    result.errors || {
                        general: "Failed to deactivate account.",
                    }
                );
                toast.error(
                    "Failed to deactivate account. Please check the errors."
                );
            }
        } catch (error) {
            toast.error("Error deactivating account.");
        } finally {
            setProcessingDeactivate(false);
        }
    };

    const handleDeactivationSuccessClose = () => {
        setShowDeactivationSuccessModal(false);
        window.location.href = "/";
    };

    const displayAvatar =
        previewImage ||
        (user?.avatar_url ? user.avatar_url : "/images/avatar.webp");

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "security", label: "Security", icon: Lock },
        { id: "account", label: "Account", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Toaster position="top-right" />
            <NavBar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-semibold text-emerald-400">
                                Your Account
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                            Profile{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                                Settings
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400">
                            Manage your account and preferences
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-6xl mx-auto px-6 pb-20">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar - Avatar & Tabs */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 sticky top-24">
                            {/* Avatar Section */}
                            <div className="text-center mb-6">
                                <div className="relative inline-block mb-4">
                                    <img
                                        src={displayAvatar}
                                        alt="Profile Avatar"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-lg shadow-emerald-500/20"
                                    />
                                    {isEditing && activeTab === "profile" && (
                                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity rounded-full">
                                            <Camera className="text-white w-8 h-8" />
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,image/gif"
                                                className="hidden"
                                                onChange={handleAvatarUpload}
                                            />
                                        </label>
                                    )}
                                </div>

                                {user && (
                                    <>
                                        <h2 className="text-xl font-bold mb-1">
                                            {data.name}
                                        </h2>
                                        <p className="text-sm text-gray-400">
                                            {data.email}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Tabs Navigation */}
                            <div className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setIsEditing(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                            activeTab === tab.id
                                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                                                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                        }`}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Member Info */}
                            {user && (
                                <div className="mt-6 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
                                    <p>Member since</p>
                                    <p className="font-semibold text-white mt-1">
                                        {new Date(
                                            user.created_at
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Main Content Area */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                            {/* Header with Edit Button */}
                            {activeTab === "profile" && (
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold">
                                        Profile Information
                                    </h2>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                        >
                                            <Pen className="w-4 h-4" />
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setPreviewImage(null);
                                                    setData((prev) => ({
                                                        ...prev,
                                                        avatar: null,
                                                    }));
                                                }}
                                                className="px-4 py-2 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={processing}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                                            >
                                                <Save className="w-4 h-4" />
                                                {processing
                                                    ? "Saving..."
                                                    : "Save Changes"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab Content */}
                            <AnimatePresence mode="wait">
                                {activeTab === "profile" && (
                                    <motion.div
                                        key="profile"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-6"
                                    >
                                        {isEditing ? (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Full Name
                                                    </label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={data.name}
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        />
                                                    </div>
                                                    {errors.name && (
                                                        <p className="mt-1 text-red-400 text-sm">
                                                            {errors.name}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Email Address
                                                    </label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={data.email}
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        />
                                                    </div>
                                                    {errors.email && (
                                                        <p className="mt-1 text-red-400 text-sm">
                                                            {errors.email}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Phone Number
                                                    </label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={data.phone}
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        />
                                                    </div>
                                                    {errors.phone && (
                                                        <p className="mt-1 text-red-400 text-sm">
                                                            {errors.phone}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Bio
                                                    </label>
                                                    <div className="relative">
                                                        <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                        <textarea
                                                            name="bio"
                                                            value={data.bio}
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            rows="4"
                                                            className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                                            placeholder="Tell us about yourself..."
                                                        />
                                                    </div>
                                                    {errors.bio && (
                                                        <p className="mt-1 text-red-400 text-sm">
                                                            {errors.bio}
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            user && (
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl">
                                                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                                            <User className="w-6 h-6 text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400">
                                                                Full Name
                                                            </p>
                                                            <p className="text-lg font-semibold">
                                                                {data.name}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl">
                                                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                                            <Mail className="w-6 h-6 text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400">
                                                                Email Address
                                                            </p>
                                                            <p className="text-lg font-semibold">
                                                                {data.email}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {data.phone && (
                                                        <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl">
                                                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                                                <Phone className="w-6 h-6 text-emerald-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-400">
                                                                    Phone Number
                                                                </p>
                                                                <p className="text-lg font-semibold">
                                                                    {data.phone}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-xl">
                                                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                            <FileText className="w-6 h-6 text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400 mb-1">
                                                                Bio
                                                            </p>
                                                            <p className="text-gray-300">
                                                                {data.bio ||
                                                                    "No bio available"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === "security" && (
                                    <motion.div
                                        key="security"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                            <Lock className="w-6 h-6 text-emerald-400" />
                                            Change Password
                                        </h2>

                                        <form
                                            onSubmit={handleUpdatePassword}
                                            className="space-y-6"
                                        >
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Current Password
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type={
                                                            showCurrentPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        name="current_password"
                                                        value={
                                                            pwData.current_password
                                                        }
                                                        onChange={
                                                            handlePasswordChange
                                                        }
                                                        className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowCurrentPassword(
                                                                !showCurrentPassword
                                                            )
                                                        }
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                                    >
                                                        {showCurrentPassword ? (
                                                            <EyeOff className="w-5 h-5" />
                                                        ) : (
                                                            <Eye className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                                {errors.current_password && (
                                                    <p className="mt-1 text-red-400 text-sm">
                                                        {
                                                            errors.current_password
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    New Password
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type={
                                                            showNewPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        name="password"
                                                        value={pwData.password}
                                                        onChange={
                                                            handlePasswordChange
                                                        }
                                                        className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowNewPassword(
                                                                !showNewPassword
                                                            )
                                                        }
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                                    >
                                                        {showNewPassword ? (
                                                            <EyeOff className="w-5 h-5" />
                                                        ) : (
                                                            <Eye className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                                {errors.password && (
                                                    <p className="mt-1 text-red-400 text-sm">
                                                        {errors.password}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Confirm New Password
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type={
                                                            showConfirmPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        name="password_confirmation"
                                                        value={
                                                            pwData.password_confirmation
                                                        }
                                                        onChange={
                                                            handlePasswordChange
                                                        }
                                                        className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowConfirmPassword(
                                                                !showConfirmPassword
                                                            )
                                                        }
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="w-5 h-5" />
                                                        ) : (
                                                            <Eye className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={processingPw}
                                                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <Shield className="w-5 h-5" />
                                                {processingPw
                                                    ? "Updating..."
                                                    : "Update Password"}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}

                                {activeTab === "account" && (
                                    <motion.div
                                        key="account"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                            <Settings className="w-6 h-6 text-emerald-400" />
                                            Account Management
                                        </h2>

                                        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-red-400 mb-2">
                                                        Deactivate Account
                                                    </h3>
                                                    <p className="text-gray-300 mb-4">
                                                        Deactivating your
                                                        account will make your
                                                        profile and content
                                                        inaccessible. You can
                                                        reactivate your account
                                                        at any time by logging
                                                        in again.
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    setShowDeactivateModal(true)
                                                }
                                                className="w-full py-3 px-4 bg-transparent border-2 border-red-500 text-red-400 rounded-xl font-semibold hover:bg-red-500/10 transition-all"
                                            >
                                                Deactivate Account
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Deactivate Modal */}
            <AnimatePresence>
                {showDeactivateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDeactivateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 border border-gray-700 rounded-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold">
                                    Deactivate Account
                                </h3>
                            </div>

                            <form
                                onSubmit={handleDeactivateAccount}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={
                                                showDeactivatePassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            value={deactivateData.password}
                                            onChange={handleDeactivateChange}
                                            required
                                            className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowDeactivatePassword(
                                                    !showDeactivatePassword
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            {showDeactivatePassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-red-400 text-sm">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Reason for Deactivation (Optional)
                                    </label>
                                    <textarea
                                        name="deactivation_reason"
                                        value={
                                            deactivateData.deactivation_reason
                                        }
                                        onChange={handleDeactivateChange}
                                        rows="3"
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                        placeholder="Tell us why you're leaving..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDeactivateModal(false)
                                        }
                                        className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processingDeactivate}
                                        className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                                    >
                                        {processingDeactivate
                                            ? "Processing..."
                                            : "Deactivate"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {showDeactivationSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 border border-emerald-500/30 rounded-2xl max-w-md w-full p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-400" />
                            </div>

                            <h3 className="text-2xl font-bold mb-4">
                                Account Deactivated
                            </h3>
                            <p className="text-gray-300 mb-6">
                                Your account has been successfully deactivated.
                                If you need any assistance, please contact our
                                support team:
                            </p>

                            <div className="bg-gray-900/50 rounded-xl p-4 mb-6 space-y-3 text-left">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-emerald-400" />
                                    <span className="text-gray-300">
                                        <strong className="text-white">
                                            Phone:
                                        </strong>{" "}
                                        +1234567890
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-emerald-400" />
                                    <span className="text-gray-300">
                                        <strong className="text-white">
                                            Email:
                                        </strong>{" "}
                                        Triplus@support.com
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleDeactivationSuccessClose}
                                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                OK
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default UserProfile;
