import React, { useState, useEffect, useCallback, forwardRef } from "react";
import { Head, usePage, useForm } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Trash2,
    Plus,
    Edit2,
    X,
    ToggleLeft,
    ToggleRight,
    Calendar,
    DollarSign,
    Star,
    Tag,
    User,
    Building2,
    MapPin,
    BookOpenCheck,
    Mail,
    AlertCircle,
    Clock,
    Award,
    Heart,
    Check,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../Components/Nav";
import Footer from "../../Components/Footer";

// Placeholder image URL
const defaultImage = "/images/placeholder.jpg";

// Custom Scrollbar Styles
const customScrollbarStyles = `
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    ::-webkit-scrollbar-track {
        background: #1f2937;
        border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb {
        background: #4b5563;
        border-radius: 4px;
        transition: background 0.2s;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #10b981;
    }
    ::-webkit-scrollbar-corner {
        background: #1f2937;
    }
    * {
        scrollbar-width: thin;
        scrollbar-color: #4b5563 #1f2937;
    }
`;

// Inject styles with cleanup
const injectGlobalStyles = () => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = customScrollbarStyles;
    document.head.appendChild(styleSheet);
    return () => {
        document.head.removeChild(styleSheet);
    };
};

// Format date
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "N/A";
        }
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return "N/A";
    }
};

// Format ISO date to YYYY-MM-dd
const formatISOToDateInput = (isoString) => {
    if (!isoString) return "";
    try {
        const datePart = isoString.split("T")[0].split(" ")[0];
        return datePart;
    } catch {
        return "";
    }
};
const calculateDiscount = (original, discounted) => {
    if (!discounted || discounted === null || discounted === 0) return 0;

    const orig = parseFloat(original);
    const disc = parseFloat(discounted);

    if (!orig || !disc || isNaN(orig) || isNaN(disc) || orig <= disc) return 0;

    return Math.round(((orig - disc) / orig) * 100);
};

// Render stars
const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round((rating || 0) * 2) / 2;
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <Star
                key={i}
                size={14}
                className={
                    i <= roundedRating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-500"
                }
            />
        );
    }
    return stars;
};

// Get status color
const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case "confirmed":
            return "bg-emerald-600";
        case "pending":
            return "bg-amber-600";
        case "cancelled":
            return "bg-rose-600";
        case "completed":
            return "bg-sky-600";
        default:
            return "bg-gray-600";
    }
};

// --- Sub-components ---

const FormFields = ({
    type,
    data,
    setData,
    errors,
    imagePreview,
    handleImageChange,
    removeImage,
    availableDestinations,
}) => {
    const isDestination = type === "destination";
    const isOffer = type === "offer";
    const isPackage = type === "package";

    const descriptionCharCount = data.description ? data.description.length : 0;

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                </label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData("title", e.target.value)}
                        className={`pl-10 w-full py-3 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200 ${
                            errors.title ? "border-red-500" : ""
                        }`}
                        placeholder="Enter title"
                    />
                </div>
                {errors.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.title}
                    </p>
                )}
            </div>
            {isPackage && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Subtitle
                    </label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            value={data.subtitle}
                            onChange={(e) =>
                                setData("subtitle", e.target.value)
                            }
                            className="pl-10 w-full py-3 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200"
                            placeholder="Enter subtitle"
                        />
                    </div>
                    {errors.subtitle && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors.subtitle}
                        </p>
                    )}
                </div>
            )}
            {(isOffer || isPackage) && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Associated Destination
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" />
                        <select
                            value={data.destination_id}
                            onChange={(e) =>
                                setData("destination_id", e.target.value)
                            }
                            className={`pl-10 w-full py-3 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200 ${
                                errors.destination_id ? "border-red-500" : ""
                            }`}
                        >
                            <option value="">Select a destination</option>
                            {availableDestinations.map((dest) => (
                                <option key={dest.id} value={dest.id}>
                                    {dest.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.destination_id && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors.destination_id}
                        </p>
                    )}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                </label>
                <textarea
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    className={`w-full py-3 px-4 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-y min-h-[120px] transition-all duration-200 ${
                        errors.description ? "border-red-500" : ""
                    }`}
                    placeholder="Enter description"
                    maxLength={5000}
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>{descriptionCharCount}/5000</span>
                    {errors.description && (
                        <p className="text-red-500 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors.description}
                        </p>
                    )}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        value={data.location}
                        onChange={(e) => setData("location", e.target.value)}
                        className={`pl-10 w-full py-3 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200 ${
                            errors.location ? "border-red-500" : ""
                        }`}
                        placeholder="Enter location"
                    />
                </div>
                {errors.location && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.location}
                    </p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                </label>
                <div className="relative">
                    <Tag className="absolute left-3 top-3 text-gray-400" />
                    <select
                        value={data.category}
                        onChange={(e) => setData("category", e.target.value)}
                        className={`pl-10 w-full py-3 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200 ${
                            errors.category ? "border-red-500" : ""
                        }`}
                    >
                        <option value="">Select a category</option>
                        {[
                            "Beach",
                            "Mountain",
                            "City",
                            "Cultural",
                            "Adventure",
                            "Historical",
                            "Wildlife",
                        ].map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                {errors.category && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.category}
                    </p>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="number"
                            value={data.price}
                            onChange={(e) => setData("price", e.target.value)}
                            className={`pl-10 w-full py-3 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200 ${
                                errors.price ? "border-red-500" : ""
                            }`}
                            placeholder="Enter price"
                            step="0.01"
                            min="0.01"
                        />
                    </div>
                    {errors.price && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors.price}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Discount Price
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="number"
                            value={data.discount_price}
                            onChange={(e) =>
                                setData("discount_price", e.target.value)
                            }
                            className={`pl-10 w-full py-3 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200 ${
                                errors.discount_price ? "border-red-500" : ""
                            }`}
                            placeholder="Enter discount price"
                            step="0.01"
                            min="0"
                        />
                    </div>
                    {errors.discount_price && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors.discount_price}
                        </p>
                    )}
                </div>
            </div>
            {(isOffer || isPackage) && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Start Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) =>
                                        setData("start_date", e.target.value)
                                    }
                                    className={`pl-10 w-full py-3 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200 ${
                                        errors.start_date
                                            ? "border-red-500"
                                            : ""
                                    }`}
                                />
                            </div>
                            {errors.start_date && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <AlertCircle size={14} className="mr-1" />
                                    {errors.start_date}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                End Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) =>
                                        setData("end_date", e.target.value)
                                    }
                                    className={`pl-10 w-full py-3 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200 ${
                                        errors.end_date ? "border-red-500" : ""
                                    }`}
                                />
                            </div>
                            {errors.end_date && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <AlertCircle size={14} className="mr-1" />
                                    {errors.end_date}
                                </p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Discount Type
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-3 text-gray-400" />
                            <select
                                value={data.discount_type}
                                onChange={(e) =>
                                    setData("discount_type", e.target.value)
                                }
                                className="pl-10 w-full py-3 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            {/* Additional fields for Package type only */}
            {isPackage && (
                <div className="mt-4 p-4 bg-emerald-900/30 rounded-xl border border-emerald-800/50">
                    <h4 className="text-emerald-300 font-medium mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Package Details
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Duration (Days)
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="number"
                                    value={data.duration || ""}
                                    onChange={(e) =>
                                        setData("duration", e.target.value)
                                    }
                                    className="pl-10 w-full py-3 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200"
                                    placeholder="Enter duration in days"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Max Participants
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="number"
                                    value={data.max_participants || ""}
                                    onChange={(e) =>
                                        setData(
                                            "max_participants",
                                            e.target.value
                                        )
                                    }
                                    className="pl-10 w-full py-3 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200"
                                    placeholder="Enter maximum participants"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Includes
                            </label>
                            <textarea
                                value={data.includes || ""}
                                onChange={(e) =>
                                    setData("includes", e.target.value)
                                }
                                className="w-full py-3 px-4 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-y min-h-[80px] transition-all duration-200"
                                placeholder="Enter what's included (e.g., meals, transportation, accommodation)"
                            />
                        </div>
                    </div>
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image
                </label>
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full py-3 rounded-xl border bg-gray-800/70 text-white border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 transition-all duration-200"
                    />
                </div>
                {imagePreview && (
                    <div className="mt-4 relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-xl shadow-md"
                            loading="lazy"
                        />
                        <motion.button
                            type="button"
                            onClick={removeImage}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-lg transition-all duration-200"
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    </div>
                )}
                {errors.image && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.image}
                    </p>
                )}
            </div>
            <div className="flex items-center space-x-6">
                {(isDestination || isPackage) && (
                    <label className="flex items-center text-sm text-gray-300 hover:text-white transition-colors">
                        <input
                            type="checkbox"
                            checked={data.is_featured}
                            onChange={(e) =>
                                setData("is_featured", e.target.checked)
                            }
                            className="mr-2 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 transition-colors"
                        />
                        <span className="flex items-center">
                            <Star
                                size={16}
                                className="mr-1.5 text-yellow-400"
                            />
                            Featured
                        </span>
                    </label>
                )}
                <label className="flex items-center text-sm text-gray-300 hover:text-white transition-colors">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData("is_active", e.target.checked)}
                        className="mr-2 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 transition-colors"
                    />
                    <span className="flex items-center">
                        <Check size={16} className="mr-1.5 text-emerald-400" />
                        Active
                    </span>
                </label>
            </div>
        </div>
    );
};

const AddEditModal = ({
    showModal,
    onClose,
    onSubmit,
    processing,
    data,
    setData,
    errors,
    imagePreview,
    handleImageChange,
    removeImage,
    availableDestinations,
    selectedItem,
}) => {
    const isEditing = !!selectedItem;
    const modalType = showModal;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        {isEditing ? (
                            <Edit2 className="w-6 h-6 mr-2 text-emerald-400" />
                        ) : (
                            <Plus className="w-6 h-6 mr-2 text-emerald-400" />
                        )}
                        {isEditing ? "Edit" : "Add"}{" "}
                        {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-7 h-7" />
                    </motion.button>
                </div>
                <form onSubmit={onSubmit}>
                    <FormFields
                        type={modalType}
                        data={data}
                        setData={setData}
                        errors={errors}
                        imagePreview={imagePreview}
                        handleImageChange={handleImageChange}
                        removeImage={removeImage}
                        availableDestinations={availableDestinations}
                    />
                    <div className="flex justify-end mt-8 space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 shadow-md"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={processing}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all duration-200 shadow-md"
                        >
                            {processing ? (
                                <span className="animate-spin text-lg">⟳</span>
                            ) : isEditing ? (
                                <Edit2 className="w-5 h-5 mr-1.5" />
                            ) : (
                                <Plus className="w-5 h-5 mr-1.5" />
                            )}
                            <span>{isEditing ? "Update" : "Create"}</span>
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const DeleteConfirmationModal = ({
    showModal,
    onClose,
    onDelete,
    processing,
    itemToDelete,
}) => {
    if (!showModal || !itemToDelete) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <AlertCircle className="w-6 h-6 mr-2 text-red-500" />
                        Confirm Deletion
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-7 h-7" />
                    </motion.button>
                </div>
                <p className="text-gray-300 mb-6 text-lg">
                    Are you sure you want to delete this{" "}
                    <span className="font-semibold text-emerald-400">
                        {itemToDelete.type}
                    </span>
                    ? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 shadow-md"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onDelete}
                        disabled={processing}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-500 hover:to-red-600 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all duration-200 shadow-md"
                    >
                        {processing ? (
                            <span className="animate-spin text-lg">⟳</span>
                        ) : (
                            <Trash2 className="w-5 h-5 mr-1.5" />
                        )}
                        <span>Delete</span>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

const CancelConfirmationModal = ({
    showModal,
    onClose,
    onCancel,
    processing,
    bookingToCancel,
}) => {
    if (!showModal || !bookingToCancel) return null;

    const entity =
        bookingToCancel.destination ||
        bookingToCancel.offer ||
        bookingToCancel.package;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <AlertCircle className="w-6 h-6 mr-2 text-amber-500" />
                        Confirm Cancellation
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-7 h-7" />
                    </motion.button>
                </div>
                <p className="text-gray-300 mb-6 text-lg">
                    Are you sure you want to cancel the booking for{" "}
                    <span className="font-semibold text-emerald-400">
                        {entity?.name || entity?.title || "this item"}
                    </span>{" "}
                    by{" "}
                    <span className="font-semibold text-emerald-400">
                        {bookingToCancel.user?.name || "N/A"}
                    </span>
                    ? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 shadow-md"
                    >
                        Keep Booking
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onCancel}
                        disabled={processing}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-500 hover:to-red-600 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all duration-200 shadow-md"
                    >
                        {processing ? (
                            <span className="animate-spin text-lg">⟳</span>
                        ) : (
                            <Trash2 className="w-5 h-5 mr-1.5" />
                        )}
                        <span>Cancel Booking</span>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

// Wrap ItemCard with forwardRef
const ItemCard = forwardRef(
    (
        {
            item,
            type,
            openEditModal,
            openDeleteModal,
            handleToggle,
            handleCancelBooking,
            handleConfirmBooking,
            availableDestinations,
        },
        ref
    ) => {
        const isDestination = type === "destination";
        const isOffer = type === "offer";
        const isPackage = type === "package";
        const isBooking = type === "booking";

        // Determine the main entity for bookings
        const entity = isBooking
            ? item.destination || item.offer || item.package
            : item;
        const itemTitle = isDestination ? item.name : item.title;
        const itemDescription = item.description;
        const itemPrice = parseFloat(item.price);
        const itemDiscountPrice = parseFloat(item.discount_price);
        const itemRating = item.rating || 0;
        const itemImage = entity?.image || defaultImage;
        const displayTag = isDestination ? item.category : item.discount_type;

        const associatedDestinationName =
            (isOffer || isPackage) && item.destination_id
                ? availableDestinations.find(
                      (d) => d.id === item.destination_id
                  )?.name || "N/A"
                : null;

        const canCancel =
            isBooking && ["pending", "confirmed"].includes(item.status);
        const canConfirm = isBooking && item.status === "pending";

        return (
            <motion.div
                ref={ref}
                key={`${type}-${item.id}`}
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.4 },
                    },
                    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
                }}
                layout
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="bg-gray-800/80 rounded-xl overflow-hidden border border-gray-700 flex flex-col group transition-all duration-300"
            >
                <div className="relative overflow-hidden">
                    <img
                        src={itemImage}
                        alt={itemTitle || "Image"}
                        className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = defaultImage;
                        }}
                    />
                    {isBooking ? (
                        <span
                            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                                item.status
                            )} shadow-lg`}
                        >
                            {item.status.charAt(0).toUpperCase() +
                                item.status.slice(1)}
                        </span>
                    ) : (
                        <>
                            {displayTag && (
                                <span className="absolute top-3 left-3 px-3 py-1 bg-emerald-600 rounded-full text-xs font-medium text-white shadow-lg">
                                    {displayTag.charAt(0).toUpperCase() +
                                        displayTag.slice(1)}
                                </span>
                            )}
                            {calculateDiscount(itemPrice, itemDiscountPrice) !==
                                null && (
                                <div className="absolute top-3 right-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    {calculateDiscount(
                                        itemPrice,
                                        itemDiscountPrice
                                    )}
                                    % OFF
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold line-clamp-1 text-white">
                            {itemTitle ||
                                (isBooking &&
                                    (entity?.name || entity?.title)) ||
                                "N/A"}
                        </h3>
                    </div>
                    {isBooking && item.user && (
                        <div className="flex items-center gap-2 mb-2">
                            <User
                                size={16}
                                className="text-emerald-400 flex-shrink-0"
                            />
                            <span className="text-sm text-gray-300">
                                {item.user?.name || "N/A"}
                            </span>
                            <span className="text-sm text-gray-300">
                                ({item.user?.phone || "N/A"})
                            </span>
                        </div>
                    )}
                    {!isBooking && item.location && (
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin
                                size={16}
                                className="text-emerald-400 flex-shrink-0"
                            />
                            <span className="text-sm text-gray-300">
                                {item.location}
                            </span>
                        </div>
                    )}
                    {(isOffer || isPackage) && associatedDestinationName && (
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin
                                size={16}
                                className="text-emerald-400 flex-shrink-0"
                            />
                            <span className="text-sm text-gray-300">
                                {associatedDestinationName}
                            </span>
                        </div>
                    )}
                    {isBooking && (
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={16} className="text-emerald-400" />
                            <span className="text-sm text-gray-300">
                                {formatDate(item.check_in)} -{" "}
                                {formatDate(item.check_out)}
                            </span>
                        </div>
                    )}
                    {isBooking && (
                        <div className="flex items-center gap-2 mb-3">
                            <User size={16} className="text-emerald-400" />
                            <span className="text-sm text-gray-300">
                                Guests: {item.guests}
                            </span>
                        </div>
                    )}
                    {!isBooking && (
                        <div className="flex items-center gap-1 mb-3">
                            {renderStars(itemRating)}
                            <span className="text-sm ml-2 text-gray-400">
                                ({itemRating}/5)
                            </span>
                        </div>
                    )}
                    {!isBooking && (
                        <p className="text-sm mb-4 line-clamp-2 text-gray-300">
                            {itemDescription || "No description available."}
                        </p>
                    )}
                    {(isOffer || isPackage) && item.end_date && (
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={16} className="text-emerald-400" />
                            <span className="text-sm text-gray-300">
                                Valid until {formatDate(item.end_date)}
                            </span>
                        </div>
                    )}
                    <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="block text-xs font-medium text-gray-400">
                                    {isBooking
                                        ? "Total Price"
                                        : "Starting from"}
                                </span>
                                <div className="flex items-baseline gap-2">
                                    {item.discount_price && !isBooking ? (
                                        <>
                                            <span className="text-2xl font-bold text-emerald-400">
                                                $
                                                {parseFloat(
                                                    item.discount_price
                                                ).toFixed(2)}
                                            </span>
                                            <span className="text-sm line-through text-gray-500">
                                                $
                                                {parseFloat(item.price).toFixed(
                                                    2
                                                )}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-2xl font-bold text-emerald-400">
                                            $
                                            {parseFloat(
                                                item.price ||
                                                    item.total_price ||
                                                    0
                                            ).toFixed(2)}
                                        </span>
                                    )}
                                    {!isBooking && (
                                        <span className="text-xs text-gray-400">
                                            / person
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {isBooking && (canCancel || canConfirm) ? (
                            <div className="flex gap-3">
                                {canConfirm && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            handleConfirmBooking(item)
                                        }
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 transform shadow-lg"
                                    >
                                        <Check className="w-4 h-4" />
                                        Confirm
                                    </motion.button>
                                )}
                                {canCancel && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            handleCancelBooking(item)
                                        }
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600 transition-all duration-300 transform shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Cancel
                                    </motion.button>
                                )}
                            </div>
                        ) : isBooking ? (
                            <div className="text-center text-sm text-gray-400 py-3">
                                No actions available for this booking
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center space-x-2 mb-4 justify-center">
                                    {(isDestination || isPackage) && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                handleToggle(
                                                    item,
                                                    type,
                                                    "is_featured"
                                                )
                                            }
                                            className="text-gray-400 hover:text-yellow-400 p-1.5 rounded-full transition-all bg-gray-700/50 hover:bg-gray-700"
                                            title="Toggle Featured"
                                        >
                                            {item.is_featured ? (
                                                <Star
                                                    size={18}
                                                    className="fill-yellow-400 text-yellow-400"
                                                />
                                            ) : (
                                                <Star size={18} />
                                            )}
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            handleToggle(
                                                item,
                                                type,
                                                "is_active"
                                            )
                                        }
                                        className="text-gray-400 hover:text-emerald-400 p-1.5 rounded-full transition-all bg-gray-700/50 hover:bg-gray-700"
                                        title="Toggle Active"
                                    >
                                        {item.is_active ? (
                                            <ToggleRight
                                                size={18}
                                                className="text-emerald-400"
                                            />
                                        ) : (
                                            <ToggleLeft size={18} />
                                        )}
                                    </motion.button>
                                </div>
                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            openEditModal(item, type)
                                        }
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 transform shadow-lg"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            openDeleteModal(item, type)
                                        }
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600 transition-all duration-300 transform shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </motion.button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }
);

ItemCard.displayName = "ItemCard";

// --- Main Dashboard Component ---

const CompanyDashboard = ({
    auth,
    destinations,
    offers,
    packages,
    bookings,
}) => {
    const user = auth?.user || null;
    const { flash } = usePage().props;

    const [activeTab, setActiveTab] = useState("destinations");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const {
        data,
        setData,
        post,
        put,
        patch,
        delete: deleteForm,
        processing,
        errors,
        reset,
    } = useForm({
        title: "",
        subtitle: "",
        description: "",
        location: "",
        category: "",
        price: "",
        discount_price: "",
        image: null,
        rating: "",
        is_featured: false,
        is_active: true,
        destination_id: "",
        discount_type: "percentage",
        start_date: "",
        end_date: "",
        duration: "",
        max_participants: "",
        includes: "",
    });

    useEffect(() => {
        const cleanup = injectGlobalStyles();
        return cleanup;
    }, []);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleImageChange = useCallback(
        (e) => {
            const file = e.target.files[0];
            if (file) {
                setData("image", file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        },
        [setData]
    );

    const removeImage = useCallback(() => {
        setData("image", null);
        setImagePreview(null);
    }, [setData]);

    const handleFormSuccess = useCallback(
        (type) => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedItem(null);
            reset();
            setImagePreview(null);
            toast.success(
                `${type.charAt(0).toUpperCase() + type.slice(1)} ${
                    selectedItem ? "updated" : "added"
                } successfully!`
            );
        },
        [selectedItem, reset]
    );

    const handleFormError = useCallback(() => {
        toast.error("Failed to save. Please check the form for errors.");
    }, []);

    // Handle adding new item
    const handleAdd = useCallback(
        (e) => {
            e.preventDefault();

            const type = showAddModal;
            const formData = new FormData();

            formData.append("title", data.title || "");
            formData.append("description", data.description || "");
            formData.append("location", data.location || "");
            formData.append("category", data.category || "");
            formData.append("price", data.price || "");
            if (
                data.discount_price !== null &&
                data.discount_price !== undefined
            )
                formData.append("discount_price", data.discount_price);
            else formData.append("discount_price", "");
            if (data.rating !== null && data.rating !== undefined)
                formData.append("rating", data.rating);
            else formData.append("rating", "");

            if (data.image instanceof File) {
                formData.append("image", data.image);
            }

            if (type === "destination") {
                formData.append("is_featured", data.is_featured ? "1" : "0");
                formData.append("is_active", data.is_active ? "1" : "0");
            } else if (type === "offer" || type === "package") {
                formData.append("destination_id", data.destination_id || "");
                formData.append("discount_type", data.discount_type || "");
                formData.append("start_date", data.start_date || "");
                formData.append("end_date", data.end_date || "");
                formData.append("is_active", data.is_active ? "1" : "0");
                if (type === "package") {
                    if (data.subtitle !== null && data.subtitle !== undefined)
                        formData.append("subtitle", data.subtitle);
                    else formData.append("subtitle", "");
                    formData.append(
                        "is_featured",
                        data.is_featured ? "1" : "0"
                    );
                    // Add package-specific fields
                    if (data.duration)
                        formData.append("duration", data.duration);
                    else formData.append("duration", "");

                    if (data.max_participants)
                        formData.append(
                            "max_participants",
                            data.max_participants
                        );
                    else formData.append("max_participants", "");

                    if (data.includes)
                        formData.append("includes", data.includes);
                    else formData.append("includes", "");
                }
            }

            post(route(`company.${type}s.store`), formData, {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => handleFormSuccess(type),
                onError: handleFormError,
            });
        },
        [showAddModal, data, post, handleFormSuccess, handleFormError]
    );

    // Handle editing an existing item
    const handleEdit = useCallback(
        (e) => {
            e.preventDefault();
            if (!selectedItem) return;

            const type = showEditModal;
            const formData = new FormData();

            formData.append("_method", "PUT");

            formData.append("title", data.title || "");
            formData.append("description", data.description || "");
            formData.append("location", data.location || "");
            formData.append("category", data.category || "");
            formData.append("price", data.price || "");
            if (
                data.discount_price !== null &&
                data.discount_price !== undefined
            )
                formData.append("discount_price", data.discount_price);
            else formData.append("discount_price", "");
            if (data.rating !== null && data.rating !== undefined)
                formData.append("rating", data.rating);
            else formData.append("rating", "");

            if (data.image instanceof File) {
                formData.append("image", data.image);
            } else if (data.image === null && selectedItem.image) {
                formData.append("image_removed", "1");
            }

            if (type === "destination") {
                formData.append("is_featured", data.is_featured ? "1" : "0");
                formData.append("is_active", data.is_active ? "1" : "0");
            } else if (type === "offer" || type === "package") {
                formData.append("destination_id", data.destination_id || "");
                formData.append("discount_type", data.discount_type || "");
                formData.append("start_date", data.start_date || "");
                formData.append("end_date", data.end_date || "");
                formData.append("is_active", data.is_active ? "1" : "0");
                if (type === "package") {
                    if (data.subtitle !== null && data.subtitle !== undefined)
                        formData.append("subtitle", data.subtitle);
                    else formData.append("subtitle", "");
                    formData.append(
                        "is_featured",
                        data.is_featured ? "1" : "0"
                    );
                    // Add package-specific fields
                    if (data.duration)
                        formData.append("duration", data.duration);
                    else formData.append("duration", "");

                    if (data.max_participants)
                        formData.append(
                            "max_participants",
                            data.max_participants
                        );
                    else formData.append("max_participants", "");

                    if (data.includes)
                        formData.append("includes", data.includes);
                    else formData.append("includes", "");
                }
            }

            put(route(`company.${type}s.update`, selectedItem.id), formData, {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => handleFormSuccess(type),
                onError: handleFormError,
            });
        },
        [
            selectedItem,
            showEditModal,
            data,
            put,
            handleFormSuccess,
            handleFormError,
        ]
    );

    // Handle deleting an item
    const handleDelete = useCallback(() => {
        if (!itemToDelete) return;

        const type = itemToDelete.type;
        deleteForm(route(`company.${type}s.destroy`, itemToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setItemToDelete(null);
                toast.success(
                    `${
                        type.charAt(0).toUpperCase() + type.slice(1)
                    } deleted successfully!`
                );
            },
            onError: () => {
                toast.error("Failed to delete. Please try again.");
            },
        });
    }, [itemToDelete, deleteForm]);

    // Handle cancelling a booking
    const handleCancelBooking = useCallback((booking) => {
        setBookingToCancel(booking);
        setShowCancelModal(true);
    }, []);

    // Handle confirming a booking
    const handleConfirmBooking = useCallback(
        (booking) => {
            patch(route("company.bookings.confirm", booking.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Booking confirmed successfully!");
                },
                onError: () => {
                    toast.error("Failed to confirm booking. Please try again.");
                },
            });
        },
        [patch]
    );

    const confirmCancelBooking = useCallback(() => {
        if (!bookingToCancel) return;

        deleteForm(route("company.bookings.cancel", bookingToCancel.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowCancelModal(false);
                setBookingToCancel(null);
                toast.success("Booking cancelled successfully!");
            },
            onError: () => {
                toast.error("Failed to cancel booking. Please try again.");
            },
        });
    }, [bookingToCancel, deleteForm]);

    // Handle toggling featured/active status
    const handleToggle = useCallback(
        (item, type, field) => {
            const routeName = `company.${type}s.${
                field === "is_featured" ? "toggle-featured" : "toggle-active"
            }`;
            patch(
                route(routeName, item.id),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            `${
                                field === "is_featured" ? "Featured" : "Active"
                            } status toggled!`
                        );
                    },
                    onError: () => {
                        toast.error("Failed to toggle status.");
                    },
                }
            );
        },
        [patch]
    );

    // Open add modal and reset form
    const openAddModal = useCallback(
        (type) => {
            reset();
            setImagePreview(null);
            setShowAddModal(type);
        },
        [reset]
    );

    // Open edit modal and populate form with item data
    const openEditModal = useCallback(
        (item, type) => {
            setSelectedItem(item);
            const initialData = {
                title: item.title || item.name || "",
                description: item.description || "",
                location: item.location || "",
                category: item.category || "",
                price: item.price || "",
                discount_price: item.discount_price || "",
                image: null,
                rating: item.rating || "",
                is_featured: item.is_featured || false,
                is_active: item.is_active !== undefined ? item.is_active : true,
            };

            if (type === "offer" || type === "package") {
                initialData.destination_id = item.destination_id || "";
                initialData.discount_type = item.discount_type || "percentage";
                initialData.start_date =
                    formatISOToDateInput(item.start_date) || "";
                initialData.end_date =
                    formatISOToDateInput(item.end_date) || "";
                if (type === "package") {
                    initialData.subtitle = item.subtitle || "";
                    initialData.duration = item.duration || "";
                    initialData.max_participants = item.max_participants || "";
                    initialData.includes = item.includes || "";
                }
            }
            setData(initialData);
            setImagePreview(item.image || null);
            setShowEditModal(type);
        },
        [setData]
    );

    // Open delete confirmation modal
    const openDeleteModal = useCallback((item, type) => {
        setItemToDelete({ id: item.id, type });
        setShowDeleteModal(true);
    }, []);

    // Filter items based on search query
    const filterItems = useCallback(
        (items, type) => {
            return items.filter((item) => {
                const query = searchQuery.toLowerCase();
                if (type === "destination") {
                    return (
                        item.name?.toLowerCase().includes(query) ||
                        item.location?.toLowerCase().includes(query) ||
                        item.description?.toLowerCase().includes(query) ||
                        item.category?.toLowerCase().includes(query)
                    );
                } else if (type === "offer" || type === "package") {
                    return (
                        item.title?.toLowerCase().includes(query) ||
                        item.subtitle?.toLowerCase().includes(query) ||
                        item.description?.toLowerCase().includes(query) ||
                        item.location?.toLowerCase().includes(query) ||
                        item.category?.toLowerCase().includes(query) ||
                        item.destination?.name?.toLowerCase().includes(query)
                    );
                } else if (type === "booking") {
                    return (
                        item.user?.name?.toLowerCase().includes(query) ||
                        item.user?.email?.toLowerCase().includes(query) ||
                        item.user?.phone?.toLowerCase().includes(query) ||
                        item.destination?.name?.toLowerCase().includes(query) ||
                        item.package?.title?.toLowerCase().includes(query) ||
                        item.offer?.title?.toLowerCase().includes(query)
                    );
                }
                return false;
            });
        },
        [searchQuery]
    );

    const filteredDestinations = filterItems(destinations.data, "destination");
    const filteredOffers = filterItems(offers.data, "offer");
    const filteredPackages = filterItems(packages.data, "package");
    const filteredBookings = filterItems(bookings.data, "booking");

    // Available destinations for select dropdowns in offers/packages forms
    const availableDestinations = destinations.data.map((d) => ({
        id: d.id,
        name: d.name,
    }));

    const renderCurrentTabContent = () => {
        let itemsToRender = [];
        let currentType = "";

        switch (activeTab) {
            case "destinations":
                itemsToRender = filteredDestinations;
                currentType = "destination";
                break;
            case "offers":
                itemsToRender = filteredOffers;
                currentType = "offer";
                break;
            case "packages":
                itemsToRender = filteredPackages;
                currentType = "package";
                break;
            case "bookings":
                itemsToRender = filteredBookings;
                currentType = "booking";
                break;
            default:
                itemsToRender = [];
        }

        if (itemsToRender.length === 0) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-gray-800/50 rounded-2xl border border-gray-700"
                >
                    <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold mb-2 text-white">
                        No {activeTab} found
                    </h3>
                    <p className="text-gray-400 mb-6">
                        {searchQuery
                            ? "Try adjusting your search query"
                            : `Start by adding your first ${currentType}`}
                    </p>
                    {!searchQuery && activeTab !== "bookings" && (
                        <button
                            onClick={() => openAddModal(currentType)}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-lg inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add{" "}
                            {currentType.charAt(0).toUpperCase() +
                                currentType.slice(1)}
                        </button>
                    )}
                </motion.div>
            );
        }

        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 },
                    },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {itemsToRender.map((item) => (
                        <ItemCard
                            key={`${currentType}-${item.id}`}
                            item={item}
                            type={currentType}
                            openEditModal={openEditModal}
                            openDeleteModal={openDeleteModal}
                            handleToggle={handleToggle}
                            handleCancelBooking={handleCancelBooking}
                            handleConfirmBooking={handleConfirmBooking}
                            availableDestinations={availableDestinations}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>
        );
    };

    const tabs = [
        { id: "destinations", label: "Destinations", icon: MapPin },
        { id: "offers", label: "Offers", icon: Tag },
        { id: "packages", label: "Packages", icon: Award },
        { id: "bookings", label: "Bookings", icon: BookOpenCheck },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Head>
                <title>Company Dashboard - Triplus</title>
                <meta
                    name="description"
                    content="Manage your travel company's destinations, offers, packages, and bookings."
                />
            </Head>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Navbar user={user} />

            {/* Hero Section */}
            <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 bg-gradient-to-b from-emerald-950/70 via-gray-950 to-gray-950">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" />
                    <div
                        className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl animate-pulse"
                        style={{ animationDelay: "1s" }}
                    />
                </div>
                <div className="relative max-w-6xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full"
                    >
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">
                            Company Dashboard
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
                    >
                        Manage Your{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                            Travel Business
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.7 }}
                        className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10"
                    >
                        Control destinations, offers, packages, and bookings all
                        in one place
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.45, duration: 0.6 }}
                        className="inline-block w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    />
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                {/* Tabs & Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSearchQuery("");
                                }}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                                        : "bg-gray-800/70 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                                }`}
                            >
                                <tab.icon size={20} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search & Add Button */}
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-800/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>

                        {activeTab !== "bookings" && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                    openAddModal(
                                        activeTab === "destinations"
                                            ? "destination"
                                            : activeTab === "offers"
                                            ? "offer"
                                            : "package"
                                    )
                                }
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-lg"
                            >
                                <Plus size={20} />
                                <span>
                                    Add{" "}
                                    {activeTab === "destinations"
                                        ? "Destination"
                                        : activeTab === "offers"
                                        ? "Offer"
                                        : "Package"}
                                </span>
                            </motion.button>
                        )}
                    </div>

                    {/* Results Count */}
                    <div className="mt-6 text-sm text-gray-400">
                        <p>
                            Showing{" "}
                            {activeTab === "destinations" &&
                                filteredDestinations.length}
                            {activeTab === "offers" && filteredOffers.length}
                            {activeTab === "packages" &&
                                filteredPackages.length}
                            {activeTab === "bookings" &&
                                filteredBookings.length}{" "}
                            {activeTab}
                        </p>
                    </div>
                </motion.div>

                {/* Tab Content */}
                {renderCurrentTabContent()}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showAddModal && (
                    <AddEditModal
                        showModal={showAddModal}
                        onClose={() => {
                            setShowAddModal(false);
                            reset();
                            setImagePreview(null);
                        }}
                        onSubmit={handleAdd}
                        processing={processing}
                        data={data}
                        setData={setData}
                        errors={errors}
                        imagePreview={imagePreview}
                        handleImageChange={handleImageChange}
                        removeImage={removeImage}
                        availableDestinations={availableDestinations}
                        selectedItem={null}
                    />
                )}

                {showEditModal && (
                    <AddEditModal
                        showModal={showEditModal}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedItem(null);
                            reset();
                            setImagePreview(null);
                        }}
                        onSubmit={handleEdit}
                        processing={processing}
                        data={data}
                        setData={setData}
                        errors={errors}
                        imagePreview={imagePreview}
                        handleImageChange={handleImageChange}
                        removeImage={removeImage}
                        availableDestinations={availableDestinations}
                        selectedItem={selectedItem}
                    />
                )}

                {showDeleteModal && (
                    <DeleteConfirmationModal
                        showModal={showDeleteModal}
                        onClose={() => {
                            setShowDeleteModal(false);
                            setItemToDelete(null);
                        }}
                        onDelete={handleDelete}
                        processing={processing}
                        itemToDelete={itemToDelete}
                    />
                )}

                {showCancelModal && (
                    <CancelConfirmationModal
                        showModal={showCancelModal}
                        onClose={() => {
                            setShowCancelModal(false);
                            setBookingToCancel(null);
                        }}
                        onCancel={confirmCancelBooking}
                        processing={processing}
                        bookingToCancel={bookingToCancel}
                    />
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default CompanyDashboard;
