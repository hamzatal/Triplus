import React, { useState, useEffect, useRef } from "react";
import { Head, usePage, useForm } from "@inertiajs/react";
import {
    Search,
    Trash2,
    Plus,
    Edit2,
    Image as ImageIcon,
    X,
    ToggleLeft,
    ToggleRight,
    MapPin,
    DollarSign,
} from "lucide-react";
import AdminSidebar from "@/Components/AdminSidebar";
import toast, { Toaster } from "react-hot-toast";

const styles = `
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #1f2937; border-radius: 4px; }
  ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; transition: background 0.2s; }
  ::-webkit-scrollbar-thumb:hover { background: #2563eb; }
  ::-webkit-scrollbar-corner { background: #1f2937; }
  * { scrollbar-width: thin; scrollbar-color: #4b5563 #1f2937; }
`;

if (!document.getElementById("custom-scrollbar-styles")) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "custom-scrollbar-styles";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

const calculateDiscount = (original, discounted) => {
    if (!discounted || !original) return null;
    return Math.round(((original - discounted) / original) * 100);
};

export default function AdminDestinations() {
    const { props } = usePage();
    const { destinations = [], companies = [], flash = {} } = props;

    const {
        data,
        setData,
        post,
        delete: deleteForm,
        patch,
        processing,
        reset,
        errors,
    } = useForm({
        company_id: "",
        title: "",
        location: "",
        description: "",
        category: "",
        price: "",
        discount_price: "",
        image: null,
        is_featured: false,
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [charCount, setCharCount] = useState(0);

    const lastFlashRef = useRef({ success: null, error: null });

    const validateForm = (isAdd = false) => {
        const errors = {};

        if (isAdd || data.company_id !== selectedDestination?.company?.id) {
            if (!data.company_id) errors.company_id = "Company is required";
        }

        if (isAdd || data.title !== selectedDestination?.title) {
            if (!data.title) errors.title = "Title is required";
            else if (data.title.length < 3)
                errors.title = "Title must be at least 3 characters";
            else if (data.title.length > 255)
                errors.title = "Title must not exceed 255 characters";
        }

        if (isAdd || data.location !== selectedDestination?.location) {
            if (!data.location) errors.location = "Location is required";
            else if (data.location.length < 3)
                errors.location = "Location must be at least 3 characters";
            else if (data.location.length > 255)
                errors.location = "Location must not exceed 255 characters";
        }

        if (isAdd || data.description !== selectedDestination?.description) {
            if (!data.description)
                errors.description = "Description is required";
            else if (data.description.length < 10)
                errors.description =
                    "Description must be at least 10 characters";
            else if (data.description.length > 1000)
                errors.description =
                    "Description must not exceed 1000 characters";
        }

        const validCategories = [
            "Beach",
            "Mountain",
            "City",
            "Cultural",
            "Adventure",
            "Historical",
            "Wildlife",
        ];
        if (isAdd || data.category !== selectedDestination?.category) {
            if (!data.category) errors.category = "Category is required";
            else if (!validCategories.includes(data.category))
                errors.category = "Invalid category selected";
        }

        if (isAdd || data.price !== selectedDestination?.price?.toString()) {
            if (!data.price) errors.price = "Price is required";
            else if (
                isNaN(parseFloat(data.price)) ||
                parseFloat(data.price) < 0
            )
                errors.price =
                    "Price must be a valid number greater than or equal to 0";
        }

        if (data.discount_price) {
            if (
                isNaN(parseFloat(data.discount_price)) ||
                parseFloat(data.discount_price) < 0
            )
                errors.discount_price =
                    "Discount price must be a valid number greater than or equal to 0";
            else if (
                data.price &&
                parseFloat(data.discount_price) >= parseFloat(data.price)
            )
                errors.discount_price =
                    "Discount price must be less than the original price";
        }

        if (isAdd && !data.image) errors.image = "Image is required";

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
                errors.image = "Image must be of type JPEG, PNG, JPG, or GIF";
            else if (data.image.size > 2 * 1024 * 1024)
                errors.image = "Image size must be less than 2MB";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData("image", null);
        setImagePreview(null);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!validateForm(true)) {
            toast.error("Please fix the form errors.");
            return;
        }

        const formData = new FormData();
        formData.append("company_id", data.company_id);
        formData.append("title", data.title);
        formData.append("location", data.location);
        formData.append("description", data.description);
        formData.append("category", data.category);
        formData.append("price", data.price);
        if (data.discount_price)
            formData.append("discount_price", data.discount_price);
        formData.append("is_featured", data.is_featured ? "1" : "0");
        if (data.image instanceof File) formData.append("image", data.image);

        post("/admin/destinations", {
            data: formData,
            headers: { "Content-Type": "multipart/form-data" },
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowAddModal(false);
                reset();
                setImagePreview(null);
                setCharCount(0);
                setValidationErrors({});
            },
            onError: (errors) => {
                setValidationErrors(errors);
                toast.error(
                    "Failed to add destination: Please check the form."
                );
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        if (!validateForm(false)) {
            toast.error("Please fix the form errors.");
            return;
        }

        const formData = new FormData();
        if (data.company_id !== selectedDestination.company?.id)
            formData.append("company_id", data.company_id);
        if (data.title !== selectedDestination.title)
            formData.append("title", data.title);
        if (data.location !== selectedDestination.location)
            formData.append("location", data.location);
        if (data.description !== selectedDestination.description)
            formData.append("description", data.description);
        if (data.category !== selectedDestination.category)
            formData.append("category", data.category);
        if (data.price !== selectedDestination.price?.toString())
            formData.append("price", data.price);
        if (
            data.discount_price !==
            (selectedDestination.discount_price?.toString() || "")
        )
            formData.append("discount_price", data.discount_price);
        if (data.is_featured !== !!selectedDestination.is_featured)
            formData.append("is_featured", data.is_featured ? "1" : "0");
        if (data.image instanceof File) formData.append("image", data.image);
        formData.append("_method", "PUT");

        post(`/admin/destinations/${selectedDestination.id}`, {
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
                setSelectedDestination(null);
                setCharCount(0);
                setValidationErrors({});
            },
            onError: (errors) => {
                setValidationErrors(errors);
                toast.error(
                    "Failed to update destination: Please check the form."
                );
            },
        });
    };

    const handleDelete = () => {
        if (selectedDestination) {
            deleteForm(`/admin/destinations/${selectedDestination.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setSelectedDestination(null);
                },
                onError: () => {
                    toast.error("Failed to delete destination.");
                },
            });
        }
    };

    const handleToggleFeatured = (id) => {
        patch(`/admin/destinations/${id}/toggle-featured`, {
            preserveScroll: true,
            onError: () => {
                toast.error("Failed to update featured status.");
            },
        });
    };

    const openEditModal = (destination) => {
        setSelectedDestination(destination);
        setData({
            company_id: destination.company?.id || "",
            title: destination.title || "",
            location: destination.location || "",
            description: destination.description || "",
            category: destination.category || "",
            price: destination.price ? destination.price.toString() : "",
            discount_price: destination.discount_price
                ? destination.discount_price.toString()
                : "",
            image: null,
            is_featured: !!destination.is_featured,
        });
        setImagePreview(destination.image || null);
        setCharCount(
            destination.description ? destination.description.length : 0
        );
        setShowEditModal(true);
    };

    const openDeleteModal = (destination) => {
        setSelectedDestination(destination);
        setShowDeleteModal(true);
    };

    const filteredDestinations = destinations.filter(
        (destination) =>
            (destination.title || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (destination.location || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (destination.company?.company_name || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (destination.category || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (flash.success && flash.success !== lastFlashRef.current.success) {
            toast.success(flash.success);
            lastFlashRef.current.success = flash.success;
        }
        if (flash.error && flash.error !== lastFlashRef.current.error) {
            toast.error(flash.error);
            lastFlashRef.current.error = flash.error;
        }
    }, [flash.success, flash.error]);

    useEffect(() => {
        setCharCount(data.description ? data.description.length : 0);
    }, [data.description]);

    useEffect(() => {
        return () => {
            if (imagePreview && typeof imagePreview === "string") {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <Head title="Destinations - Triplus Admin" />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <div className="lg:ml-64 p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-2xl font-bold text-white">
                        Destinations
                    </h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search destinations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        </div>
                        <button
                            onClick={() => {
                                reset();
                                setImagePreview(null);
                                setCharCount(0);
                                setValidationErrors({});
                                setShowAddModal(true);
                            }}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            disabled={companies.length === 0}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Destination
                        </button>
                    </div>
                </div>

                {companies.length === 0 && (
                    <div className="bg-yellow-600 text-white p-4 rounded-lg mb-6">
                        No active companies available. Please activate a company
                        first.
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDestinations.length > 0 ? (
                        filteredDestinations.map((destination) => (
                            <div
                                key={destination.id}
                                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {destination.image ? (
                                    <img
                                        src={destination.image}
                                        alt={destination.title || "Destination"}
                                        className="w-full h-48 object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-semibold text-white">
                                            {destination.title || "N/A"}
                                        </h3>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(destination)
                                                }
                                                className="text-blue-400 hover:text-blue-300"
                                                disabled={processing}
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    openDeleteModal(destination)
                                                }
                                                className="text-red-400 hover:text-red-300"
                                                disabled={processing}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleToggleFeatured(
                                                        destination.id
                                                    )
                                                }
                                                className={`${
                                                    destination.is_featured
                                                        ? "text-green-400 hover:text-green-300"
                                                        : "text-gray-400 hover:text-gray-300"
                                                }`}
                                                disabled={processing}
                                                title={
                                                    destination.is_featured
                                                        ? "Remove from featured"
                                                        : "Add to featured"
                                                }
                                            >
                                                {destination.is_featured ? (
                                                    <ToggleRight className="w-5 h-5" />
                                                ) : (
                                                    <ToggleLeft className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-1">
                                        {destination.company?.company_name ||
                                            "No company"}
                                    </p>
                                    <p className="text-sm text-gray-400 mb-1">
                                        <MapPin className="inline w-4 h-4 mr-1" />
                                        {destination.location || "N/A"}
                                    </p>
                                    <p className="text-sm text-gray-400 mb-2">
                                        Category:{" "}
                                        {destination.category || "N/A"}
                                    </p>
                                    <div className="flex items-center mb-2">
                                        <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                                        {destination.discount_price ? (
                                            <span>
                                                <span className="font-semibold text-green-400">
                                                    $
                                                    {destination.discount_price}
                                                </span>
                                                <span className="text-gray-400 text-sm line-through ml-2">
                                                    ${destination.price}
                                                </span>
                                                <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded ml-2">
                                                    {calculateDiscount(
                                                        destination.price,
                                                        destination.discount_price
                                                    )}
                                                    % OFF
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="font-semibold text-green-400">
                                                ${destination.price}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-500 mt-2">
                                        ID: {destination.id} | Featured:{" "}
                                        {destination.is_featured ? "Yes" : "No"}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-400 py-8">
                            No destinations found
                        </div>
                    )}
                </div>

                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        Add Destination
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowAddModal(false);
                                            reset();
                                            setImagePreview(null);
                                            setCharCount(0);
                                            setValidationErrors({});
                                        }}
                                        className="text-gray-400 hover:text-gray-300"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <form
                                    onSubmit={handleAdd}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label
                                            htmlFor="company_id"
                                            className="block text-sm font-medium text-gray-400 mb-1"
                                        >
                                            Company{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
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
                                            className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                validationErrors.company_id ||
                                                errors.company_id
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                            required
                                            disabled={companies.length === 0}
                                        >
                                            <option value="">
                                                Select Company
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor="title"
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                Title{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                value={data.title}
                                                onChange={(e) =>
                                                    setData(
                                                        "title",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    validationErrors.title ||
                                                    errors.title
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                                required
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
                                                htmlFor="location"
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                Location{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    id="location"
                                                    value={data.location}
                                                    onChange={(e) =>
                                                        setData(
                                                            "location",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full pl-10 p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        validationErrors.location ||
                                                        errors.location
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                    required
                                                />
                                            </div>
                                            {(validationErrors.location ||
                                                errors.location) && (
                                                <p className="text-red-400 text-xs mt-1">
                                                    {validationErrors.location ||
                                                        errors.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="category"
                                            className="block text-sm font-medium text-gray-400 mb-1"
                                        >
                                            Category{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            id="category"
                                            value={data.category}
                                            onChange={(e) =>
                                                setData(
                                                    "category",
                                                    e.target.value
                                                )
                                            }
                                            className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                validationErrors.category ||
                                                errors.category
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                            required
                                        >
                                            <option value="">
                                                Select Category
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

                                    <div>
                                        <label
                                            htmlFor="description"
                                            className="block text-sm font-medium text-gray-400 mb-1"
                                        >
                                            Description{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                            <span className="text-gray-500 text-xs ml-2">
                                                ({charCount}/1000)
                                            </span>
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
                                            rows="4"
                                            className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                validationErrors.description ||
                                                errors.description
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                            required
                                        />
                                        {(validationErrors.description ||
                                            errors.description) && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {validationErrors.description ||
                                                    errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor="price"
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                Price{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="number"
                                                    id="price"
                                                    value={data.price}
                                                    onChange={(e) =>
                                                        setData(
                                                            "price",
                                                            e.target.value
                                                        )
                                                    }
                                                    step="0.01"
                                                    min="0"
                                                    className={`w-full pl-10 p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        validationErrors.price ||
                                                        errors.price
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                    required
                                                />
                                            </div>
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
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                Discount Price
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                                                    step="0.01"
                                                    min="0"
                                                    className={`w-full pl-10 p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        validationErrors.discount_price ||
                                                        errors.discount_price
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                />
                                            </div>
                                            {(validationErrors.discount_price ||
                                                errors.discount_price) && (
                                                <p className="text-red-400 text-xs mt-1">
                                                    {validationErrors.discount_price ||
                                                        errors.discount_price}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="image"
                                            className="block text-sm font-medium text-gray-400 mb-1"
                                        >
                                            Image{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="file"
                                            id="image"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg ${
                                                validationErrors.image ||
                                                errors.image
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
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

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_featured"
                                            checked={data.is_featured}
                                            onChange={(e) =>
                                                setData(
                                                    "is_featured",
                                                    e.target.checked
                                                )
                                            }
                                            className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                                        />
                                        <label
                                            htmlFor="is_featured"
                                            className="ml-2 text-sm font-medium text-gray-400"
                                        >
                                            Featured Destination
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddModal(false);
                                                reset();
                                                setImagePreview(null);
                                                setCharCount(0);
                                                setValidationErrors({});
                                            }}
                                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                        >
                                            {processing ? (
                                                <span className="inline-block mr-2 animate-spin">
                                                    ⟳
                                                </span>
                                            ) : (
                                                <Plus className="w-4 h-4 mr-2" />
                                            )}
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {showEditModal && selectedDestination && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        Edit Destination
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            reset();
                                            setImagePreview(null);
                                            setSelectedDestination(null);
                                            setCharCount(0);
                                            setValidationErrors({});
                                        }}
                                        className="text-gray-400 hover:text-gray-300"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <form
                                    onSubmit={handleEdit}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label
                                            htmlFor="company_id"
                                            className="block text-sm font-medium text-gray-400 mb-1"
                                        >
                                            Company{" "}
                                            <span className="text-gray-500">
                                                (Optional)
                                            </span>
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
                                            className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                validationErrors.company_id ||
                                                errors.company_id
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        >
                                            <option value="">
                                                Select Company
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor="title"
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                Title{" "}
                                                <span className="text-gray-500">
                                                    (Optional)
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                value={data.title}
                                                onChange={(e) =>
                                                    setData(
                                                        "title",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    validationErrors.title ||
                                                    errors.title
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
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
                                                htmlFor="location"
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                Location{" "}
                                                <span className="text-gray-500">
                                                    (Optional)
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    id="location"
                                                    value={data.location}
                                                    onChange={(e) =>
                                                        setData(
                                                            "location",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full pl-10 p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        validationErrors.location ||
                                                        errors.location
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                />
                                            </div>
                                            {(validationErrors.location ||
                                                errors.location) && (
                                                <p className="text-red-400 text-xs mt-1">
                                                    {validationErrors.location ||
                                                        errors.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="category"
                                            className="block text-sm font-medium text-gray-400 mb-1"
                                        >
                                            Category{" "}
                                            <span className="text-gray-500">
                                                (Optional)
                                            </span>
                                        </label>
                                        <select
                                            id="category"
                                            value={data.category}
                                            onChange={(e) =>
                                                setData(
                                                    "category",
                                                    e.target.value
                                                )
                                            }
                                            className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                validationErrors.category ||
                                                errors.category
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        >
                                            <option value="">
                                                Select Category
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

                                    <div>
                                        <label
                                            htmlFor="description"
                                            className="block text-sm font-medium text-gray-400 mb-1"
                                        >
                                            Description{" "}
                                            <span className="text-gray-500">
                                                (Optional)
                                            </span>
                                            <span className="text-gray-500 text-xs ml-2">
                                                ({charCount}/1000)
                                            </span>
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
                                            rows="4"
                                            className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                validationErrors.description ||
                                                errors.description
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        />
                                        {(validationErrors.description ||
                                            errors.description) && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {validationErrors.description ||
                                                    errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor="price"
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                Price{" "}
                                                <span className="text-gray-500">
                                                    (Optional)
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="number"
                                                    id="price"
                                                    value={data.price}
                                                    onChange={(e) =>
                                                        setData(
                                                            "price",
                                                            e.target.value
                                                        )
                                                    }
                                                    step="0.01"
                                                    min="0"
                                                    className={`w-full pl-10 p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        validationErrors.price ||
                                                        errors.price
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                />
                                            </div>
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
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                Discount Price{" "}
                                                <span className="text-gray-500">
                                                    (Optional)
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                                                    step="0.01"
                                                    min="0"
                                                    className={`w-full pl-10 p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        validationErrors.discount_price ||
                                                        errors.discount_price
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                />
                                            </div>
                                            {(validationErrors.discount_price ||
                                                errors.discount_price) && (
                                                <p className="text-red-400 text-xs mt-1">
                                                    {validationErrors.discount_price ||
                                                        errors.discount_price}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="image"
                                            className="block text-sm font-medium text-gray-400 mb-1"
                                        >
                                            Image{" "}
                                            <span className="text-gray-500">
                                                (Optional)
                                            </span>
                                        </label>
                                        <input
                                            type="file"
                                            id="image"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg ${
                                                validationErrors.image ||
                                                errors.image
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
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

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_featured"
                                            checked={data.is_featured}
                                            onChange={(e) =>
                                                setData(
                                                    "is_featured",
                                                    e.target.checked
                                                )
                                            }
                                            className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                                        />
                                        <label
                                            htmlFor="is_featured"
                                            className="ml-2 text-sm font-medium text-gray-400"
                                        >
                                            Featured Destination
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditModal(false);
                                                reset();
                                                setImagePreview(null);
                                                setSelectedDestination(null);
                                                setCharCount(0);
                                                setValidationErrors({});
                                            }}
                                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                        >
                                            {processing ? (
                                                <span className="inline-block mr-2 animate-spin">
                                                    ⟳
                                                </span>
                                            ) : (
                                                <Edit2 className="w-4 h-4 mr-2" />
                                            )}
                                            Update
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && selectedDestination && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg max-w-lg w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        Confirm Delete
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setSelectedDestination(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-300"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <p className="text-gray-300 mb-6">
                                    Are you sure you want to delete the
                                    destination "
                                    <span className="font-semibold">
                                        {selectedDestination.title}
                                    </span>
                                    "? This action cannot be undone.
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setSelectedDestination(null);
                                        }}
                                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={processing}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                                    >
                                        {processing ? (
                                            <span className="inline-block mr-2 animate-spin">
                                                ⟳
                                            </span>
                                        ) : (
                                            <Trash2 className="w-4 h-4 mr-2" />
                                        )}
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <AdminSidebar />
        </div>
    );
}
