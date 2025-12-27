import React, { useState, useEffect } from "react";
import { Head, usePage, useForm } from "@inertiajs/react";
import {
    Search,
    Trash2,
    Plus,
    Edit2,
    Image,
    X,
    ToggleLeft,
    ToggleRight,
    AlertTriangle,
} from "lucide-react";
import AdminSidebar from "@/Components/AdminSidebar";
import toast, { Toaster } from "react-hot-toast";

export default function HeroSectionsView() {
    const { props } = usePage();
    const { heroSections = [], flash = {} } = props;

    // State for UI controls
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Form state for add/edit
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
        title: "",
        subtitle: "",
        image: null,
    });

    // Helper: Reset form and UI state
    const resetForm = () => {
        reset();
        setImagePreview(null);
        setValidationErrors({});
    };

    // Form validation
    const validateForm = (isAdd = false) => {
        const errors = {};
        if (isAdd && !data.title) {
            errors.title = "Title is required.";
        } else if (
            data.title &&
            (data.title.length < 3 || data.title.length > 255)
        ) {
            errors.title = "Title must be between 3 and 255 characters.";
        }

        if (isAdd && !data.subtitle) {
            errors.subtitle = "Subtitle is required.";
        } else if (
            data.subtitle &&
            (data.subtitle.length < 3 || data.subtitle.length > 255)
        ) {
            errors.subtitle = "Subtitle must be between 3 and 255 characters.";
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
            if (!validTypes.includes(data.image.type)) {
                errors.image = "Image must be a JPEG, PNG, JPG, or GIF.";
            }
            if (data.image.size > 2 * 1024 * 1024) {
                errors.image = "Image size must be less than 2MB.";
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle image selection and preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData("image", file);
        setImagePreview(file ? URL.createObjectURL(file) : null);
    };

    // Remove selected image
    const removeImage = () => {
        setData("image", null);
        setImagePreview(null);
    };

    // Filter hero sections for search
    const filteredHeroSections = heroSections.filter(
        (section) =>
            section.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            section.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Add hero section
    const handleAdd = (e) => {
        e.preventDefault();
        if (!validateForm(true)) {
            toast.error("Please fix the form errors.");
            return;
        }
        post("/admin/hero", {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setShowAddModal(false);
                resetForm();
            },
            onError: (err) => {
                console.error("Add errors:", err);
                setValidationErrors(err);
                toast.error("Failed to create hero section.");
            },
        });
    };

    // Edit hero section
    const handleEdit = (e) => {
        e.preventDefault();
        if (!validateForm(false)) {
            toast.error("Please fix the form errors.");
            return;
        }

        // Debug: Log FormData contents
        const formData = new FormData();
        formData.append("title", data.title || "");
        formData.append("subtitle", data.subtitle || "");
        if (data.image instanceof File) {
            formData.append("image", data.image);
            console.log("Image details:", {
                name: data.image.name,
                size: data.image.size,
                type: data.image.type,
            });
        }
        console.log("Sending FormData:", Object.fromEntries(formData));

        post(`/admin/hero/${selectedSection.id}`, {
            preserveScroll: true,
            forceFormData: true,
            data: formData,
            onSuccess: (page) => {
                console.log("Edit success, response:", page);
                setShowEditModal(false);
                resetForm();
                setSelectedSection(null);
            },
            onError: (err) => {
                console.error("Edit errors:", err);
                setValidationErrors(err);
                toast.error(
                    "Failed to update hero section: " +
                        (err.title ||
                            err.subtitle ||
                            err.image ||
                            "Unknown error")
                );
            },
        });
    };

    // Open edit modal
    const openEditModal = (section) => {
        setSelectedSection(section);
        setData({
            title: section.title || "",
            subtitle: section.subtitle || "",
            image: null,
        });
        setImagePreview(section.image ? `/storage/${section.image}` : null);
        setValidationErrors({});
        setShowEditModal(true);
    };

    // Delete hero section
    const handleDelete = () => {
        deleteForm(`/admin/hero/${selectedSection.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedSection(null);
            },
            onError: (err) => {
                console.error("Delete errors:", err);
                toast.error("Failed to delete hero section.");
            },
        });
    };

    // Open delete modal
    const openDeleteModal = (section) => {
        setSelectedSection(section);
        setShowDeleteModal(true);
    };

    // Toggle active status
    const handleToggleActive = (id) => {
        patch(`/admin/hero/${id}/toggle`, {
            preserveScroll: true,
            onSuccess: () => {},
            onError: (err) => {
                console.error("Toggle errors:", err);
                toast.error("Failed to update active status.");
            },
        });
    };

    // Handle flash messages with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (flash.success) {
                console.log("Flash success:", flash.success);
                toast.success(flash.success);
            }
            if (flash.error) {
                console.log("Flash error:", flash.error);
                toast.error(flash.error);
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [flash.success, flash.error]);

    // Clean up image preview
    useEffect(() => {
        return () => {
            if (imagePreview && !imagePreview.startsWith("/storage")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <Head title="Hero Sections - Triplus Admin" />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <div className="lg:ml-64 p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-2xl font-bold text-white">
                        Hero Sections
                    </h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search hero sections..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        </div>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowAddModal(true);
                            }}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Hero Section
                        </button>
                    </div>
                </div>

                {/* Hero Sections Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHeroSections.length > 0 ? (
                        filteredHeroSections.map((section) => (
                            <div
                                key={section.id}
                                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {section.image ? (
                                    <img
                                        src={`/storage/${section.image}`}
                                        alt={section.title}
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
                                            {section.title || "N/A"}
                                        </h3>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(section)
                                                }
                                                className="text-blue-400 hover:text-blue-300"
                                                disabled={processing}
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    openDeleteModal(section)
                                                }
                                                className="text-red-400 hover:text-red-300"
                                                disabled={processing}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleToggleActive(
                                                        section.id
                                                    )
                                                }
                                                className={
                                                    section.is_active
                                                        ? "text-green-400 hover:text-green-300"
                                                        : "text-gray-400 hover:text-gray-300"
                                                }
                                                disabled={processing}
                                                title={
                                                    section.is_active
                                                        ? "Deactivate"
                                                        : "Activate"
                                                }
                                            >
                                                {section.is_active ? (
                                                    <ToggleRight className="w-5 h-5" />
                                                ) : (
                                                    <ToggleLeft className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-2">
                                        {section.subtitle || "N/A"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        ID: {section.id} | Status:{" "}
                                        {section.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-400 py-8">
                            No hero sections found
                        </div>
                    )}
                </div>

                {/* Add Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg max-w-lg w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        Add Hero Section
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowAddModal(false);
                                            resetForm();
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
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
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
                                                setData("title", e.target.value)
                                            }
                                            className="w-full p-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Subtitle{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
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
                                            className="w-full p-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {(validationErrors.subtitle ||
                                            errors.subtitle) && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {validationErrors.subtitle ||
                                                    errors.subtitle}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
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
                                            className="w-full p-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg"
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
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddModal(false);
                                                resetForm();
                                            }}
                                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showEditModal && selectedSection && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg max-w-lg w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        Edit Hero Section
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            resetForm();
                                            setSelectedSection(null);
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
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            id="edit-title"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData("title", e.target.value)
                                            }
                                            className="w-full p-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Subtitle
                                        </label>
                                        <input
                                            type="text"
                                            id="edit-subtitle"
                                            value={data.subtitle}
                                            onChange={(e) =>
                                                setData(
                                                    "subtitle",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full p-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {(validationErrors.subtitle ||
                                            errors.subtitle) && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {validationErrors.subtitle ||
                                                    errors.subtitle}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Image
                                        </label>
                                        <input
                                            type="file"
                                            id="edit-image"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full p-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg"
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
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditModal(false);
                                                resetForm();
                                                setSelectedSection(null);
                                            }}
                                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && selectedSection && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center mb-4 text-red-500">
                                    <AlertTriangle className="w-6 h-6 mr-2 flex-shrink-0" />
                                    <h3 className="text-lg font-semibold text-white">
                                        Confirm Deletion
                                    </h3>
                                </div>
                                <p className="text-gray-300 mb-6">
                                    Are you sure you want to delete the hero
                                    section "{selectedSection.title}"? This
                                    action cannot be undone.
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={processing}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
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
