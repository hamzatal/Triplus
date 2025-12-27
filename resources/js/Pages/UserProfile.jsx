import React, { useState, useEffect } from "react";
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
                    console.error(
                        "HTTP Error:",
                        response.status,
                        response.statusText
                    );
                    toast.error(
                        `Failed to load profile: ${response.statusText}`,
                        { duration: 4000 }
                    );
                    return;
                }
                const result = await response.json();
                // console.log('Response:', result);
                if (result.status === "success") {
                    setUser(result.user);
                    setData({
                        name: result.user.name || "",
                        email: result.user.email || "",
                        avatar: null,
                        bio: result.user.bio || "",
                        phone: result.user.phone || "",
                    });
                    if (result.user.status) {
                        toast.success(result.user.status, { duration: 4000 });
                    }
                } else {
                    console.error("Backend Error:", result);
                    toast.error("Failed to load profile.", { duration: 4000 });
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                toast.error("Error loading profile.", { duration: 4000 });
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
                setErrors({
                    avatar: "The avatar must be a file of type: jpeg, png, jpg, gif.",
                });
                toast.error(
                    "Invalid file type. Please upload an image (jpeg, png, jpg, gif).",
                    { duration: 4000 }
                );
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setErrors({ avatar: "The avatar may not be larger than 2MB." });
                toast.error(
                    "File too large. Please upload an image smaller than 2MB.",
                    { duration: 4000 }
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
                toast.success(result.status, { duration: 4000 });
            } else {
                setErrors(
                    result.errors || { general: "Failed to update profile." }
                );
                toast.error(
                    "Failed to update profile. Please check the errors.",
                    { duration: 4000 }
                );
            }
        } catch (error) {
            toast.error("Error updating profile.", { duration: 4000 });
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
                toast.success(result.status, { duration: 4000 });
            } else {
                setErrors(
                    result.errors || { general: "Failed to update password." }
                );
                toast.error(
                    "Failed to update password. Please check the errors.",
                    { duration: 4000 }
                );
            }
        } catch (error) {
            toast.error("Error updating password.", { duration: 4000 });
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
                setShowDeactivationSuccessModal(false);
                toast.error(
                    "Failed to deactivate account. Please check the errors.",
                    { duration: 4000 }
                );
            }
        } catch (error) {
            setShowDeactivationSuccessModal(false);
            toast.error("Error deactivating account.", { duration: 4000 });
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

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile":
                return renderProfileTab();
            case "security":
                return renderSecurityTab();
            case "account":
                return renderAccountTab();
            default:
                return renderProfileTab();
        }
    };

    const renderProfileTab = () => (
        <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <img
                            src={displayAvatar}
                            alt="Profile Avatar"
                            className="w-48 h-48 rounded-full object-cover border-4 border-green-700 shadow-lg"
                        />
                        {isEditing && (
                            <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                <Camera className="text-white h-10 w-10" />
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/gif"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                            </label>
                        )}
                    </div>
                    {errors.avatar && (
                        <p className="mt-2 text-green-500 text-sm">
                            {errors.avatar}
                        </p>
                    )}

                    {!isEditing && user && (
                        <div className="mt-4 text-center">
                            <p className="text-gray-400 text-sm">
                                Member since:{" "}
                                {user.created_at
                                    ? new Date(
                                          user.created_at
                                      ).toLocaleDateString()
                                    : "Unknown"}
                            </p>
                            {user.last_login && (
                                <p className="text-gray-400 text-sm mt-1">
                                    Last login:{" "}
                                    {new Date(user.last_login).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Profile Details */}
                <div className="flex-grow space-y-6">
                    {isEditing ? (
                        <>
                            <div className="flex items-center space-x-3">
                                <User className="w-6 h-6 text-green-600" />
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium mb-2 text-white">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-600 transition-all"
                                    />
                                    {errors.name && (
                                        <p className="mt-2 text-green-500 text-sm">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="w-6 h-6 text-green-600" />
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium mb-2 text-white">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-600 transition-all"
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-green-500 text-sm">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-6 h-6 text-green-600" />
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium mb-2 text-white">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={data.phone}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-600 transition-all"
                                    />
                                    {errors.phone && (
                                        <p className="mt-2 text-green-500 text-sm">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <FileText className="w-6 h-6 text-green-600 mt-2" />
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium mb-2 text-white">
                                        Bio
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={data.bio}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-24 text-white focus:ring-2 focus:ring-green-600 transition-all"
                                    />
                                    {errors.bio && (
                                        <p className="mt-2 text-green-500 text-sm">
                                            {errors.bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        user && (
                            <>
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <User className="w-6 h-6 text-green-600" />
                                        <div>
                                            <h2 className="text-xl font-semibold text-white">
                                                {data.name}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-6 h-6 text-green-600" />
                                        <div>
                                            <p className="text-md text-white">
                                                {data.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {data.phone && (
                                    <div>
                                        <div className="flex items-center space-x-3">
                                            <Phone className="w-6 h-6 text-green-600" />
                                            <div>
                                                <p className="text-md text-white">
                                                    {data.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-start space-x-3">
                                        <FileText className="w-6 h-6 text-green-600 mt-1" />
                                        <div>
                                            <p className="text-md text-white">
                                                {data.bio || "No bio available"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    )}
                </div>
            </div>
        </form>
    );

    const renderSecurityTab = () => (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Lock className="w-6 h-6 text-green-600 mr-2" />
                Change Password
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="relative">
                    <label className="block text-sm font-medium mb-2 text-white">
                        Current Password
                    </label>
                    <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="current_password"
                        value={pwData.current_password}
                        onChange={handlePasswordChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-600 transition-all"
                    />
                    <button
                        type="button"
                        onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-10 text-gray-400 hover:text-white"
                    >
                        {showCurrentPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                    {errors.current_password && (
                        <p className="mt-2 text-green-500 text-sm">
                            {errors.current_password}
                        </p>
                    )}
                </div>

                <div className="relative">
                    <label className="block text-sm font-medium mb-2 text-white">
                        New Password
                    </label>
                    <input
                        type={showNewPassword ? "text" : "password"}
                        name="password"
                        value={pwData.password}
                        onChange={handlePasswordChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-600 transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-10 text-gray-400 hover:text-white"
                    >
                        {showNewPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                    {errors.password && (
                        <p className="mt-2 text-green-500 text-sm">
                            {errors.password}
                        </p>
                    )}
                </div>

                <div className="relative">
                    <label className="block text-sm font-medium mb-2 text-white">
                        Confirm New Password
                    </label>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="password_confirmation"
                        value={pwData.password_confirmation}
                        onChange={handlePasswordChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-600 transition-all"
                    />
                    <button
                        type="button"
                        onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-10 text-gray-400 hover:text-white"
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={processingPw}
                        className="bg-green-700 hover:bg-green-800 text-white font-medium px-6 py-2 rounded-lg transition-colors shadow-md flex items-center"
                    >
                        {processingPw ? "Updating..." : "Update Password"}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderAccountTab = () => (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 text-green-600 mr-2" />
                Account Management
            </h2>

            <div className="border border-green-800 rounded-lg p-5 bg-gray-900">
                <h3 className="text-lg font-semibold text-green-500 mb-4">
                    Deactivate Account
                </h3>
                <p className="text-gray-300 mb-4">
                    Deactivating your account will make your profile and content
                    inaccessible. You can reactivate your account at any time by
                    logging in again.
                </p>

                <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="bg-transparent hover:bg-green-900 text-green-500 border border-green-500 font-medium px-5 py-2 rounded-lg transition-colors"
                >
                    Deactivate Account
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-900 min-h-screen">
            <Toaster position="top-right" />
            <NavBar isDarkMode={true} />

            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center space-x-4">
                            <UserCircle2 className="w-10 h-10 text-green-600" />
                            <h1 className="text-3xl font-bold text-white">
                                Profile
                            </h1>
                        </div>
                        {activeTab === "profile" &&
                            (!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md"
                                >
                                    <Pen className="mr-2 h-5 w-5" /> Edit
                                    Profile
                                </button>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setPreviewImage(null);
                                            setData((prev) => ({
                                                ...prev,
                                                avatar: null,
                                            }));
                                        }}
                                        className="flex items-center text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-lg transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={processing}
                                        className="flex items-center bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md"
                                    >
                                        <Save className="mr-2 h-5 w-5" />{" "}
                                        {processing
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>
                                </div>
                            ))}
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex border-b border-gray-700 mb-6">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`py-3 px-5 font-medium ${
                                activeTab === "profile"
                                    ? "text-green-500 border-b-2 border-green-500"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`py-3 px-5 font-medium ${
                                activeTab === "security"
                                    ? "text-green-500 border-b-2 border-green-500"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Security
                        </button>
                        <button
                            onClick={() => setActiveTab("account")}
                            className={`py-3 px-5 font-medium ${
                                activeTab === "account"
                                    ? "text-green-500 border-b-2 border-green-500"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Account
                        </button>
                    </div>

                    {/* Tab Content */}
                    {renderTabContent()}
                </div>
            </div>

            {/* Deactivate Account Modal */}
            {showDeactivateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">
                                Deactivate Account
                            </h3>
                            <button
                                onClick={() => setShowDeactivateModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleDeactivateAccount}>
                            <div className="mb-4 relative">
                                <label className="block text-sm font-medium mb-2 text-white">
                                    Password
                                </label>
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
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-600"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDeactivatePassword(
                                            !showDeactivatePassword
                                        )
                                    }
                                    className="absolute right-3 top-10 text-gray-400 hover:text-white"
                                >
                                    {showDeactivatePassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                                {errors.password && (
                                    <p className="mt-2 text-green-500 text-sm">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2 text-white">
                                    Reason for deactivation (optional)
                                </label>
                                <textarea
                                    name="deactivation_reason"
                                    value={deactivateData.deactivation_reason}
                                    onChange={handleDeactivateChange}
                                    rows="3"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-600"
                                ></textarea>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDeactivateModal(false)
                                    }
                                    className="px-4 py-2 text-gray-300 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processingDeactivate}
                                    className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                                >
                                    {processingDeactivate
                                        ? "Processing..."
                                        : "Deactivate Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deactivation Success Modal */}
            {showDeactivationSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-green-700 shadow-xl">
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">
                                Account Deactivated
                            </h3>
                            <p className="text-gray-300 mb-6">
                                Your account has been successfully deactivated.
                                If you need any assistance, please contact our
                                support team:
                            </p>
                            <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-700">
                                <div className="flex items-center space-x-3 mb-3">
                                    <Phone className="w-5 h-5 text-green-500" />
                                    <p className="text-gray-300">
                                        <span className="font-medium text-white">
                                            Phone:
                                        </span>{" "}
                                        +1234567890
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5 text-green-500" />
                                    <p className="text-gray-300">
                                        <span className="font-medium text-white">
                                            Email:
                                        </span>{" "}
                                        Triplus@support.com
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDeactivationSuccessClose}
                                className="bg-green-700 hover:bg-green-800 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-md flex items-center justify-center w-full"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default UserProfile;
