import React, { useState } from "react";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import { Search, X, Send, CheckCircle, XCircle, Check } from "lucide-react";
import AdminSidebar from "@/Components/AdminSidebar";

export default function ContactsView() {
    const { props } = usePage();
    const {
        messages = { data: [], current_page: 1, last_page: 1 },
        flash = {},
        admin = props.auth?.user || {},
    } = props;

    // Debug: Log the messages value to inspect its type and content
    console.log("Messages value:", messages, "Type:", typeof messages);

    // State for search and reply modal
    const [searchQuery, setSearchQuery] = useState("");
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");

    // Form for delete, reply, and mark as read actions
    const {
        delete: deleteForm,
        post: postForm,
        patch: patchForm,
        processing,
    } = useForm({});

    // Ensure messages.data is an array before filtering
    const filteredMessages = Array.isArray(messages.data)
        ? messages.data.filter(
              (message) =>
                  message.name
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                  message.email
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                  message.subject
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase())
          )
        : [];

    // Handle delete contact
    const handleDeleteContact = (id) => {
        if (confirm("Are you sure you want to delete this message?")) {
            deleteForm(`/admin/messages/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowReplyModal(false);
                    setSelectedContact(null);
                },
            });
        }
    };

    // Handle mark as read
    const handleMarkAsRead = (id) => {
        patchForm(`/admin/messages/${id}/read`, {
            preserveScroll: true,
            onSuccess: () => {},
        });
    };

    // Handle reply submission
    const handleReply = (e) => {
        e.preventDefault();
        postForm(
            `/admin/messages/${selectedContact.id}/reply`,
            {
                message: replyMessage,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowReplyModal(false);
                    setSelectedContact(null);
                    setReplyMessage("");
                },
            }
        );
    };

    // Handle pagination
    const handlePageChange = (page) => {
        router.get(
            `/admin/messages?page=${page}`,
            { search: searchQuery },
            { preserveState: true, preserveScroll: true }
        );
    };

    // Admin name and initial
    const adminName = admin?.name || "Admin";
    const adminInitial = adminName.charAt(0).toUpperCase() || "A";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <Head title="Messages - Triplus Admin" />

            <div className="ml-64 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Messages</h1>
                    <div className="flex space-x-2"></div>
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

                <div className="bg-gray-800 rounded-lg shadow">
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-white">
                                Contact Messages
                            </h2>
                            <div className="relative w-64">
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Message
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredMessages.length > 0 ? (
                                        filteredMessages.map((message) => (
                                            <tr
                                                key={message.id}
                                                className={
                                                    message.is_read
                                                        ? "bg-gray-750"
                                                        : "bg-gray-800"
                                                }
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-white">
                                                        {message.name ||
                                                            "Unknown"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-400">
                                                        {message.email ||
                                                            "No email"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-400">
                                                        {message.subject ||
                                                            "No subject"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-400 line-clamp-2">
                                                        {message.message ||
                                                            "No message"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-400">
                                                        {message.is_read ? (
                                                            <span className="text-green-400 flex items-center">
                                                                <CheckCircle className="w-4 h-4 mr-1" />{" "}
                                                                Read
                                                            </span>
                                                        ) : (
                                                            <span className="text-yellow-400">
                                                                Unread
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {!message.is_read && (
                                                        <button
                                                            onClick={() =>
                                                                handleMarkAsRead(
                                                                    message.id
                                                                )
                                                            }
                                                            className="text-green-400 hover:text-green-300 mr-4"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            Mark as Read
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-6 py-4 text-center text-gray-400"
                                            >
                                                No messages found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        <div className="mt-4 flex justify-between items-center">
                            <div className="text-sm text-gray-400">
                                Showing {messages.from || 0} to{" "}
                                {messages.to || 0} of {messages.total || 0}{" "}
                                messages
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() =>
                                        handlePageChange(
                                            messages.current_page - 1
                                        )
                                    }
                                    disabled={messages.current_page === 1}
                                    className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() =>
                                        handlePageChange(
                                            messages.current_page + 1
                                        )
                                    }
                                    disabled={
                                        messages.current_page ===
                                        messages.last_page
                                    }
                                    className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AdminSidebar />
        </div>
    );
}
