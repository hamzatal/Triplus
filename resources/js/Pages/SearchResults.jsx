import React from "react";
import { Head, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Home, MapPin, Calendar, Star } from "lucide-react";

export default function SearchResults({ results = [], query = "" }) {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "N/A";
        }
    };

    const calculateDiscount = (original, discounted) => {
        if (!discounted || isNaN(original) || isNaN(discounted)) return 0;
        const percentage = Math.round(
            ((original - discounted) / original) * 100
        );
        return percentage;
    };

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

    const getItemUrl = (item) => {
        switch (item.type) {
            case "destination":
                return `/destinations/${item.id}`;
            case "package":
                return `/packages/${item.id}`;
            case "offer":
                return `/offers/${item.id}`;
            default:
                return "#";
        }
    };

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case "destination":
                return "bg-blue-600";
            case "package":
                return "bg-green-600";
            case "offer":
                return "bg-purple-600";
            default:
                return "bg-blue-600";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white transition-all duration-300 relative">
            <Head title={`Search Results for "${query}" - Triplus`} />

            <Link
                href="/home"
                className="fixed top-6 left-6 z-50 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all"
            >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
            </Link>

            <div className="relative h-64 md:h-72 overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 opacity-80"></div>
                <div className="absolute inset-0 bg-[url('/images/world.svg')] bg-no-repeat bg-center opacity-30 bg-fill"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="text-4xl md:text-6xl font-extrabold mb-2 leading-tight"
                        >
                            Search Results for{" "}
                            <span className="text-green-400">
                                "{query || "All"}"
                            </span>
                        </motion.h1>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                        >
                            <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    variants={fadeIn}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
                >
                    {results.length === 0 ? (
                        <div className="col-span-full text-center text-gray-400 py-8">
                            No results found for "{query}". Try a different
                            search term.
                        </div>
                    ) : (
                        results.map((item) => (
                            <motion.div
                                key={`${item.type}-${item.id}`}
                                whileHover={{
                                    y: -10,
                                    transition: { duration: 0.3 },
                                }}
                                className="bg-gray-800 bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-sm border border-gray-700 flex flex-col"
                            >
                                <div className="relative mb-4">
                                    <img
                                        src={
                                            item.image ||
                                            "https://via.placeholder.com/640x480"
                                        }
                                        alt={item.title}
                                        className="w-full h-48 object-cover rounded-t-xl"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src =
                                                "https://via.placeholder.com/640x480";
                                        }}
                                    />
                                    <div className="absolute top-2 left-2 flex gap-2">
                                        <span
                                            className={`px-2 py-1 ${getTypeBadgeClass(
                                                item.type
                                            )} rounded-full text-xs font-medium text-white`}
                                        >
                                            {item.type.charAt(0).toUpperCase() +
                                                item.type.slice(1)}
                                        </span>
                                        {item.category && (
                                            <span className="px-2 py-1 bg-gray-700 bg-opacity-80 rounded-full text-xs font-medium text-white">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>
                                    {calculateDiscount(
                                        item.price,
                                        item.discount_price
                                    ) > 0 && (
                                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                            {calculateDiscount(
                                                item.price,
                                                item.discount_price
                                            )}
                                            % OFF
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold mb-2 text-white">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-300 text-sm">
                                            {item.location ||
                                                "Unknown Location"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 mb-3">
                                        {renderStars(item.rating || 0)}
                                        <span className="text-gray-400 text-sm ml-2">
                                            ({item.rating || 0}/5)
                                        </span>
                                    </div>
                                    <p className="text-gray-300 mb-4 line-clamp-3">
                                        {item.description ||
                                            "No description available."}
                                    </p>
                                    {(item.type === "package" ||
                                        item.type === "offer") &&
                                        (item.start_date || item.end_date) && (
                                            <div className="flex items-center gap-2 mb-4 text-sm text-gray-300">
                                                <Calendar
                                                    size={14}
                                                    className="text-gray-400"
                                                />
                                                <span>
                                                    {formatDate(
                                                        item.start_date
                                                    )}{" "}
                                                    -{" "}
                                                    {formatDate(item.end_date)}
                                                </span>
                                            </div>
                                        )}
                                    <div className="mt-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <span className="block text-gray-400 text-sm">
                                                    {item.type === "destination"
                                                        ? "Starting from"
                                                        : "Price"}
                                                </span>
                                                <div className="flex items-baseline gap-2">
                                                    {item.discount_price ? (
                                                        <>
                                                            <span className="text-lg font-bold text-green-400">
                                                                $
                                                                {parseFloat(
                                                                    item.discount_price
                                                                ).toFixed(2)}
                                                            </span>
                                                            <span className="text-sm line-through text-gray-500">
                                                                $
                                                                {parseFloat(
                                                                    item.price
                                                                ).toFixed(2)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-lg font-bold text-green-400">
                                                            $
                                                            {parseFloat(
                                                                item.price
                                                            ).toFixed(2)}
                                                        </span>
                                                    )}
                                                    {item.type ===
                                                        "destination" && (
                                                        <span className="text-xs text-gray-400">
                                                            / night
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={getItemUrl(item)}
                                            className="w-full inline-block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    );
}
