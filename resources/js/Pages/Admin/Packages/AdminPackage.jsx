import React, { useState, useEffect } from "react";
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
    Calendar,
    DollarSign,
    Tag,
    MapPin,
} from "lucide-react";
import AdminSidebar from "@/Components/AdminSidebar";
import toast, { Toaster } from "react-hot-toast";

// Custom Scrollbar Styles
const styles = `
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #1f2937; border-radius: 4px; }
  ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; transition: background 0.2s; }
  ::-webkit-scrollbar-thumb:hover { background: #2563eb; }
  ::-webkit-scrollbar-corner { background: #1f2937; }
  * { scrollbar-width: thin; scrollbar-color: #4b5563 #1f2937; }
`;

// Inject styles
if (!document.getElementById("custom-scrollbar-styles")) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "custom-scrollbar-styles";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

// Format date for display
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

// Convert ISO date to yyyy-MM-dd
const formatISOToDateInput = (isoString) => {
    if (!isoString) return "";
    return isoString.split("T")[0];
};

// Calculate discount percentage
const calculateDiscount = (original, discounted) => {
    if (!discounted || !original) return null;
    return Math.round(((original - discounted) / original) * 100);
};

export default function AdminPackage() {
    const { props } = usePage();
    const {
        packages = [],
        flash = {},
        companies = [],
        destinations = [],
    } = props;

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
        company_id: "",
        title: "",
        subtitle: "",
        description: "",
        price: "",
        discount_price: "",
        discount_type: "percentage",
        start_date: "",
        end_date: "",
        image: null,
        is_featured: false,
        destination_id: "",
        location: "",
    });

    // State management
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [packageToDelete, setPackageToDelete] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [charCount, setCharCount] = useState(0);
    const [lastFlash, setLastFlash] = useState({ success: null, error: null });

    // Form validation
    const validateForm = (isAdd = false) => {
        const errors = {};
        const today = new Date().toISOString().split("T")[0];

        if (!data.company_id) {
            errors.company_id = "Company is required";
        }

        if (!data.destination_id) {
            errors.destination_id = "Destination is required";
        }

        if (!data.title) {
            errors.title = "Title is required";
        } else if (data.title.length < 3) {
            errors.title = "Title must be at least 3 characters";
        } else if (data.title.length > 255) {
            errors.title = "Title must be 255 characters or less";
        }

        if (data.subtitle && data.subtitle.length > 255) {
            errors.subtitle = "Subtitle must be 255 characters or less";
        }

        if (!data.description) {
            errors.description = "Description is required";
        } else if (data.description.length < 10) {
            errors.description = "Description must be at least 10 characters";
        } else if (data.description.length > 5000) {
            errors.description = "Description must be 5000 characters or less";
        }

        if (!data.price) {
            errors.price = "Price is required";
        } else if (
            isNaN(parseFloat(data.price)) ||
            parseFloat(data.price) <= 0
        ) {
            errors.price = "Price must be a positive number";
        }

        if (data.discount_price) {
            if (
                isNaN(parseFloat(data.discount_price)) ||
                parseFloat(data.discount_price) < 0
            ) {
                errors.discount_price =
                    "Discount price must be a non-negative number";
            } else if (
                parseFloat(data.discount_price) >= parseFloat(data.price)
            ) {
                errors.discount_price =
                    "Discount price must be less than regular price";
            }
        }

        if (data.discount_price && !data.discount_type) {
            errors.discount_type =
                "Discount type is required when discount price is set";
        }

        if (data.start_date && data.start_date < today) {
            errors.start_date = "Start date cannot be in the past";
        }

        if (
            data.end_date &&
            data.start_date &&
            data.end_date < data.start_date
        ) {
            errors.end_date = "End date must be on or after start date";
        }

        if (isAdd && !data.image) {
            errors.image = "Image is required";
        }

        if (data.image) {
            const validTypes = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/gif",
                "image/webp",
            ];
            if (!validTypes.includes(data.image.type)) {
                errors.image = "Image must be JPEG, PNG, JPG, GIF, or WebP";
            }
            if (data.image.size > 2 * 1024 * 1024) {
                errors.image = "Image size must be less than 2MB";
            }
        }

        if (data.location && data.location.length > 100) {
            errors.location = "Location must be 100 characters or less";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Remove image
    const removeImage = () => {
        setData("image", null);
        setImagePreview(null);
    };

    // Handle add package
    const handleAdd = (e) => {
        e.preventDefault();
        if (!validateForm(true)) {
            toast.error("Please fix the form errors.");
            return;
        }

        post("/admin/packages", {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddModal(false);
                reset();
                setImagePreview(null);
                setCharCount(0);
                setValidationErrors({});
            },
            onError: (errors) => {
                setValidationErrors(errors);
                toast.error("Failed to add package. Please check the form.");
            },
        });
    };

    // Handle edit package
    const handleEdit = (e) => {
        e.preventDefault();
        if (!validateForm(false)) {
            toast.error("Please fix the form errors.");
            return;
        }

        // Use POST with _method: 'PUT' for file uploads
        post(`/admin/packages/${selectedPackage.id}`, {
            ...data,
            _method: "PUT", // Laravel method spoofing
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
                reset();
                setImagePreview(null);
                setSelectedPackage(null);
                setCharCount(0);
                setValidationErrors({});
            },
            onError: (errors) => {
                setValidationErrors(errors);
                toast.error("Failed to update package. Please check the form.");
            },
        });
    };
    // Handle delete package
    const handleDelete = () => {
        if (packageToDelete) {
            deleteForm(`/admin/packages/${packageToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setPackageToDelete(null);
                },
                onError: () => {
                    toast.error("Failed to delete package.");
                },
            });
        }
    };

    // Handle toggle featured
    const handleToggleFeatured = (id) => {
        patch(`/admin/packages/${id}/toggle-featured`, {
            preserveScroll: true,
            onError: () => toast.error("Failed to update featured status"),
        });
    };

    // Open edit modal
    const openEditModal = (pkg) => {
        setSelectedPackage(pkg);
        setData({
            company_id: pkg.company?.id || "",
            title: pkg.title || "",
            subtitle: pkg.subtitle || "",
            description: pkg.description || "",
            price: pkg.price ? pkg.price.toString() : "",
            discount_price: pkg.discount_price
                ? pkg.discount_price.toString()
                : "",
            discount_type: pkg.discount_type || "percentage",
            start_date: formatISOToDateInput(pkg.start_date),
            end_date: formatISOToDateInput(pkg.end_date),
            image: null,
            is_featured: !!pkg.is_featured,
            destination_id: pkg.destination_id || "",
            location: pkg.location || "",
        });
        setImagePreview(pkg.image || null);
        setCharCount(pkg.description ? pkg.description.length : 0);
        setShowEditModal(true);
    };

    // Open delete modal
    const openDeleteModal = (pkg) => {
        setPackageToDelete(pkg);
        setShowDeleteModal(true);
    };

    // Filter packages
    const filteredPackages = packages.filter(
        (pkg) =>
            (pkg.title || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (pkg.subtitle || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (pkg.company?.name || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (pkg.destination?.name || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (pkg.location || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    // Handle flash messages
    useEffect(() => {
        if (flash.success && flash.success !== lastFlash.success) {
            toast.success(flash.success);
            setLastFlash((prev) => ({ ...prev, success: flash.success }));
        }
        if (flash.error && flash.error !== lastFlash.error) {
            toast.error(flash.error);
            setLastFlash((prev) => ({ ...prev, error: flash.error }));
        }
    }, [flash, lastFlash]);

    // Update char count
    useEffect(() => {
        setCharCount(data.description ? data.description.length : 0);
    }, [data.description]);

    // Clean up image preview
    useEffect(() => {
        return () => {
            if (imagePreview && typeof imagePreview === "string") {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <Head title="Packages - Triplus Admin" />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <div className="lg:ml-64 p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-2xl font-bold text-white">Packages</h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search packages..."
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
                            disabled={
                                companies.length === 0 ||
                                destinations.length === 0
                            }
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Package
                        </button>
                    </div>
                </div>

                {companies.length === 0 && (
                    <div className="bg-yellow-600 text-white p-4 rounded-lg mb-6">
                        No companies available. Please add a company before
                        creating packages.
                    </div>
                )}
                {destinations.length === 0 && (
                    <div className="bg-yellow-600 text-white p-4 rounded-lg mb-6">
                        No destinations available. Please add destinations to
                        create packages.
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPackages.length > 0 ? (
                        filteredPackages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {pkg.image ? (
                                    <img
                                        src={pkg.image}
                                        alt={pkg.title || "Package"}
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
                                            {pkg.title || "N/A"}
                                        </h3>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(pkg)
                                                }
                                                className="text-blue-400 hover:text-blue-300"
                                                disabled={processing}
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    openDeleteModal(pkg)
                                                }
                                                className="text-red-400 hover:text-red-300"
                                                disabled={processing}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleToggleFeatured(pkg.id)
                                                }
                                                className={`${
                                                    pkg.is_featured
                                                        ? "text-green-400 hover:text-green-300"
                                                        : "text-gray-400 hover:text-gray-300"
                                                }`}
                                                disabled={processing}
                                                title={
                                                    pkg.is_featured
                                                        ? "Remove from featured"
                                                        : "Add to featured"
                                                }
                                            >
                                                {pkg.is_featured ? (
                                                    <ToggleRight className="w-5 h-5" />
                                                ) : (
                                                    <ToggleLeft className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-1">
                                        {pkg.company?.name || "No company"}
                                    </p>
                                    <p className="text-sm text-gray-400 mb-1">
                                        <MapPin className="inline w-4 h-4 mr-1" />
                                        {pkg.destination?.name ||
                                            "No destination"}
                                    </p>
                                    <p className="text-sm text-gray-400 mb-1">
                                        <MapPin className="inline w-4 h-4 mr-1" />
                                        {pkg.location || "No location"}
                                    </p>
                                    <p className="text-sm text-gray-400 mb-2">
                                        {pkg.subtitle || "N/A"}
                                    </p>
                                    <div className="flex items-center mb-2">
                                        <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                                        {pkg.discount_price ? (
                                            <span>
                                                <span className="font-semibold text-green-400">
                                                    ${pkg.discount_price}
                                                </span>
                                                <span className="text-gray-400 text-sm line-through ml-2">
                                                    ${pkg.price}
                                                </span>
                                                <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded ml-2">
                                                    {calculateDiscount(
                                                        pkg.price,
                                                        pkg.discount_price
                                                    )}
                                                    % OFF
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="font-semibold text-green-400">
                                                ${pkg.price}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center mb-2">
                                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                                        <span className="text-sm text-gray-400">
                                            {formatDate(pkg.start_date)} -{" "}
                                            {formatDate(pkg.end_date)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        ID: {pkg.id} | Featured:{" "}
                                        {pkg.is_featured ? "Yes" : "No"}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-400 py-8">
                            No packages found
                        </div>
                    )}
                </div>

                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        Add Package
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

                                    <div>
                                        <label
                                            htmlFor="destination_id"
                                            className="block text-sm font-medium text-gray-400 mb-1"
                                        >
                                            Destination{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
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
                                            className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                validationErrors.destination_id ||
                                                errors.destination_id
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                            required
                                        >
                                            <option value="">
                                                Select Destination
                                            </option>
                                            {destinations.map((destination) => (
                                                <option
                                                    key={destination.id}
                                                    value={destination.id}
                                                >
                                                    {destination.name}
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
                                                htmlFor="subtitle"
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                Subtitle
                                            </label>
                                            <input
                                                type="text"
                                                id="subtitle"
                                                value={data.subtitle}
                                                onChange={(e) =>
                                                    setData(
                                                        "subtitle",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    validationErrors.subtitle ||
                                                    errors.subtitle
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                            />
                                            {(validationErrors.subtitle ||
                                                errors.subtitle) && (
                                                <p className="text-red-400 text-xs mt-1">
                                                    {validationErrors.subtitle ||
                                                        errors.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="location"
                                            className="block text-sm font-medium text-gray-400 mb-1"
                                        >
                                            Location
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
                                                ({charCount}/5000)
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
                                                    min="0.01"
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
                                                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                                            htmlFor="discount_type"
                                            className="block text-sm font-medium text-gray-400 mb-1"
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
                                            className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                validationErrors.discount_type ||
                                                errors.discount_type
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        >
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor="start_date"
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                Start Date
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                                                    className={`w-full pl-10 p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        validationErrors.start_date ||
                                                        errors.start_date
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                />
                                            </div>
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
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                End Date
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                                                    className={`w-full pl-10 p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        validationErrors.end_date ||
                                                        errors.end_date
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                />
                                            </div>
                                            {(validationErrors.end_date ||
                                                errors.end_date) && (
                                                <p className="text-red-400 text-xs mt-1">
                                                    {validationErrors.end_date ||
                                                        errors.end_date}
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
                                            required
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
                                            Featured Package
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

                {showEditModal && selectedPackage && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        Edit Package
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            reset();
                                            setImagePreview(null);
                                            setSelectedPackage(null);
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

                                    <div>
                                        <label
                                            htmlFor="destination_id"
                                            className="block text-sm font-medium text-gray-400 mb-1"
                                        >
                                            Destination{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
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
                                            className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                validationErrors.destination_id ||
                                                errors.destination_id
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                            required
                                        >
                                            <option value="">
                                                Select Destination
                                            </option>
                                            {destinations.map((destination) => (
                                                <option
                                                    key={destination.id}
                                                    value={destination.id}
                                                >
                                                    {destination.name}
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
                                                htmlFor="subtitle"
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                Subtitle
                                            </label>
                                            <input
                                                type="text"
                                                id="subtitle"
                                                value={data.subtitle}
                                                onChange={(e) =>
                                                    setData(
                                                        "subtitle",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    validationErrors.subtitle ||
                                                    errors.subtitle
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                            />
                                            {(validationErrors.subtitle ||
                                                errors.subtitle) && (
                                                <p className="text-red-400 text-xs mt-1">
                                                    {validationErrors.subtitle ||
                                                        errors.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="location"
                                            className="block text-sm font-medium text-gray-400 mb-1"
                                        >
                                            Location
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
                                                ({charCount}/5000)
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
                                                    min="0.01"
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
                                                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                                            htmlFor="discount_type"
                                            className="block text-sm font-medium text-gray-400 mb-1"
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
                                            className={`w-full p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                validationErrors.discount_type ||
                                                errors.discount_type
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        >
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor="start_date"
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                Start Date
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                                                    className={`w-full pl-10 p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        validationErrors.start_date ||
                                                        errors.start_date
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                />
                                            </div>
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
                                                className="block text-sm font-medium text-gray-400 mb-1"
                                            >
                                                End Date
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                                                    className={`w-full pl-10 p-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        validationErrors.end_date ||
                                                        errors.end_date
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                />
                                            </div>
                                            {(validationErrors.end_date ||
                                                errors.end_date) && (
                                                <p className="text-red-400 text-xs mt-1">
                                                    {validationErrors.end_date ||
                                                        errors.end_date}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="image"
                                            className="block text-sm font-medium text-gray-400 mb-1"
                                        >
                                            Image
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
                                            Featured Package
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditModal(false);
                                                reset();
                                                setImagePreview(null);
                                                setSelectedPackage(null);
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

                {showDeleteModal && packageToDelete && (
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
                                            setPackageToDelete(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-300"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <p className="text-gray-300 mb-6">
                                    Are you sure you want to delete the package
                                    "
                                    <span className="font-semibold">
                                        {packageToDelete.title}
                                    </span>
                                    "? This action cannot be undone.
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setPackageToDelete(null);
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
