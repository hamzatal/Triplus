import React, { useState, useEffect } from "react";
import { Head, usePage, Link, useForm, router } from "@inertiajs/react";
import {
    Users,
    MessageSquare,
    MapPin,
    Tag,
    Image,
    LogOut,
    Grid,
    Shield,
    Eye,
    Download,
    Trash2,
    Edit,
    Search,
    CheckCircle,
    XCircle,
} from "lucide-react";
import AdminSidebar from "@/Components/AdminSidebar";

export default function AdminUsers({ users }) {
    const { props } = usePage();

    // Safely extract data with fallbacks
    const admin = props.admin || props.auth?.user || {};
    const flash = props.flash || {};

    // State for search and filter
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // Set up form for status toggle
    const toggleForm = useForm({});

    // Function to toggle user status
    const toggleUserStatus = (userId) => {
        toggleForm.post(`/admin/users/${userId}/toggle-status`, {
            preserveScroll: true,
            onSuccess: () => {
                // Success is handled by flash messages
            },
        });
    };

    // Handle search and filter changes
    useEffect(() => {
        // Debounce the search/filter request to avoid excessive calls
        const timer = setTimeout(() => {
            router.get(
                "/admin/users",
                { search: searchQuery, status: filterStatus },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, filterStatus]);

    // Safe access to user name with fallback
    const adminName = admin?.name || "Admin";
    const adminInitial = adminName.charAt(0).toUpperCase() || "A";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <Head title="User Management - Triplus Admin" />

            {/* Main Content */}
            <div className="ml-64 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">User Management</h1>
                </div>

                {/* Flash Messages */}
                {flash.success && (
                    <div className="bg-green-600/20 border border-green-500 text-green-200 px-4 py-3 rounded mb-6 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {flash.success}
                    </div>
                )}

                {flash.error && (
                    <div className="bg-red-600/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6 flex items-center">
                        <XCircle className="w-5 h-5 mr-2" />
                        {flash.error}
                    </div>
                )}

                {/* Search and Filter Bar */}
                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Users</option>
                            <option value="active">Active Users</option>
                            <option value="inactive">Inactive Users</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-900">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                                >
                                    User
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                                >
                                    Email
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                                >
                                    Joined Date
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                                >
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="bg-gradient-to-br from-blue-500 to-blue-700 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                                                    {(user.name || "?")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {user.name ||
                                                            "Unknown User"}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        ID: {user.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.email || "No email"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {user.created_at
                                                ? new Date(
                                                      user.created_at
                                                  ).toLocaleDateString()
                                                : "Unknown date"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.is_active ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() =>
                                                        toggleUserStatus(
                                                            user.id
                                                        )
                                                    }
                                                    className={`px-3 py-1 rounded-full inline-flex items-center ${
                                                        user.is_active
                                                            ? user.id ===
                                                              admin.id
                                                                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                                                                : "bg-red-100 text-red-800 hover:bg-red-200"
                                                            : "bg-green-100 text-green-800 hover:bg-green-200"
                                                    }`}
                                                    disabled={
                                                        user.id === admin.id ||
                                                        toggleForm.processing
                                                    }
                                                    title={
                                                        user.id === admin.id
                                                            ? "Cannot deactivate your own account"
                                                            : ""
                                                    }
                                                >
                                                    {user.is_active ? (
                                                        <>
                                                            <XCircle className="w-4 h-4 mr-1" />
                                                            <span className="text-xs font-semibold">
                                                                Deactivate
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            <span className="text-xs font-semibold">
                                                                Activate
                                                            </span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-4 text-center text-gray-400"
                                    >
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.links && users.links.length > 3 && (
                    <div className="flex justify-between items-center mt-6 bg-gray-800 rounded-lg px-4 py-3">
                        <div className="text-sm text-gray-400">
                            Showing{" "}
                            <span className="font-medium">
                                {users.from || 0}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">{users.to || 0}</span>{" "}
                            of{" "}
                            <span className="font-medium">
                                {users.total || 0}
                            </span>{" "}
                            results
                        </div>
                        <div className="flex space-x-1">
                            {users.links.map((link, i) => {
                                // Skip prev/next links if they're disabled
                                if (
                                    (i === 0 && link.url === null) ||
                                    (i === users.links.length - 1 &&
                                        link.url === null)
                                ) {
                                    return null;
                                }

                                return (
                                    <Link
                                        key={i}
                                        href={link.url || "#"}
                                        className={`px-3 py-1 rounded ${
                                            link.active
                                                ? "bg-blue-600 text-white"
                                                : link.url === null
                                                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                                : "bg-gray-700 text-white hover:bg-gray-600"
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                <AdminSidebar />
            </div>
        </div>
    );
}
