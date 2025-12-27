import React, { useState, useEffect, useRef } from "react"; // Added useEffect and useRef
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import {
    User,
    Building2,
    Key,
    Mail,
    Save,
    Home,
    Phone,
    Globe,
    MapPin,
    Shield,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    UploadCloud, // Added UploadCloud for image upload icon
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"; // Added framer-motion imports

// Import Navbar and Footer components
import NavBar from "../../Components/Nav"; // Ensure this path is correct
import Footer from "../../Components/Footer"; // Ensure this path is correct

export default function CompanyProfile() {
    const { props } = usePage();
    // company.company_logo_url is now passed from the controller
    const { company, errors: pageGlobalErrors, flash } = props;

    // Profile Form Data and Logic:
    // 'data' renamed to 'profileData', 'setData' to 'setProfileData'.
    // 'put' changed to 'post' (named 'postProfile') for file uploads.
    // 'logo: null' added for the new image file and '_method: "put"'.
    // 'errors' renamed to 'profileFormErrors'.
    const {
        data: profileData,
        setData: setProfileData,
        post: postProfile,
        processing: profileProcessing,
        errors: profileFormErrors,
        reset: resetProfileForm,
    } = useForm({
        name: company.name || "",
        company_name: company.company_name || "",
        license_number: company.license_number || "",
        email: company.email || "",
        logo: null, // To store the new logo file
        _method: "put", // To inform Laravel it's a PUT request when sending FormData
    });

    // Password Form Data and Logic
    const {
        data: passwordData,
        setData: setPasswordData,
        put: updatePassword,
        processing: passwordProcessing,
        errors: passwordFormErrors,
        reset: resetPasswordForm,
    } = useForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    // 'validationErrors' renamed to 'clientValidationErrors'.
    const [clientValidationErrors, setClientValidationErrors] = useState({});
    const [activeTab, setActiveTab] = useState("profile");

    // State for logo preview and hidden file input ref
    const [logoPreview, setLogoPreview] = useState(
        company.company_logo_url || null
    );
    const logoInputRef = useRef(null);

    // useEffect for handling flash messages from the server (for single notifications)
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]); // Depend only on flash to avoid duplicate toasts

    // Client-side validation function (optional, server is primary validator)
    // 'validateForm' renamed to 'validateProfileFormClientSide'.
    const validateProfileFormClientSide = () => {
        const errors = {};
        if (!profileData.name) errors.name = "Contact person name is required";
        if (!profileData.company_name)
            errors.company_name = "Company name is required";
        if (!profileData.license_number)
            errors.license_number = "License number is required";
        if (!profileData.email) errors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email))
            errors.email = "Invalid email format";
        setClientValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Profile form submission handler
    // 'handleSubmit' renamed to 'handleProfileSubmit'.
    // It now uses 'postProfile' and 'profileProcessing'.
    const handleProfileSubmit = (e) => {
        e.preventDefault(); // Prevent default if button is type="submit" inside a form
        // Or if called from onClick of a type="button"

        if (!validateProfileFormClientSide()) {
            toast.error("Please fix the form errors.");
            return;
        }
        postProfile(route("company.profile.update"), {
            // profileData is automatically sent
            preserveScroll: true,
            onSuccess: () => {
                // Success toast will be handled by useEffect flash message
                setClientValidationErrors({});
                setProfileData("logo", null); // Clear the logo file from form data
                if (logoInputRef.current) {
                    logoInputRef.current.value = ""; // Visually clear the file input
                }
            },
            onError: (errors) => {
                // 'errors' here are server-side validation errors for specific fields
                // profileFormErrors is automatically updated by useForm.
                // Show a generic toast only if no specific field errors and no flash error from server.
                if (flash && !flash.error && Object.keys(errors).length === 0) {
                    toast.error(
                        "Failed to update profile. An unexpected error occurred."
                    );
                }
            },
        });
    };

    // Password form submission handler
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        updatePassword(route("company.profile.password"), {
            preserveScroll: true,
            onSuccess: () => {
                // Success toast will be handled by useEffect flash message
                resetPasswordForm();
            },
            onError: (errors) => {
                if (flash && !flash.error && Object.keys(errors).length === 0) {
                    toast.error(
                        "Failed to update password. An unexpected error occurred."
                    );
                }
            },
        });
    };

    // Logo file change handler
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData("logo", file); // Update form data with the file
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogoPreview(event.target.result); // Update preview
            };
            reader.readAsDataURL(file);
        }
    };

    // Your original JSX structure starts here
    return (
        // Updated background gradient to match the Contact page slightly
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white transition-all duration-300 relative">
            <Head title="Company Profile - Triplus" />
            <Toaster position="top-right" />
            {/* Navbar Component */}
            <NavBar isDarkMode={true} />{" "}
            {/* Assuming NavBar is correctly imported and used */}
            {/* Hero Section (Your Original Design) */}
            <div className="relative h-64 md:h-80 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gray-900 opacity-80"></div>
                <div className="absolute inset-0 bg-[url('/images/world.svg')] bg-no-repeat bg-center opacity-30 bg-cover"></div>
                <div className="relative z-10 text-center px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-5xl md:text-6xl font-extrabold mb-2 leading-tight"
                    >
                        Company <span className="text-green-400">Profile</span>
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                    >
                        <p className="text-xl text-gray-300 mb-4">
                            Manage your company information
                        </p>
                        <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
                    </motion.div>
                </div>
            </div>
            {/* End Hero Section */}
            {/* Main Content */}
            <main className="pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex justify-end mb-0">
                        {" "}
                        {/* User's original placement for save button */}
                        {/* This button is for the profile form when the 'profile' tab is active */}
                        {activeTab === "profile" && (
                            <button
                                type="button" // Kept as type="button" as submission is handled by onClick
                                onClick={handleProfileSubmit} // Calls the correct submit handler
                                disabled={profileProcessing} // Uses processing state from profile form
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-lg transition-all"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {profileProcessing
                                    ? "Saving..."
                                    : "Save Profile"}
                            </button>
                        )}
                    </div>

                    {/* Tabs (Your Original Design) */}
                    <div className="border-b border-gray-700 mb-8">
                        <nav className="flex -mb-px">
                            <button // Changed back to button for semantic correctness, styling maintained
                                onClick={() => setActiveTab("profile")}
                                className={`py-4 px-6 font-medium flex items-center transition-all ${
                                    activeTab === "profile"
                                        ? "border-b-2 border-green-500 text-green-500"
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                <Building2 className="w-5 h-5 mr-2" />
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab("settings")}
                                className={`py-4 px-6 font-medium flex items-center transition-all ${
                                    activeTab === "settings"
                                        ? "border-b-2 border-green-500 text-green-500"
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                <Shield className="w-5 h-5 mr-2" />
                                Settings
                            </button>
                        </nav>
                    </div>

                    {/* Main Content Area - Conditional Rendering Based on Tab */}
                    <AnimatePresence mode="wait">
                        {activeTab === "profile" && (
                            <motion.div
                                key="profileView" // Unique key for AnimatePresence
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                            >
                                {/* Company Logo & Summary (User's Original Structure with integrated logo upload) */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                                        <div className="flex flex-col items-center text-center mb-6">
                                            {/* Interactive Logo Upload Area */}
                                            <input
                                                type="file"
                                                ref={logoInputRef}
                                                onChange={handleLogoChange}
                                                className="hidden"
                                                accept="image/png, image/jpeg, image/gif"
                                            />
                                            <div
                                                title="Click to change logo"
                                                className="relative h-32 w-32 mb-4 bg-gray-700 rounded-lg flex items-center justify-center border-2 border-green-600 cursor-pointer group overflow-hidden"
                                                onClick={() =>
                                                    logoInputRef.current?.click()
                                                }
                                            >
                                                {logoPreview ? (
                                                    <img
                                                        src={logoPreview}
                                                        alt="Company Logo"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <Building2 className="h-16 w-16 text-green-500" />
                                                )}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex flex-col items-center justify-center transition-opacity duration-300">
                                                    <UploadCloud
                                                        size={32}
                                                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                    />
                                                    <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
                                                        Change Logo
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Display logo validation error from server */}
                                            {profileFormErrors.logo && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {profileFormErrors.logo}
                                                </p>
                                            )}

                                            <h2 className="text-xl font-bold">
                                                {profileData.company_name ||
                                                    "Your Company Name"}
                                            </h2>
                                            <p className="text-gray-400 mt-1">
                                                Tourism & Travel Agency{" "}
                                                {/* This should ideally be dynamic */}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-gray-700">
                                            <div className="flex items-center mb-4">
                                                <Shield className="h-5 w-5 text-green-500 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-400">
                                                        License Number
                                                    </p>
                                                    <p className="font-medium">
                                                        {profileData.license_number ||
                                                            "Not provided"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center mb-4">
                                                <User className="h-5 w-5 text-green-500 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-400">
                                                        Contact Person
                                                    </p>
                                                    <p className="font-medium">
                                                        {profileData.name ||
                                                            "Not provided"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Mail className="h-5 w-5 text-green-500 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-400">
                                                        Email Address
                                                    </p>
                                                    <p className="font-medium">
                                                        {profileData.email ||
                                                            "Not provided"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-gray-700">
                                            <h3 className="text-md font-semibold mb-3">
                                                Company Status
                                            </h3>
                                            <div className="bg-green-900 bg-opacity-30 text-green-400 py-2 px-3 rounded-md flex items-center">
                                                <Shield className="h-5 w-5 mr-2" />
                                                Active & Verified{" "}
                                                {/* This should come from company data */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Content (User's Original Structure) */}
                                <div className="lg:col-span-2">
                                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                                        {/* The form tag is here as per your original code, but the submit button is outside.
                                            The onClick handler on the external button calls handleProfileSubmit.
                                        */}
                                        <div className="space-y-6">
                                            {" "}
                                            {/* Replaced <form> with <div> as submit is handled by external button via its onClick */}
                                            <div>
                                                <label
                                                    htmlFor="name"
                                                    className="block text-sm font-medium text-gray-300 mb-2"
                                                >
                                                    Contact Person Name
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        value={profileData.name}
                                                        onChange={(e) =>
                                                            setProfileData(
                                                                "name",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                                            clientValidationErrors.name ||
                                                            profileFormErrors.name
                                                                ? "border-red-500"
                                                                : ""
                                                        }`}
                                                        placeholder="Enter contact person name"
                                                    />
                                                </div>
                                                {(clientValidationErrors.name ||
                                                    profileFormErrors.name) && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {clientValidationErrors.name ||
                                                            profileFormErrors.name}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="company_name"
                                                    className="block text-sm font-medium text-gray-300 mb-2"
                                                >
                                                    Company Name
                                                </label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-3 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        id="company_name"
                                                        value={
                                                            profileData.company_name
                                                        }
                                                        onChange={(e) =>
                                                            setProfileData(
                                                                "company_name",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                                            clientValidationErrors.company_name ||
                                                            profileFormErrors.company_name
                                                                ? "border-red-500"
                                                                : ""
                                                        }`}
                                                        placeholder="Enter company name"
                                                    />
                                                </div>
                                                {(clientValidationErrors.company_name ||
                                                    profileFormErrors.company_name) && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {clientValidationErrors.company_name ||
                                                            profileFormErrors.company_name}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="license_number"
                                                    className="block text-sm font-medium text-gray-300 mb-2"
                                                >
                                                    License Number
                                                </label>
                                                <div className="relative">
                                                    <Key className="absolute left-3 top-3 text-gray-400" />{" "}
                                                    {/* Changed from Shield to Key to match original */}
                                                    <input
                                                        type="text"
                                                        id="license_number"
                                                        value={
                                                            profileData.license_number
                                                        }
                                                        onChange={(e) =>
                                                            setProfileData(
                                                                "license_number",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                                            clientValidationErrors.license_number ||
                                                            profileFormErrors.license_number
                                                                ? "border-red-500"
                                                                : ""
                                                        }`}
                                                        placeholder="Enter license number"
                                                    />
                                                </div>
                                                {(clientValidationErrors.license_number ||
                                                    profileFormErrors.license_number) && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {clientValidationErrors.license_number ||
                                                            profileFormErrors.license_number}
                                                    </p>
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
                                                        value={
                                                            profileData.email
                                                        }
                                                        onChange={(e) =>
                                                            setProfileData(
                                                                "email",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                                            clientValidationErrors.email ||
                                                            profileFormErrors.email
                                                                ? "border-red-500"
                                                                : ""
                                                        }`}
                                                        placeholder="Enter email address"
                                                    />
                                                </div>
                                                {(clientValidationErrors.email ||
                                                    profileFormErrors.email) && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {clientValidationErrors.email ||
                                                            profileFormErrors.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Settings Tab Content (Password Change Form) */}
                        {activeTab === "settings" && (
                            <motion.div
                                key="settingsView" // Unique key
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 max-w-xl mx-auto" // Centered with max-width
                            >
                                <h2 className="text-xl font-bold text-white mb-6">
                                    Change Password
                                </h2>
                                <form
                                    onSubmit={handlePasswordSubmit}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label
                                            htmlFor="current_password"
                                            className="block text-sm font-medium text-gray-300 mb-2"
                                        >
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="password"
                                                id="current_password"
                                                value={
                                                    passwordData.current_password
                                                }
                                                onChange={(e) =>
                                                    setPasswordData(
                                                        "current_password",
                                                        e.target.value
                                                    )
                                                }
                                                className={`pl-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                                    passwordFormErrors.current_password
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                        {passwordFormErrors.current_password && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {
                                                    passwordFormErrors.current_password
                                                }
                                            </p>
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
                                            <Key className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="password"
                                                id="new_password"
                                                value={
                                                    passwordData.new_password
                                                }
                                                onChange={(e) =>
                                                    setPasswordData(
                                                        "new_password",
                                                        e.target.value
                                                    )
                                                }
                                                className={`pl-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                                    passwordFormErrors.new_password
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                                placeholder="Enter new password (min. 8 characters)"
                                            />
                                        </div>
                                        {passwordFormErrors.new_password && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {
                                                    passwordFormErrors.new_password
                                                }
                                            </p>
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
                                            <Key className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="password"
                                                id="new_password_confirmation"
                                                value={
                                                    passwordData.new_password_confirmation
                                                }
                                                onChange={(e) =>
                                                    setPasswordData(
                                                        "new_password_confirmation",
                                                        e.target.value
                                                    )
                                                }
                                                className={`pl-10 w-full py-3 rounded-lg border bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                                    passwordFormErrors.new_password_confirmation
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                        {passwordFormErrors.new_password_confirmation && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {
                                                    passwordFormErrors.new_password_confirmation
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit" // Submit button for the password form
                                            disabled={passwordProcessing}
                                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-lg transition-all"
                                        >
                                            <Key className="w-5 h-5 mr-2" />
                                            {passwordProcessing
                                                ? "Updating..."
                                                : "Update Password"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                        {/* Placeholder for Contacts tab (Your Original Design) */}
                        {activeTab === "contacts" && (
                            <motion.div
                                key="contactsView"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700"
                            >
                                <h2 className="text-xl font-bold text-white mb-4">
                                    Contact Information
                                </h2>
                                <p className="text-gray-400">
                                    Contact details form/display...
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
            {/* Footer Component */}
            <Footer />
        </div>
    );
}
