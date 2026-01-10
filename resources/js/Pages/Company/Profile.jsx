import React, { useState, useEffect, useRef } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import {
    User,
    Building2,
    Key,
    Mail,
    Save,
    Shield,
    UploadCloud,
    Phone,
    Globe,
    MapPin,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "../../Components/Nav";
import Footer from "../../Components/Footer";

export default function CompanyProfile() {
    const { company, flash } = usePage().props;

    const [activeTab, setActiveTab] = useState("profile");

    // Profile Form
    const {
        data: profileData,
        setData: setProfileData,
        post: updateProfile,
        processing: profileProcessing,
        errors: profileErrors,
        reset: resetProfile,
    } = useForm({
        name: company?.name || "",
        company_name: company?.company_name || "",
        license_number: company?.license_number || "",
        email: company?.email || "",
        phone: company?.phone || "",
        website: company?.website || "",
        address: company?.address || "",
        logo: null,
        _method: "PUT",
    });

    // Password Form
    const {
        data: passwordData,
        setData: setPasswordData,
        put: updatePassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPassword,
    } = useForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    // Logo preview
    const [logoPreview, setLogoPreview] = useState(
        company?.company_logo_url || null
    );
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProfileData("logo", file);

        const reader = new FileReader();
        reader.onload = () => setLogoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(profileData).forEach((key) => {
            if (profileData[key] !== null && profileData[key] !== undefined) {
                formData.append(key, profileData[key]);
            }
        });

        updateProfile(route("company.profile.update"), {
            data: formData,
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setProfileData("logo", null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        updatePassword(route("company.profile.password"), {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
        });
    };

    const tabs = [
        { id: "profile", label: "Company Profile", icon: Building2 },
        { id: "password", label: "Password", icon: Key },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Head title="Company Profile - Triplus" />

            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

            <Navbar user={usePage().props.auth?.user} />

            {/* Hero Section - similar style to dashboard */}
            <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 bg-gradient-to-b from-emerald-950/60 via-gray-950 to-gray-950 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" />
                    <div
                        className="absolute bottom-20 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl animate-pulse"
                        style={{ animationDelay: "1.2s" }}
                    />
                </div>

                <div className="relative max-w-6xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 mb-5 px-5 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full"
                    >
                        <Shield className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">
                            Company Account
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
                    >
                        Your Company{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                            Profile
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
                    >
                        Manage your company information and account security
                    </motion.p>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex flex-wrap gap-3 mb-8">
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.id}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                                        : "bg-gray-800/70 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700"
                                }`}
                            >
                                <tab.icon size={20} />
                                {tab.label}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* PROFILE TAB */}
                    {activeTab === "profile" && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                        >
                            {/* Left Column - Info Card */}
                            <div className="lg:col-span-4">
                                <div className="bg-gray-800/80 rounded-2xl border border-gray-700 overflow-hidden shadow-xl sticky top-8">
                                    <div className="p-8 text-center relative">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleLogoChange}
                                            accept="image/*"
                                            className="hidden"
                                        />

                                        <div
                                            className="relative mx-auto w-40 h-40 mb-6 group cursor-pointer"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/30 to-teal-500/30 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-gray-700 bg-gray-900">
                                                {logoPreview ? (
                                                    <img
                                                        src={logoPreview}
                                                        alt="Company Logo"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                        <Building2
                                                            size={64}
                                                            className="text-gray-500"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                                                <div className="text-white text-center">
                                                    <UploadCloud
                                                        size={32}
                                                        className="mx-auto mb-1"
                                                    />
                                                    <span className="text-sm font-medium">
                                                        Change Logo
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {profileErrors.logo && (
                                            <p className="text-red-400 text-sm mt-2">
                                                {profileErrors.logo}
                                            </p>
                                        )}

                                        <h2 className="text-2xl font-bold mb-2">
                                            {profileData.company_name ||
                                                "Your Company"}
                                        </h2>
                                        <p className="text-emerald-400 font-medium mb-6">
                                            Tourism & Travel Agency
                                        </p>

                                        <div className="space-y-4 text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-emerald-900/40 p-3 rounded-lg">
                                                    <CheckCircle2
                                                        size={20}
                                                        className="text-emerald-400"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">
                                                        Status
                                                    </p>
                                                    <p className="font-medium">
                                                        Active & Verified
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Form */}
                            <div className="lg:col-span-8">
                                <div className="bg-gray-800/80 rounded-2xl border border-gray-700 p-8 shadow-xl">
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            <Building2 className="text-emerald-400" />
                                            Company Information
                                        </h2>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={handleProfileSubmit}
                                            disabled={profileProcessing}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white font-medium hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all shadow-lg"
                                        >
                                            <Save size={18} />
                                            {profileProcessing
                                                ? "Saving..."
                                                : "Save Changes"}
                                        </motion.button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Contact Person Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) =>
                                                        setProfileData(
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full pl-11 pr-4 py-3 bg-gray-900/60 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                                                        profileErrors.name
                                                            ? "border-red-500"
                                                            : "border-gray-700"
                                                    }`}
                                                />
                                            </div>
                                            {profileErrors.name && (
                                                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle size={14} />
                                                    {profileErrors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Company Name
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={
                                                        profileData.company_name
                                                    }
                                                    onChange={(e) =>
                                                        setProfileData(
                                                            "company_name",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full pl-11 pr-4 py-3 bg-gray-900/60 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                                                        profileErrors.company_name
                                                            ? "border-red-500"
                                                            : "border-gray-700"
                                                    }`}
                                                />
                                            </div>
                                            {profileErrors.company_name && (
                                                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle size={14} />
                                                    {profileErrors.company_name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                License Number
                                            </label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={
                                                        profileData.license_number
                                                    }
                                                    onChange={(e) =>
                                                        setProfileData(
                                                            "license_number",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full pl-11 pr-4 py-3 bg-gray-900/60 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                                                        profileErrors.license_number
                                                            ? "border-red-500"
                                                            : "border-gray-700"
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) =>
                                                        setProfileData(
                                                            "email",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full pl-11 pr-4 py-3 bg-gray-900/60 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                                                        profileErrors.email
                                                            ? "border-red-500"
                                                            : "border-gray-700"
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PASSWORD TAB */}
                    {activeTab === "password" && (
                        <motion.div
                            key="password"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-xl mx-auto"
                        >
                            <div className="bg-gray-800/80 rounded-2xl border border-gray-700 p-8 shadow-xl">
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                    <Key className="text-emerald-400" />
                                    Change Password
                                </h2>

                                <form
                                    onSubmit={handlePasswordSubmit}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="password"
                                                value={
                                                    passwordData.current_password
                                                }
                                                onChange={(e) =>
                                                    setPasswordData(
                                                        "current_password",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full pl-11 pr-4 py-3 bg-gray-900/60 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                                                    passwordErrors.current_password
                                                        ? "border-red-500"
                                                        : "border-gray-700"
                                                }`}
                                            />
                                        </div>
                                        {passwordErrors.current_password && (
                                            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle size={14} />
                                                {
                                                    passwordErrors.current_password
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="password"
                                                value={
                                                    passwordData.new_password
                                                }
                                                onChange={(e) =>
                                                    setPasswordData(
                                                        "new_password",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full pl-11 pr-4 py-3 bg-gray-900/60 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                                                    passwordErrors.new_password
                                                        ? "border-red-500"
                                                        : "border-gray-700"
                                                }`}
                                            />
                                        </div>
                                        {passwordErrors.new_password && (
                                            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle size={14} />
                                                {passwordErrors.new_password}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="password"
                                                value={
                                                    passwordData.new_password_confirmation
                                                }
                                                onChange={(e) =>
                                                    setPasswordData(
                                                        "new_password_confirmation",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full pl-11 pr-4 py-3 bg-gray-900/60 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                                                    passwordErrors.new_password_confirmation
                                                        ? "border-red-500"
                                                        : "border-gray-700"
                                                }`}
                                            />
                                        </div>
                                        {passwordErrors.new_password_confirmation && (
                                            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle size={14} />
                                                {
                                                    passwordErrors.new_password_confirmation
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            type="submit"
                                            disabled={passwordProcessing}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white font-medium hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all shadow-lg"
                                        >
                                            <Key size={18} />
                                            {passwordProcessing
                                                ? "Updating..."
                                                : "Update Password"}
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Footer />
        </div>
    );
}
