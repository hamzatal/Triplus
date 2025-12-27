import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Head, usePage, useForm } from "@inertiajs/react";
import {
    Search,
    Trash2,
    Plus,
    Edit2,
    ToggleLeft,
    ToggleRight,
    Image,
    X,
    DollarSign,
    Tag,
    Calendar,
    Text,
    MapPin,
    Users,
    Clock,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import AdminSidebar from "@/Components/AdminSidebar";
import toast, { Toaster } from "react-hot-toast";

const ITEMS_PER_PAGE = 9;

// مكون بطاقة العرض
const OfferCard = ({ offer, onEdit, onDelete, onToggle, processing }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            const date = new Date(dateStr);
            return date.toISOString().split("T")[0];
        } catch {
            return "N/A";
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {offer.image ? (
                <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-48 object-cover"
                />
            ) : (
                <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                    <Image className="w-12 h-12 text-gray-400" />
                </div>
            )}
            <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-white">
                        {offer.title || "N/A"}
                    </h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onEdit(offer)}
                            className="text-blue-400 hover:text-blue-300"
                            disabled={processing}
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onDelete(offer.id)}
                            className="text-red-400 hover:text-red-300"
                            disabled={processing}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onToggle(offer.id)}
                            className={`${
                                offer.is_active
                                    ? "text-green-400 hover:text-green-300"
                                    : "text-gray-400 hover:text-gray-300"
                            }`}
                            disabled={processing}
                            title={offer.is_active ? "Deactivate" : "Activate"}
                        >
                            {offer.is_active ? (
                                <ToggleRight className="w-5 h-5" />
                            ) : (
                                <ToggleLeft className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
                <div className="flex items-start mb-2">
                    <MapPin className="w-4 h-4 text-gray-400 mr-1 mt-1" />
                    <p className="text-sm text-gray-400">
                        {offer.location || "N/A"}
                    </p>
                </div>
                <div className="flex items-start mb-2">
                    <Text className="w-4 h-4 text-gray-400 mr-1 mt-1" />
                    <p className="text-sm text-gray-400 line-clamp-2">
                        {offer.description || "N/A"}
                    </p>
                </div>
                <div className="flex items-center mb-2">
                    <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                    {offer.discount_price ? (
                        <span>
                            <span className="font-semibold text-green-400">
                                ${offer.discount_price}
                            </span>
                            <span className="text-gray-400 text-sm line-through ml-2">
                                ${offer.price}
                            </span>
                        </span>
                    ) : (
                        <span className="font-semibold text-green-400">
                            ${offer.price}
                        </span>
                    )}
                </div>
                <div className="flex items-center mb-2">
                    <Tag className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-400">
                        {offer.discount_type || "None"}
                    </span>
                </div>
                <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-400">
                        {formatDate(offer.start_date)} -{" "}
                        {formatDate(offer.end_date)}
                    </span>
                </div>
                <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-400">
                        {offer.duration || "N/A"}
                    </span>
                </div>
                <div className="flex items-center mb-2">
                    <Users className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-400">
                        {offer.group_size || "N/A"}
                    </span>
                </div>
                <div className="flex items-center mb-2">
                    <span className="text-sm text-gray-400">
                        Rating:{" "}
                        {offer.average_rating
                            ? offer.average_rating.toFixed(1)
                            : "No ratings yet"}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Status: {offer.is_active ? "Active" : "Inactive"}
                </p>
            </div>
        </div>
    );
};

// مكون نموذج الإضافة/التعديل
const OfferForm = ({
    isEdit = false,
    data,
    setData,
    handleSubmit,
    companies,
    destinations,
    imagePreview,
    handleImageChange,
    removeImage,
    validationErrors,
    errors,
    processing,
    onCancel,
    selectedOffer,
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                        <h3 className="text-xl font-semibold text-white">
                            {isEdit ? "Edit Offer" : "Add Offer"}
                        </h3>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-300 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-5">
                            <div className="bg-gray-700 bg-opacity-30 p-4 rounded-lg">
                                <h4 className="text-sm uppercase font-medium text-blue-400 mb-3">
                                    Basic Information
                                </h4>
                                <div className="mb-4">
                                    <label
                                        htmlFor="company_id"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Company
                                    </label>
                                    <select
                                        id="company_id"
                                        value={data.company_id}
                                        onChange={(e) =>
                                            setData(
                                                "company_id",
                                                e.target.value
                                            )
                                        }
                                        className="w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            Select a company
                                        </option>
                                        {companies.map((company) => (
                                            <option
                                                key={company.id}
                                                value={company.id}
                                            >
                                                {company.company_name}
                                            </option>
                                        ))}
                                    </select>
                                    {(validationErrors.company_id ||
                                        errors.company_id) && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {validationErrors.company_id ||
                                                errors.company_id}
                                        </p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="destination_id"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Destination
                                    </label>
                                    <select
                                        id="destination_id"
                                        value={data.destination_id}
                                        onChange={(e) =>
                                            setData(
                                                "destination_id",
                                                e.target.value
                                            )
                                        }
                                        className="w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            Select a destination
                                        </option>
                                        {destinations.map((destination) => (
                                            <option
                                                key={destination.id}
                                                value={destination.id}
                                            >
                                                {destination.title} (
                                                {destination.location})
                                            </option>
                                        ))}
                                    </select>
                                    {(validationErrors.destination_id ||
                                        errors.destination_id) && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {validationErrors.destination_id ||
                                                errors.destination_id}
                                        </p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="title"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData("title", e.target.value)
                                        }
                                        className="w-full p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter offer title"
                                    />
                                    {(validationErrors.title ||
                                        errors.title) && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {validationErrors.title ||
                                                errors.title}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        className="w-full p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="4"
                                        placeholder="Enter offer description"
                                    />
                                    {(validationErrors.description ||
                                        errors.description) && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {validationErrors.description ||
                                                errors.description}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <label
                                        htmlFor="location"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        value={data.location}
                                        onChange={(e) =>
                                            setData("location", e.target.value)
                                        }
                                        className="w-full p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter location"
                                    />
                                    {(validationErrors.location ||
                                        errors.location) && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {validationErrors.location ||
                                                errors.location}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <label
                                        htmlFor="category"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Category
                                    </label>
                                    <select
                                        id="category"
                                        value={data.category}
                                        onChange={(e) =>
                                            setData("category", e.target.value)
                                        }
                                        className="w-full p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">
                                            Select a category
                                        </option>
                                        {[
                                            "Beach",
                                            "Mountain",
                                            "City",
                                            "Cultural",
                                            "Adventure",
                                            "Historical",
                                            "Wildlife",
                                        ].map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    {(validationErrors.category ||
                                        errors.category) && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {validationErrors.category ||
                                                errors.category}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-700 bg-opacity-30 p-4 rounded-lg">
                                <h4 className="text-sm uppercase font-medium text-blue-400 mb-3">
                                    Offer Image
                                </h4>
                                <div>
                                    <label
                                        htmlFor="image"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Image {isEdit ? "(Optional)" : ""}
                                    </label>
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg"
                                    />
                                    {imagePreview && (
                                        <div className="relative mt-2">
                                            <img
                                                src={imagePreview}
                                                alt="Image Preview"
                                                className="w-full h-40 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    {(validationErrors.image ||
                                        errors.image) && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {validationErrors.image ||
                                                errors.image}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-700 bg-opacity-30 p-4 rounded-lg">
                                <h4 className="text-sm uppercase font-medium text-blue-400 mb-3">
                                    Pricing Information
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="price"
                                            className="block text-sm font-medium text-gray-300 mb-1"
                                        >
                                            Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            id="price"
                                            value={data.price}
                                            onChange={(e) =>
                                                setData("price", e.target.value)
                                            }
                                            className="w-full p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            step="0.01"
                                            placeholder="Enter price"
                                        />
                                        {(validationErrors.price ||
                                            errors.price) && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {validationErrors.price ||
                                                    errors.price}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="discount_price"
                                            className="block text-sm font-medium text-gray-300 mb-1"
                                        >
                                            Discount Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            id="discount_price"
                                            value={data.discount_price}
                                            onChange={(e) =>
                                                setData(
                                                    "discount_price",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            step="0.01"
                                            placeholder="Enter discount price"
                                        />
                                        {(validationErrors.discount_price ||
                                            errors.discount_price) && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {validationErrors.discount_price ||
                                                    errors.discount_price}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label
                                        htmlFor="discount_type"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Discount Type
                                    </label>
                                    <select
                                        id="discount_type"
                                        value={data.discount_type}
                                        onChange={(e) =>
                                            setData(
                                                "discount_type",
                                                e.target.value
                                            )
                                        }
                                        className="w-full p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">None</option>
                                        <option value="percentage">
                                            Percentage
                                        </option>
                                        <option value="fixed">Fixed</option>
                                    </select>
                                    {(validationErrors.discount_type ||
                                        errors.discount_type) && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {validationErrors.discount_type ||
                                                errors.discount_type}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-700 bg-opacity-30 p-4 rounded-lg">
                                <h4 className="text-sm uppercase font-medium text-blue-400 mb-3">
                                    Offer Duration
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="start_date"
                                            className="block text-sm font-medium text-gray-300 mb-1"
                                        >
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            id="start_date"
                                            value={data.start_date}
                                            onChange={(e) =>
                                                setData(
                                                    "start_date",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {(validationErrors.start_date ||
                                            errors.start_date) && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {validationErrors.start_date ||
                                                    errors.start_date}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="end_date"
                                            className="block text-sm font-medium text-gray-300 mb-1"
                                        >
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            id="end_date"
                                            value={data.end_date}
                                            onChange={(e) =>
                                                setData(
                                                    "end_date",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {(validationErrors.end_date ||
                                            errors.end_date) && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {validationErrors.end_date ||
                                                    errors.end_date}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-700 bg-opacity-30 p-4 rounded-lg">
                                <h4 className="text-sm uppercase font-medium text-blue-400 mb-3">
                                    Additional Details
                                </h4>
                                <div className="mb-4">
                                    <label
                                        htmlFor="duration"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Duration
                                    </label>
                                    <input
                                        type="text"
                                        id="duration"
                                        value={data.duration}
                                        onChange={(e) =>
                                            setData("duration", e.target.value)
                                        }
                                        className="w-full p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 3 days"
                                    />
                                    {(validationErrors.duration ||
                                        errors.duration) && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {validationErrors.duration ||
                                                errors.duration}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label
                                        htmlFor="group_size"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Group Size
                                    </label>
                                    <input
                                        type="text"
                                        id="group_size"
                                        value={data.group_size}
                                        onChange={(e) =>
                                            setData(
                                                "group_size",
                                                e.target.value
                                            )
                                        }
                                        className="w-full p-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 2-10"
                                    />
                                    {(validationErrors.group_size ||
                                        errors.group_size) && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {validationErrors.group_size ||
                                                errors.group_size}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-700 bg-opacity-30 p-4 rounded-lg">
                                <h4 className="text-sm uppercase font-medium text-blue-400 mb-3">
                                    Status
                                </h4>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) =>
                                            setData(
                                                "is_active",
                                                e.target.checked
                                            )
                                        }
                                        className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-700 rounded"
                                    />
                                    <label
                                        htmlFor="is_active"
                                        className="text-sm text-gray-300"
                                    >
                                        Active
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-6">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                            >
                                {isEdit ? "Save Changes" : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// مكون تأكيد الحذف
const DeleteModal = ({ offerToDelete, onConfirm, onCancel, processing }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg w-full max-w-md">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">
                            Confirm Deletion
                        </h3>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-300"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-gray-300 mb-6">
                        Are you sure you want to delete the offer "
                        {offerToDelete?.title}"? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={processing}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// المكون الرئيسي
export default function OffersView() {
    const { props } = usePage();
    const {
        offers = [],
        companies = [],
        destinations = [],
        flash = {},
    } = props;

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [offerToDelete, setOfferToDelete] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [shownMessages, setShownMessages] = useState(new Set());

    const {
        data,
        setData,
        post,
        put,
        delete: deleteForm,
        patch,
        processing,
        reset,
        errors,
    } = useForm({
        title: "",
        description: "",
        location: "",
        category: "",
        image: null,
        price: "",
        discount_price: "",
        discount_type: "",
        start_date: "",
        end_date: "",
        company_id: "",
        destination_id: "",
        is_active: true,
        duration: "",
        group_size: "",
    });

    const formatDate = useCallback((dateStr) => {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "";
            return date.toISOString().split("T")[0];
        } catch {
            return "";
        }
    }, []);

    const validateForm = useCallback(
        (isAdd = false) => {
            const errors = {};

            if (isAdd || data.title !== selectedOffer?.title) {
                if (!data.title) errors.title = "Title is required.";
                else if (data.title.length < 3 || data.title.length > 255)
                    errors.title =
                        "Title must be between 3 and 255 characters.";
            }

            if (isAdd || data.description !== selectedOffer?.description) {
                if (!data.description)
                    errors.description = "Description is required.";
                else if (data.description.length < 10)
                    errors.description =
                        "Description must be at least 10 characters.";
            }

            if (isAdd || data.location !== selectedOffer?.location) {
                if (!data.location) errors.location = "Location is required.";
                else if (data.location.length < 3 || data.location.length > 255)
                    errors.location =
                        "Location must be between 3 and 255 characters.";
            }

            if (isAdd || data.category !== selectedOffer?.category) {
                const validCategories = [
                    "Beach",
                    "Mountain",
                    "City",
                    "Cultural",
                    "Adventure",
                    "Historical",
                    "Wildlife",
                ];
                if (!data.category) errors.category = "Category is required.";
                else if (!validCategories.includes(data.category))
                    errors.category = "Invalid category selected.";
            }

            if (isAdd || data.price !== selectedOffer?.price?.toString()) {
                if (!data.price) errors.price = "Price is required.";
                else if (
                    isNaN(parseFloat(data.price)) ||
                    parseFloat(data.price) < 0
                )
                    errors.price =
                        "Price must be a valid number greater than or equal to 0.";
            }

            if (data.discount_price) {
                if (
                    isNaN(parseFloat(data.discount_price)) ||
                    parseFloat(data.discount_price) < 0
                )
                    errors.discount_price =
                        "Discount price must be a valid number greater than or equal to 0.";
                else if (
                    data.price &&
                    parseFloat(data.discount_price) >= parseFloat(data.price)
                )
                    errors.discount_price =
                        "Discount price must be less than the original price.";
            }

            if (data.discount_type) {
                const validDiscountTypes = ["percentage", "fixed"];
                if (!validDiscountTypes.includes(data.discount_type))
                    errors.discount_type =
                        "Discount type must be 'percentage' or 'fixed'.";
            }

            if (
                data.start_date &&
                !/^\d{4}-\d{2}-\d{2}$/.test(data.start_date)
            ) {
                errors.start_date =
                    "Start date must be a valid date (YYYY-MM-DD).";
            }

            if (data.end_date && !/^\d{4}-\d{2}-\d{2}$/.test(data.end_date)) {
                errors.end_date = "End date must be a valid date (YYYY-MM-DD).";
            }

            if (
                data.start_date &&
                data.end_date &&
                new Date(data.end_date) < new Date(data.start_date)
            ) {
                errors.end_date =
                    "End date must be after or equal to start date.";
            }

            if (isAdd || data.company_id !== selectedOffer?.company_id) {
                if (!data.company_id)
                    errors.company_id = "Company is required.";
                else if (
                    !companies.find((c) => c.id === parseInt(data.company_id))
                )
                    errors.company_id = "Invalid company selected.";
            }

            if (
                isAdd ||
                data.destination_id !== selectedOffer?.destination_id
            ) {
                if (!data.destination_id)
                    errors.destination_id = "Destination is required.";
                else if (
                    !destinations.find(
                        (d) => d.id === parseInt(data.destination_id)
                    )
                )
                    errors.destination_id = "Invalid destination selected.";
            }

            if (isAdd && !data.image) {
                errors.image = "Image is required.";
            }

            if (data.image) {
                const validTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/jpg",
                    "image/gif",
                ];
                if (
                    !(data.image instanceof File) ||
                    !validTypes.includes(data.image.type)
                )
                    errors.image = "Image must be a JPEG, PNG, JPG, or GIF.";
                else if (data.image.size > 2 * 1024 * 1024)
                    errors.image = "Image size must be less than 2MB.";
            }

            if (data.duration && data.duration.length > 50) {
                errors.duration = "Duration must not exceed 50 characters.";
            }

            if (data.group_size && data.group_size.length > 50) {
                errors.group_size = "Group size must not exceed 50 characters.";
            }

            setValidationErrors(errors);
            return Object.keys(errors).length === 0;
        },
        [data, selectedOffer, companies, destinations]
    );

    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        setData("image", file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    }, []);

    const removeImage = useCallback(() => {
        setData("image", null);
        setImagePreview(null);
    }, []);

    const filteredOffers = useMemo(() => {
        return offers.filter(
            (offer) =>
                offer.title
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                offer.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                offer.location
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
        );
    }, [offers, searchQuery]);

    const paginatedOffers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredOffers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredOffers, currentPage]);

    const totalPages = Math.ceil(filteredOffers.length / ITEMS_PER_PAGE);

    const handleAdd = useCallback(
        (e) => {
            e.preventDefault();
            if (!validateForm(true)) {
                toast.error("Please fix the form errors.");
                return;
            }

            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("description", data.description);
            formData.append("location", data.location);
            formData.append("category", data.category);
            if (data.image) formData.append("image", data.image);
            formData.append("price", data.price);
            if (data.discount_price)
                formData.append("discount_price", data.discount_price);
            if (data.discount_type)
                formData.append("discount_type", data.discount_type);
            if (data.start_date) formData.append("start_date", data.start_date);
            if (data.end_date) formData.append("end_date", data.end_date);
            formData.append("company_id", data.company_id);
            formData.append("destination_id", data.destination_id);
            formData.append("is_active", data.is_active ? "1" : "0");
            if (data.duration) formData.append("duration", data.duration);
            if (data.group_size) formData.append("group_size", data.group_size);

            post(route("admin.offers.store"), {
                data: formData,
                headers: { "Content-Type": "multipart/form-data" },
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setShowAddModal(false);
                    reset();
                    setImagePreview(null);
                    setValidationErrors({});
                    setCurrentPage(1);
                },
                onError: (errors) => {
                    setValidationErrors(errors);
                    toast.error("Failed to add offer. Please check the form.");
                },
            });
        },
        [data, post, reset, validateForm]
    );

    const handleEdit = useCallback(
        (e) => {
            e.preventDefault();
            if (!validateForm(false)) {
                toast.error("Please fix the form errors.");
                return;
            }

            const formData = new FormData();
            if (data.title !== selectedOffer.title)
                formData.append("title", data.title);
            if (data.description !== selectedOffer.description)
                formData.append("description", data.description);
            if (data.location !== selectedOffer.location)
                formData.append("location", data.location);
            if (data.category !== selectedOffer.category)
                formData.append("category", data.category);
            if (data.image instanceof File)
                formData.append("image", data.image);
            if (data.price !== selectedOffer.price?.toString())
                formData.append("price", data.price);
            if (
                data.discount_price !==
                (selectedOffer.discount_price?.toString() || "")
            )
                formData.append("discount_price", data.discount_price);
            if (data.discount_type !== selectedOffer.discount_type)
                formData.append("discount_type", data.discount_type);
            if (data.start_date !== formatDate(selectedOffer.start_date))
                formData.append("start_date", data.start_date);
            if (data.end_date !== formatDate(selectedOffer.end_date))
                formData.append("end_date", data.end_date);
            if (data.company_id !== selectedOffer.company_id)
                formData.append("company_id", data.company_id);
            if (data.destination_id !== selectedOffer.destination_id)
                formData.append("destination_id", data.destination_id);
            if (data.is_active !== selectedOffer.is_active)
                formData.append("is_active", data.is_active ? "1" : "0");
            if (data.duration !== selectedOffer.duration)
                formData.append("duration", data.duration);
            if (data.group_size !== selectedOffer.group_size)
                formData.append("group_size", data.group_size);
            formData.append("_method", "PUT");

            post(route("admin.offers.update", selectedOffer.id), {
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-HTTP-Method-Override": "PUT",
                },
                preserveScroll: true,
                preserveState: true,
                forceFormData: true,
                onSuccess: () => {
                    setShowEditModal(false);
                    reset();
                    setImagePreview(null);
                    setSelectedOffer(null);
                    setValidationErrors({});
                },
                onError: (errors) => {
                    setValidationErrors(errors);
                    toast.error(
                        "Failed to update offer. Please check the form."
                    );
                },
            });
        },
        [data, selectedOffer, post, reset, validateForm, formatDate]
    );

    const handleDelete = useCallback(
        (id) => {
            const offer = offers.find((o) => o.id === id);
            setOfferToDelete(offer);
            setShowDeleteModal(true);
        },
        [offers]
    );

    const confirmDelete = useCallback(() => {
        if (offerToDelete) {
            deleteForm(route("admin.offers.destroy", offerToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setOfferToDelete(null);
                    setCurrentPage(1);
                },
                onError: () => {
                    setShowDeleteModal(false);
                    setOfferToDelete(null);
                    toast.error("Failed to delete offer. Please try again.");
                },
            });
        }
    }, [offerToDelete, deleteForm]);

    const handleToggleActive = useCallback(
        (id) => {
            patch(route("admin.offers.toggle", id), {
                preserveScroll: true,
                onError: () => {
                    toast.error(
                        "Failed to toggle offer status. Please try again."
                    );
                },
            });
        },
        [patch]
    );

    const openEditModal = useCallback(
        (offer) => {
            setSelectedOffer(offer);
            setData({
                title: offer.title || "",
                description: offer.description || "",
                location: offer.location || "",
                category: offer.category || "",
                image: null,
                price: offer.price !== null ? offer.price.toString() : "",
                discount_price:
                    offer.discount_price !== null
                        ? offer.discount_price.toString()
                        : "",
                discount_type: offer.discount_type || "",
                start_date: formatDate(offer.start_date) || "",
                end_date: formatDate(offer.end_date) || "",
                company_id: offer.company_id || "",
                destination_id: offer.destination_id || "",
                is_active: offer.is_active || false,
                duration: offer.duration || "",
                group_size: offer.group_size || "",
            });
            setImagePreview(offer.image ? offer.image : null);
            setShowEditModal(true);
        },
        [setData, formatDate]
    );

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

        // تنظيف الرسائل عند تغيير الصفحة أو إعادة تحميل
        return () => {
            if (!successMessage && !errorMessage) {
                setShownMessages(new Set());
            }
        };
    }, [flash.success, flash.error, shownMessages]);

    // تنظيف معاينة الصور
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <Head title="Offers - Triplus Admin" />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <div className="lg:ml-64 p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-2xl font-bold text-white">Offers</h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search offers..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Offer
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedOffers.length > 0 ? (
                        paginatedOffers.map((offer) => (
                            <OfferCard
                                key={offer.id}
                                offer={offer}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                                onToggle={handleToggleActive}
                                processing={processing}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-400 py-8">
                            No offers found
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-gray-300">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {showAddModal && (
                    <OfferForm
                        isEdit={false}
                        data={data}
                        setData={setData}
                        handleSubmit={handleAdd}
                        companies={companies}
                        destinations={destinations}
                        imagePreview={imagePreview}
                        handleImageChange={handleImageChange}
                        removeImage={removeImage}
                        validationErrors={validationErrors}
                        errors={errors}
                        processing={processing}
                        onCancel={() => {
                            setShowAddModal(false);
                            setImagePreview(null);
                            reset();
                            setValidationErrors({});
                        }}
                    />
                )}

                {showEditModal && selectedOffer && (
                    <OfferForm
                        isEdit={true}
                        data={data}
                        setData={setData}
                        handleSubmit={handleEdit}
                        companies={companies}
                        destinations={destinations}
                        imagePreview={imagePreview}
                        handleImageChange={handleImageChange}
                        removeImage={removeImage}
                        validationErrors={validationErrors}
                        errors={errors}
                        processing={processing}
                        onCancel={() => {
                            setShowEditModal(false);
                            setImagePreview(null);
                            reset();
                            setValidationErrors({});
                            setSelectedOffer(null);
                        }}
                        selectedOffer={selectedOffer}
                    />
                )}

                {showDeleteModal && offerToDelete && (
                    <DeleteModal
                        offerToDelete={offerToDelete}
                        onConfirm={confirmDelete}
                        onCancel={() => {
                            setShowDeleteModal(false);
                            setOfferToDelete(null);
                        }}
                        processing={processing}
                    />
                )}
            </div>
            <AdminSidebar />
        </div>
    );
}
