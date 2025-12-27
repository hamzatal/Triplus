import React from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Grid,
    Users,
    MessageSquare,
    MapPin,
    Tag,
    Image,
    LogOut,
    Home,
    Package2Icon,
    Building2,
} from "lucide-react";

export default function AdminSidebar() {
    const { props } = usePage();
    const admin = props.auth?.admin || {};
    const adminName = admin?.name || "Admin";
    const adminInitial = adminName.charAt(0).toUpperCase();
    const adminAvatar = admin?.avatar
        ? `/storage/avatars/${admin.avatar}`
        : null;

    return (
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 shadow-lg z-10">
            <style>
                {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1f2937;
            border-radius: 4px;
            margin: 4px 0;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 4px;
            transition: background 0.2s;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #60a5fa;
          }
       
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #3b82f6 #1f2937;
          }
        `}
            </style>
            <div className="flex flex-col h-full">
                <div className="p-5 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-blue-400">
                        Triplus
                    </h2>
                    <p className="text-sm text-gray-400">Admin Portal</p>
                </div>
                <div className="p-5 flex-grow overflow-auto custom-scrollbar">
                    <nav className="space-y-1">
                        <SidebarLink
                            href="/admin/dashboard"
                            label="Dashboard"
                            icon={<Grid className="w-5 h-5 text-blue-400" />}
                        />
                        <SidebarLink
                            href="/admin/company-info"
                            label="Company Info"
                            icon={
                                <Building2 className="w-5 h-5 text-red-400" />
                            }
                        />
                        <SidebarLink
                            href="/admin/hero"
                            label="Hero Sections"
                            icon={<Image className="w-5 h-5 text-indigo-400" />}
                        />
                        <SidebarLink
                            href="/admin/users"
                            label="Users"
                            icon={<Users className="w-5 h-5 text-green-400" />}
                        />
                        <SidebarLink
                            href="/admin/messages"
                            label="Messages"
                            icon={
                                <MessageSquare className="w-5 h-5 text-yellow-400" />
                            }
                        />
                        <SidebarLink
                            href="/admin/packages"
                            label="Packages"
                            icon={
                                <Package2Icon className="w-5 h-5 text-brown-400" />
                            }
                        />
                        <SidebarLink
                            href="/admin/destinations"
                            label="Destinations"
                            icon={
                                <MapPin className="w-5 h-5 text-purple-400" />
                            }
                        />
                        <SidebarLink
                            href="/admin/offers"
                            label="Offers"
                            icon={<Tag className="w-5 h-5 text-pink-400" />}
                        />
                    </nav>
                </div>
                <div className="p-5 border-t border-gray-800">
                    {/* Home link */}
                    <SidebarLink
                        href="/home"
                        label="Home"
                        icon={<Home className="w-5 h-5 text-blue-400" />}
                    />
                    {/* Logout link */}
                    <Link
                        href={route("admin.logout")}
                        method="post"
                        as="button"
                        className="flex items-center w-full space-x-3 text-gray-300 p-2 rounded-lg hover:bg-gray-800 mt-3"
                    >
                        <LogOut className="w-5 h-5 text-red-400" />
                        <span>Log Out</span>
                    </Link>
                    {/* Divider */}
                    <div className="border-t border-gray-800 my-4"></div>
                    {/* Admin info (clickable to profile) */}
                    <Link
                        href="/admin/profile"
                        className="flex items-center space-x-3 hover:bg-gray-800 p-2 rounded-lg"
                    >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                            {adminAvatar ? (
                                <img
                                    src={adminAvatar}
                                    alt={adminName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="bg-blue-500 w-full h-full flex items-center justify-center text-white font-medium">
                                    {adminInitial}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-gray-200">
                                {adminName}
                            </p>
                            <p className="text-xs text-gray-400">
                                Administrator
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function SidebarLink({ href, label, icon }) {
    const isActive = window.location.pathname === href;

    return (
        <Link
            href={href}
            className={`flex items-center space-x-3 text-gray-300 p-2 rounded-lg hover:bg-gray-800 ${
                isActive ? "bg-gray-800" : ""
            }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
