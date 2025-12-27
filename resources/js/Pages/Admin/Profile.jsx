import React, { useState, useRef, useEffect } from "react";
import { Head, usePage, useForm } from "@inertiajs/react";
import AdminSidebar from "@/Components/AdminSidebar";
import {
    CheckCircle,
    XCircle,
    User,
    Mail,
    Camera,
    Save,
    Lock,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminProfile() {
    const { props } = usePage();
    const { admin, flash } = props;
    const [avatarPreview, setAvatarPreview] = useState(admin?.avatar || null);
    const fileInputRef = useRef(null);
    const [shownMessages, setShownMessages] = useState(new Set());

    // نموذج تحديث الملف الشخصي
    const {
        data: profileData,
        setData: setProfileData,
        post: postProfile,
        processing: profileProcessing,
        errors: profileErrors,
    } = useForm({
        name: admin?.name || "",
        email: admin?.email || "",
        avatar: null,
    });

    // نموذج تغيير كلمة المرور
    const {
        data: passwordData,
        setData: setPasswordData,
        post: postPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPassword,
    } = useForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData("avatar", file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        postProfile(route("admin.profile.update"), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setAvatarPreview(null);
                fileInputRef.current.value = null;
            },
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        postPassword(route("admin.profile.password"), {
            preserveScroll: true,
            onSuccess: () => {
                resetPassword();
            },
        });
    };

    // إدارة الإشعارات
    useEffect(() => {
        const successMessage = flash.success;
        const errorMessage = flash.error;

        if (successMessage && !shownMessages.has(successMessage)) {
            toast.success(successMessage);
            setShownMessages((prev) => new Set(prev).add(successMessage));
        }

        if (errorMessage && !shownMessages.has(errorMessage)) {
            toast.error(errorMessage);
            setShownMessages((prev) => new Set(prev).add(errorMessage));
        }

        return () => {
            if (!successMessage && !errorMessage) {
                setShownMessages(new Set());
            }
        };
    }, [flash.success, flash.error, shownMessages]);

    // تنظيف معاينة الصور
    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
            <Head title="Admin Profile - Triplus Admin" />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

            <div className="lg:ml-64 p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-blue-400 mb-8">
                        Admin Profile
                    </h1>

                    {/* Flash Messages */}
                    <div className="mb-6">
                        {flash.success && (
                            <div className="bg-green-600/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                {flash.success}
                            </div>
                        )}
                        {flash.error && (
                            <div className="bg-red-600/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center">
                                <XCircle className="w-5 h-5 mr-2" />
                                {flash.error}
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-2xl p-6 lg:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center shadow-lg">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : admin?.avatar ? (
                                            <img
                                                src={`${
                                                    admin.avatar
                                                }?t=${new Date().getTime()}`}
                                                alt={admin.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-4xl font-medium text-gray-400">
                                                {admin?.name
                                                    ?.charAt(0)
                                                    .toUpperCase() || "A"}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current.click()
                                        }
                                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-md"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                                {profileErrors.avatar && (
                                    <span className="text-red-500 text-sm mt-2">
                                        {profileErrors.avatar}
                                    </span>
                                )}
                                <p className="mt-4 text-gray-300 text-sm">
                                    Administrator
                                </p>
                            </div>

                            {/* Profile and Password Forms */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Profile Form */}
                                <div className="bg-gray-900/50 p-6 rounded-lg shadow-inner">
                                    <h2 className="text-xl font-semibold text-blue-400 mb-4">
                                        Profile Information
                                    </h2>
                                    <form
                                        onSubmit={handleProfileSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label
                                                    htmlFor="name"
                                                    className="block text-sm font-medium text-gray-300 mb-2"
                                                >
                                                    Name
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        value={profileData.name}
                                                        onChange={(e) =>
                                                            setProfileData(
                                                                "name",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 w-full p-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                                                            profileErrors.name
                                                                ? "border-red-500"
                                                                : ""
                                                        }`}
                                                        placeholder="Admin Name"
                                                    />
                                                </div>
                                                {profileErrors.name && (
                                                    <span className="text-red-500 text-sm mt-1">
                                                        {profileErrors.name}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="email"
                                                    className="block text-sm font-medium text-gray-300 mb-2"
                                                >
                                                    Email Address
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        value={
                                                            profileData.email
                                                        }
                                                        onChange={(e) =>
                                                            setProfileData(
                                                                "email",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 w-full p-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                                                            profileErrors.email
                                                                ? "border-red-500"
                                                                : ""
                                                        }`}
                                                        placeholder="admin@example.com"
                                                    />
                                                </div>
                                                {profileErrors.email && (
                                                    <span className="text-red-500 text-sm mt-1">
                                                        {profileErrors.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={profileProcessing}
                                            className="w-full md:w-auto px-6 py-3 flex items-center justify-center bg-blue-600 text-white rounded-lg font-medium transition-all hover:bg-blue-700 disabled:opacity-50 shadow-md"
                                        >
                                            <Save className="w-5 h-5 mr-2" />
                                            {profileProcessing
                                                ? "Saving..."
                                                : "Save Profile"}
                                        </button>
                                    </form>
                                </div>

                                {/* Password Form */}
                                <div className="bg-gray-900/50 p-6 rounded-lg shadow-inner">
                                    <h2 className="text-xl font-semibold text-blue-400 mb-4">
                                        Change Password
                                    </h2>
                                    <form
                                        onSubmit={handlePasswordSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label
                                                    htmlFor="current_password"
                                                    className="block text-sm font-medium text-gray-300 mb-2"
                                                >
                                                    Current Password
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 text-gray-400" />
                                                    <input
                                                        type="password"
                                                        id="current_password"
                                                        name="current_password"
                                                        value={
                                                            passwordData.current_password
                                                        }
                                                        onChange={(e) =>
                                                            setPasswordData(
                                                                "current_password",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 w-full p-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                                                            passwordErrors.current_password
                                                                ? "border-red-500"
                                                                : ""
                                                        }`}
                                                        placeholder="Current Password"
                                                    />
                                                </div>
                                                {passwordErrors.current_password && (
                                                    <span className="text-red-500 text-sm mt-1">
                                                        {
                                                            passwordErrors.current_password
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="new_password"
                                                    className="block text-sm font-medium text-gray-300 mb-2"
                                                >
                                                    New Password
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 text-gray-400" />
                                                    <input
                                                        type="password"
                                                        id="new_password"
                                                        name="new_password"
                                                        value={
                                                            passwordData.new_password
                                                        }
                                                        onChange={(e) =>
                                                            setPasswordData(
                                                                "new_password",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 w-full p-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                                                            passwordErrors.new_password
                                                                ? "border-red-500"
                                                                : ""
                                                        }`}
                                                        placeholder="New Password"
                                                    />
                                                </div>
                                                {passwordErrors.new_password && (
                                                    <span className="text-red-500 text-sm mt-1">
                                                        {
                                                            passwordErrors.new_password
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="new_password_confirmation"
                                                    className="block text-sm font-medium text-gray-300 mb-2"
                                                >
                                                    Confirm New Password
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 text-gray-400" />
                                                    <input
                                                        type="password"
                                                        id="new_password_confirmation"
                                                        name="new_password_confirmation"
                                                        value={
                                                            passwordData.new_password_confirmation
                                                        }
                                                        onChange={(e) =>
                                                            setPasswordData(
                                                                "new_password_confirmation",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 w-full p-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                                                            passwordErrors.new_password_confirmation
                                                                ? "border-red-500"
                                                                : ""
                                                        }`}
                                                        placeholder="Confirm New Password"
                                                    />
                                                </div>
                                                {passwordErrors.new_password_confirmation && (
                                                    <span className="text-red-500 text-sm mt-1">
                                                        {
                                                            passwordErrors.new_password_confirmation
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={passwordProcessing}
                                            className="w-full md:w-auto px-6 py-3 flex items-center justify-center bg-blue-600 text-white rounded-lg font-medium transition-all hover:bg-blue-700 disabled:opacity-50 shadow-md"
                                        >
                                            <Save className="w-5 h-5 mr-2" />
                                            {passwordProcessing
                                                ? "Saving..."
                                                : "Change Password"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AdminSidebar />
        </div>
    );
}
