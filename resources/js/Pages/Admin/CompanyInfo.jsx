import React, { useState, useEffect } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import {
    Building2,
    MapPin,
    Tag,
    Package2Icon,
    Eye,
    EyeOff,
    Trash2,
    AlertCircle,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Search,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AdminSidebar from "@/Components/AdminSidebar";

const CompanyInfo = ({ companies }) => {
    const { flash } = usePage().props;
    const [notification, setNotification] = useState(
        flash.success || flash.error || null
    );
    const [expandedCompanies, setExpandedCompanies] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Auto-dismiss notification after 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Toggle company details
    const toggleCompanyDetails = (companyId) => {
        setExpandedCompanies((prev) => ({
            ...prev,
            [companyId]: !prev[companyId],
        }));
    };

    // Filter companies based on search term
    const filteredCompanies = companies.filter(
        (company) =>
            company.company_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            company.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

    // Handle pagination navigation
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleToggleActive = (companyId, isActive) => {
        router.post(
            route("admin.company-info.toggle-active", companyId),
            {},
            {
                onSuccess: () => {
                    setNotification({
                        type: "success",
                        message: `Company ${
                            isActive ? "deactivated" : "activated"
                        } successfully.`,
                    });
                },
                onError: () => {
                    setNotification({
                        type: "error",
                        message: "Failed to update company status.",
                    });
                },
            }
        );
    };

    const handleDelete = (companyId) => {
        if (confirm("Are you sure you want to delete this company?")) {
            router.delete(route("admin.company-info.destroy", companyId), {
                onSuccess: () => {
                    setNotification({
                        type: "success",
                        message: "Company deleted successfully.",
                    });
                },
                onError: () => {
                    setNotification({
                        type: "error",
                        message: "Failed to delete company.",
                    });
                },
            });
        }
    };

    const handleTogglePostActive = (companyId, postId, type, isActive) => {
        const routeName = `admin.company-info.${type}.toggle-active`;
        router.post(
            route(routeName, { companyId, id: postId }),
            {},
            {
                onSuccess: () => {
                    setNotification({
                        type: "success",
                        message: `${
                            type.charAt(0).toUpperCase() + type.slice(1)
                        } ${
                            isActive ? "deactivated" : "activated"
                        } successfully.`,
                    });
                },
                onError: () => {
                    setNotification({
                        type: "error",
                        message: `Failed to update ${type} status.`,
                    });
                },
            }
        );
    };

    const handleDeletePost = (companyId, postId, type) => {
        if (confirm(`Are you sure you want to delete this ${type}?`)) {
            const routeName = `admin.company-info.${type}.destroy`;
            router.delete(route(routeName, { companyId, id: postId }), {
                onSuccess: () => {
                    setNotification({
                        type: "success",
                        message: `${
                            type.charAt(0).toUpperCase() + type.slice(1)
                        } deleted successfully.`,
                    });
                },
                onError: () => {
                    setNotification({
                        type: "error",
                        message: `Failed to delete ${type}.`,
                    });
                },
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex">
            <Head title="Company Info - Triplus" />
            <AdminSidebar />

            <div className="flex-1 ml-64 p-8">
                {/* Notification */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center gap-2 ${
                                notification.type === "error"
                                    ? "bg-red-500"
                                    : "bg-green-500"
                            } text-white`}
                        >
                            {notification.type === "error" ? (
                                <AlertCircle className="w-5 h-5" />
                            ) : (
                                <CheckCircle className="w-5 h-5" />
                            )}
                            {notification.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                <h1 className="text-3xl font-bold text-white mb-6">
                    Company Info
                </h1>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            placeholder="Search by company name or email..."
                            className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-600 placeholder-gray-400"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {filteredCompanies.length === 0 ? (
                    <p className="text-gray-400">No companies found.</p>
                ) : (
                    <div className="space-y-6">
                        {paginatedCompanies.map((company) => (
                            <div
                                key={company.id}
                                className="bg-gray-800 rounded-lg p-6 shadow-lg"
                            >
                                {/* Company Header */}
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center space-x-3">
                                        <Building2 className="w-6 h-6 text-red-400" />
                                        <h2 className="text-xl font-semibold text-white">
                                            {company.company_name}
                                        </h2>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${
                                                company.is_active
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                            } text-white`}
                                        >
                                            {company.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </div>
                                    <div className="space-x-2">
                                        <button
                                            onClick={() =>
                                                toggleCompanyDetails(company.id)
                                            }
                                            className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                            title={
                                                expandedCompanies[company.id]
                                                    ? "Hide Details"
                                                    : "Show Details"
                                            }
                                        >
                                            {expandedCompanies[company.id] ? (
                                                <ChevronUp className="w-5 h-5" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleToggleActive(
                                                    company.id,
                                                    company.is_active
                                                )
                                            }
                                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            title={
                                                company.is_active
                                                    ? "Deactivate"
                                                    : "Activate"
                                            }
                                        >
                                            {company.is_active ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(company.id)
                                            }
                                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Company Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <p className="text-gray-300">
                                        <strong>Email:</strong> {company.email}
                                    </p>
                                    <p className="text-gray-300">
                                        <strong>License:</strong>{" "}
                                        {company.license_number}
                                    </p>
                                    <p className="text-gray-300">
                                        <strong>Registered:</strong>{" "}
                                        {new Date(
                                            company.created_at
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Company Posts */}
                                <AnimatePresence>
                                    {expandedCompanies[company.id] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: "auto",
                                                opacity: 1,
                                            }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            {/* Destinations */}
                                            <div>
                                                <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                                                    <MapPin className="w-5 h-5 text-purple-400 mr-2" />{" "}
                                                    Destinations
                                                </h3>
                                                {company.destinations.length ===
                                                0 ? (
                                                    <p className="text-gray-400">
                                                        No destinations posted.
                                                    </p>
                                                ) : (
                                                    <table className="w-full text-left text-gray-300">
                                                        <thead>
                                                            <tr className="border-b border-gray-700">
                                                                <th className="py-2">
                                                                    Title
                                                                </th>
                                                                <th className="py-2">
                                                                    Location
                                                                </th>
                                                                <th className="py-2">
                                                                    Category
                                                                </th>
                                                                <th className="py-2">
                                                                    Price
                                                                </th>
                                                                <th className="py-2">
                                                                    Status
                                                                </th>
                                                                <th className="py-2">
                                                                    Actions
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {company.destinations.map(
                                                                (
                                                                    destination
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            destination.id
                                                                        }
                                                                        className="border-b border-gray-700"
                                                                    >
                                                                        <td className="py-2">
                                                                            {
                                                                                destination.title
                                                                            }
                                                                        </td>
                                                                        <td className="py-2">
                                                                            {
                                                                                destination.location
                                                                            }
                                                                        </td>
                                                                        <td className="py-2">
                                                                            {
                                                                                destination.category
                                                                            }
                                                                        </td>
                                                                        <td className="py-2">
                                                                            $
                                                                            {
                                                                                destination.price
                                                                            }
                                                                        </td>
                                                                        <td className="py-2">
                                                                            <span
                                                                                className={`px-2 py-1 text-xs rounded-full ${
                                                                                    destination.is_active
                                                                                        ? "bg-green-500"
                                                                                        : "bg-red-500"
                                                                                } text-white`}
                                                                            >
                                                                                {destination.is_active
                                                                                    ? "Active"
                                                                                    : "Inactive"}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-2 space-x-2">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleTogglePostActive(
                                                                                        company.id,
                                                                                        destination.id,
                                                                                        "destination",
                                                                                        destination.is_active
                                                                                    )
                                                                                }
                                                                                className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                                            >
                                                                                {destination.is_active ? (
                                                                                    <EyeOff className="w-4 h-4" />
                                                                                ) : (
                                                                                    <Eye className="w-4 h-4" />
                                                                                )}
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleDeletePost(
                                                                                        company.id,
                                                                                        destination.id,
                                                                                        "destination"
                                                                                    )
                                                                                }
                                                                                className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>

                                            {/* Offers */}
                                            <div>
                                                <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                                                    <Tag className="w-5 h-5 text-pink-400 mr-2" />{" "}
                                                    Offers
                                                </h3>
                                                {company.offers.length === 0 ? (
                                                    <p className="text-gray-400">
                                                        No offers posted.
                                                    </p>
                                                ) : (
                                                    <table className="w-full text-left text-gray-300">
                                                        <thead>
                                                            <tr className="border-b border-gray-700">
                                                                <th className="py-2">
                                                                    Title
                                                                </th>
                                                                <th className="py-2">
                                                                    Location
                                                                </th>
                                                                <th className="py-2">
                                                                    Category
                                                                </th>
                                                                <th className="py-2">
                                                                    Price
                                                                </th>
                                                                <th className="py-2">
                                                                    Status
                                                                </th>
                                                                <th className="py-2">
                                                                    Actions
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {company.offers.map(
                                                                (offer) => (
                                                                    <tr
                                                                        key={
                                                                            offer.id
                                                                        }
                                                                        className="border-b border-gray-700"
                                                                    >
                                                                        <td className="py-2">
                                                                            {
                                                                                offer.title
                                                                            }
                                                                        </td>
                                                                        <td className="py-2">
                                                                            {
                                                                                offer.location
                                                                            }
                                                                        </td>
                                                                        <td className="py-2">
                                                                            {
                                                                                offer.category
                                                                            }
                                                                        </td>
                                                                        <td className="py-2">
                                                                            $
                                                                            {
                                                                                offer.price
                                                                            }
                                                                        </td>
                                                                        <td className="py-2">
                                                                            <span
                                                                                className={`px-2 py-1 text-xs rounded-full ${
                                                                                    offer.is_active
                                                                                        ? "bg-green-500"
                                                                                        : "bg-red-500"
                                                                                } text-white`}
                                                                            >
                                                                                {offer.is_active
                                                                                    ? "Active"
                                                                                    : "Inactive"}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-2 space-x-2">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleTogglePostActive(
                                                                                        company.id,
                                                                                        offer.id,
                                                                                        "offer",
                                                                                        offer.is_active
                                                                                    )
                                                                                }
                                                                                className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                                            >
                                                                                {offer.is_active ? (
                                                                                    <EyeOff className="w-4 h-4" />
                                                                                ) : (
                                                                                    <Eye className="w-4 h-4" />
                                                                                )}
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleDeletePost(
                                                                                        company.id,
                                                                                        offer.id,
                                                                                        "offer"
                                                                                    )
                                                                                }
                                                                                className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>

                                            {/* Packages */}
                                            <div>
                                                <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                                                    <Package2Icon className="w-5 h-5 text-brown-400 mr-2" />{" "}
                                                    Packages
                                                </h3>
                                                {company.packages.length ===
                                                0 ? (
                                                    <p className="text-gray-400">
                                                        No packages posted.
                                                    </p>
                                                ) : (
                                                    <table className="w-full text-left text-gray-300">
                                                        <thead>
                                                            <tr className="border-b border-gray-700">
                                                                <th className="py-2">
                                                                    Title
                                                                </th>
                                                                <th className="py-2">
                                                                    Location
                                                                </th>
                                                                <th className="py-2">
                                                                    Category
                                                                </th>
                                                                <th className="py-2">
                                                                    Price
                                                                </th>
                                                                <th className="py-2">
                                                                    Status
                                                                </th>
                                                                <th className="py-2">
                                                                    Actions
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {company.packages.map(
                                                                (
                                                                    packageItem
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            packageItem.id
                                                                        }
                                                                        className="border-b border-gray-700"
                                                                    >
                                                                        <td className="py-2">
                                                                            {
                                                                                packageItem.title
                                                                            }
                                                                        </td>
                                                                        <td className="py-2">
                                                                            {
                                                                                packageItem.location
                                                                            }
                                                                        </td>
                                                                        <td className="py-2">
                                                                            {
                                                                                packageItem.category
                                                                            }
                                                                        </td>
                                                                        <td className="py-2">
                                                                            $
                                                                            {
                                                                                packageItem.price
                                                                            }
                                                                        </td>
                                                                        <td className="py-2">
                                                                            <span
                                                                                className={`px-2 py-1 text-xs rounded-full ${
                                                                                    packageItem.is_active
                                                                                        ? "bg-green-500"
                                                                                        : "bg-red-500"
                                                                                } text-white`}
                                                                            >
                                                                                {packageItem.is_active
                                                                                    ? "Active"
                                                                                    : "Inactive"}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-2 space-x-2">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleTogglePostActive(
                                                                                        company.id,
                                                                                        packageItem.id,
                                                                                        "package",
                                                                                        packageItem.is_active
                                                                                    )
                                                                                }
                                                                                className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                                            >
                                                                                {packageItem.is_active ? (
                                                                                    <EyeOff className="w-4 h-4" />
                                                                                ) : (
                                                                                    <Eye className="w-4 h-4" />
                                                                                )}
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleDeletePost(
                                                                                        company.id,
                                                                                        packageItem.id,
                                                                                        "package"
                                                                                    )
                                                                                }
                                                                                className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center items-center space-x-2">
                        <button
                            onClick={() => goToPage(1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-lg text-white ${
                                currentPage === 1
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            First
                        </button>
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-lg text-white ${
                                currentPage === 1
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            Previous
                        </button>
                        <span className="text-gray-300">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-lg text-white ${
                                currentPage === totalPages
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            Next
                        </button>
                        <button
                            onClick={() => goToPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-lg text-white ${
                                currentPage === totalPages
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            Last
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyInfo;
