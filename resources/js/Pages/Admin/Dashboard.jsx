import React from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import {
    Users,
    MessageSquare,
    MapPin,
    Tag,
    Image,
    Grid,
    AlertCircle,
    Eye,
    PinIcon,
} from "lucide-react";
import AdminSidebar from "@/Components/AdminSidebar";

export default function Dashboard() {
    const { props } = usePage();

    // Safely extract data with fallbacks
    const admin = props.admin || props.auth?.user || {};
    const stats = props.stats || {
        users: 0,
        messages: 0,
        unread_messages: 0,
        destinations: 0,
        offers: 0,
        hero_sections: 0,
        companies: 0,
        active_companies: 0,
        deactivated_companies: 0,
    };
    const latest_users = props.latest_users || [];
    const latest_messages = props.latest_messages || [];

    // Safe access to user name with fallback
    const adminName = admin?.name || "Admin";
    const adminInitial = adminName.charAt(0).toUpperCase() || "A";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <Head title="Admin Dashboard - Triplus" />

            {/* Main Content */}
            <div className="ml-64 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-5">
                    {/* Users Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-200">Total Users</p>
                                <h3 className="text-3xl font-bold mt-1">
                                    {stats.users}
                                </h3>
                            </div>
                            <div className="bg-blue-500/30 p-3 rounded-lg">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-blue-200 text-sm">
                            <Grid className="w-4 h-4 mr-1" />
                            <span>
                                Deactivated: {stats.deactivated_users || 0}
                            </span>
                        </div>
                    </div>

                    {/* Destinations Card */}
                    <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-purple-200">Destinations</p>
                                <h3 className="text-3xl font-bold mt-1">
                                    {stats.destinations}
                                </h3>
                            </div>
                            <div className="bg-purple-500/30 p-3 rounded-lg">
                                <MapPin className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-purple-200 text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>
                                {stats.destinations} destinations listed
                            </span>
                        </div>
                    </div>

                    {/* Messages Card */}
                    <div className="bg-gradient-to-br from-yellow-600 to-amber-700 rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-yellow-200">Messages</p>
                                <h3 className="text-3xl font-bold mt-1">
                                    {stats.messages}
                                </h3>
                            </div>
                            <div className="bg-yellow-500/30 p-3 rounded-lg">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-yellow-200 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <span>{stats.unread_messages} unread messages</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Companies Card */}
                    <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-green-200">
                                    Total Companies
                                </p>
                                <h3 className="text-3xl font-bold mt-1">
                                    {stats.companies}
                                </h3>
                            </div>
                            <div className="bg-green-500/30 p-3 rounded-lg">
                                <PinIcon className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-green-200 text-sm">
                            <Grid className="w-4 h-4 mr-1" />
                            <span>
                                Active: {stats.active_companies} | Deactivated:{" "}
                                {stats.deactivated_companies}
                            </span>
                        </div>
                    </div>
                    {/* Special Offers Card */}
                    <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-pink-200">Special Offers</p>
                                <h3 className="text-3xl font-bold mt-1">
                                    {stats.offers}
                                </h3>
                            </div>
                            <div className="bg-pink-500/30 p-3 rounded-lg">
                                <Tag className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-pink-200 text-sm">
                            <Tag className="w-4 h-4 mr-1" />
                            <span>Active discounts available</span>
                        </div>
                    </div>

                    {/* Hero Sections Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-indigo-200">Hero Sections</p>
                                <h3 className="text-3xl font-bold mt-1">
                                    {stats.hero_sections}
                                </h3>
                            </div>
                            <div className="bg-indigo-500/30 p-3 rounded-lg">
                                <Image className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-indigo-200 text-sm">
                            <Eye className="w-4 h-4 mr-1" />
                            <span>Hero sections available</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Latest Users */}
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Latest Users</h3>
                            <Link
                                href="/admin/users"
                                className="text-blue-400 text-sm hover:underline"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-700">
                            {latest_users.length > 0 ? (
                                latest_users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="p-4 flex items-center"
                                    >
                                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                                            {(user.name || "?")
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-medium">
                                                {user.name || "Unknown User"}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {user.email || "No email"}
                                            </p>
                                        </div>
                                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                            {user.created_at
                                                ? new Date(
                                                      user.created_at
                                                  ).toLocaleDateString()
                                                : "Unknown date"}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-400">
                                    No users found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Latest Messages */}
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                                Latest Messages
                            </h3>
                            <Link
                                href="/admin/messages"
                                className="text-blue-400 text-sm hover:underline"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-700">
                            {latest_messages.length > 0 ? (
                                latest_messages.map((message) => (
                                    <div key={message.id} className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center">
                                                <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                                                    {(message.name || "?")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {message.name ||
                                                            "Unknown Sender"}
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        {message.email ||
                                                            "No email"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                {!message.is_read && (
                                                    <span className="bg-red-500 w-2 h-2 rounded-full mr-2"></span>
                                                )}
                                                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                                    {message.created_at
                                                        ? new Date(
                                                              message.created_at
                                                          ).toLocaleDateString()
                                                        : "Unknown date"}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-300 truncate">
                                            {message.message ||
                                                "No message content"}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-400">
                                    No messages found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <AdminSidebar />
        </div>
    );
}
