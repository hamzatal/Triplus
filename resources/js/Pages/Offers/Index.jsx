import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Filter,
    Tags,
    Star,
    Heart,
    Clock,
    Zap,
    Flame,
    TrendingUp,
} from "lucide-react";
import Navbar from "../../Components/Nav";
import Footer from "../../Components/Footer";
import toast, { Toaster } from "react-hot-toast";

export default function Index({ auth, offers = [], flash = {} }) {
    const user = auth?.user || null;
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("newest");
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [favorites, setFavorites] = useState(
        offers.reduce(
            (acc, offer) => ({
                ...acc,
                [offer.id]: {
                    is_favorite: offer.is_favorite || false,
                    favorite_id: offer.favorite_id || null,
                },
            }),
            {}
        )
    );

    const itemsPerPage = 8;
    const categories = [
        "Beach",
        "Mountain",
        "City",
        "Cultural",
        "Adventure",
        "Historical",
        "Wildlife",
    ];
    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "priceAsc", label: "Price: Low to High" },
        { value: "priceDesc", label: "Price: High to Low" },
        { value: "discount", label: "Biggest Discount" },
        { value: "expiring", label: "Expiring Soon" },
    ];

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    const toggleCategory = (category) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
        setCurrentPage(1);
    };

    const toggleFavorite = async (offerId) => {
        if (!user) {
            toast.error("Please log in to add to favorites");
            return;
        }
        try {
            const response = await axios.post("/favorites", {
                offer_id: offerId,
            });
            const { success, message, is_favorite, favorite_id } =
                response.data;
            if (success) {
                setFavorites((prev) => ({
                    ...prev,
                    [offerId]: { is_favorite, favorite_id },
                }));
                toast.success(message);
            } else {
                toast.error(message);
            }
        } catch (error) {
            toast.error("Failed to toggle favorite");
        }
    };

    const calculateDiscount = (original, discounted) => {
        const orig = parseFloat(original);
        const disc = parseFloat(discounted);
        if (!orig || !disc || orig <= disc) return 0;
        return Math.round(((orig - disc) / orig) * 100);
    };

    const getDaysLeft = (endDate) => {
        if (!endDate) return null;
        const today = new Date();
        const expiryDate = new Date(endDate);
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const isExpiringSoon = (endDate) => {
        const daysLeft = getDaysLeft(endDate);
        return daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
    };

    const isHotOffer = (offer) => {
        const discount = calculateDiscount(offer.price, offer.discount_price);
        const isRecent =
            new Date(offer.created_at) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return discount >= 25 && isRecent;
    };

    const isNotExpired = (endDate) => {
        if (!endDate) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiryDate = new Date(endDate);
        return expiryDate >= today;
    };

    const renderStars = (rating = 0) => {
        const stars = [];
        const rounded = Math.round(rating * 2) / 2;
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={14}
                    className={
                        i <= rounded
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-500"
                    }
                />
            );
        }
        return stars;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch {
            return "N/A";
        }
    };

    const filteredOffers = offers
        .filter(
            (offer) =>
                isNotExpired(offer.end_date) &&
                (offer.title
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                    offer.location
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    offer.description
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())) &&
                (selectedCategories.length === 0 ||
                    selectedCategories.includes(offer.category))
        )
        .sort((a, b) => {
            switch (sortBy) {
                case "priceAsc":
                    return (
                        (a.discount_price || a.price) -
                        (b.discount_price || b.price)
                    );
                case "priceDesc":
                    return (
                        (b.discount_price || b.price) -
                        (a.discount_price || a.price)
                    );
                case "discount":
                    return (
                        (b.discount_price
                            ? (b.price - b.discount_price) / b.price
                            : 0) -
                        (a.discount_price
                            ? (a.price - a.discount_price) / a.price
                            : 0)
                    );
                case "expiring":
                    const daysLeftA = getDaysLeft(a.end_date) || Infinity;
                    const daysLeftB = getDaysLeft(b.end_date) || Infinity;
                    return daysLeftA - daysLeftB;
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });

    const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
    const paginatedOffers = filteredOffers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const baseUrl = "/storage/";

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategories]);

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        } else if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Head>
                <title>Exclusive Offers - Triplus</title>
                <meta
                    name="description"
                    content="Discover limited-time exclusive travel deals with Triplus."
                />
            </Head>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Navbar user={user} />

            {/* Hero Section - مميز للعروض */}
            <section className="relative pt-28 pb-16 md:pt-36 md:pb-5 bg-gradient-to-b from-orange-950/70 via-gray-950 to-gray-950 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-20">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute top-20 right-20 w-64 h-64 bg-orange-600 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            rotate: [360, 180, 0],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute bottom-20 left-20 w-80 h-80 bg-red-600 rounded-full blur-3xl"
                    />
                </div>

                <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-full"
                    >
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wider">
                            Limited Time Offers
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
                    >
                        Hot{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-orange-500">
                            Travel Deals
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.7 }}
                        className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10"
                    >
                        Unbeatable discounts with limited availability - grab
                        them before they're gone!
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.45, duration: 0.6 }}
                        className="inline-block w-24 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-full"
                    />
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700"
                >
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center mb-2">
                            <Flame className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {offers.filter((o) => isHotOffer(o)).length}
                        </p>
                        <p className="text-xs text-gray-400">Hot Deals</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center mb-2">
                            <Clock className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {
                                offers.filter((o) => isExpiringSoon(o.end_date))
                                    .length
                            }
                        </p>
                        <p className="text-xs text-gray-400">Ending Soon</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center mb-2">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {
                                offers.filter(
                                    (o) =>
                                        calculateDiscount(
                                            o.price,
                                            o.discount_price
                                        ) >= 30
                                ).length
                            }
                        </p>
                        <p className="text-xs text-gray-400">30%+ OFF</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-2">
                            <Zap className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {offers.length}
                        </p>
                        <p className="text-xs text-gray-400">Total Offers</p>
                    </div>
                </motion.div>

                {/* Filters & Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-6">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search offers or locations..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-800/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 rounded-xl bg-gray-800/70 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-800/70 border border-gray-700 hover:bg-gray-700"
                            >
                                <Filter size={18} />
                                <span className="hidden sm:inline">
                                    Filters
                                </span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {filterOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mb-8"
                            >
                                <div className="p-5 bg-gray-800/70 rounded-xl border border-gray-700">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Tags className="text-orange-400" />
                                        <h3 className="font-semibold">
                                            Categories
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() =>
                                                    toggleCategory(cat)
                                                }
                                                className={`px-4 py-1.5 rounded-full text-sm ${
                                                    selectedCategories.includes(
                                                        cat
                                                    )
                                                        ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                                                        : "bg-gray-700 hover:bg-gray-600"
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center text-sm text-gray-400">
                        <p>
                            Showing{" "}
                            {paginatedOffers.length > 0
                                ? (currentPage - 1) * itemsPerPage + 1
                                : 0}
                            –
                            {Math.min(
                                currentPage * itemsPerPage,
                                filteredOffers.length
                            )}{" "}
                            of {filteredOffers.length} offers
                        </p>
                        {selectedCategories.length > 0 && (
                            <button
                                onClick={() => setSelectedCategories([])}
                                className="text-orange-400 hover:text-orange-300"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Offers Grid */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1 },
                        },
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {paginatedOffers.length === 0 ? (
                            <motion.div
                                className="col-span-full text-center py-16"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-2xl font-semibold mb-2">
                                    No offers found
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    Try changing your search or filters
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCategories([]);
                                    }}
                                    className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:from-orange-700 hover:to-red-700"
                                >
                                    Clear all
                                </button>
                            </motion.div>
                        ) : (
                            paginatedOffers.map((offer) => (
                                <motion.div
                                    key={offer.id}
                                    variants={cardVariants}
                                    layout
                                    whileHover={{ y: -6 }}
                                    className="bg-gray-800/80 rounded-xl overflow-hidden border border-gray-700 flex flex-col group relative"
                                >
                                    {/* Hot Deal Badge */}
                                    {isHotOffer(offer) && (
                                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold py-1.5 text-center z-10 flex items-center justify-center gap-1">
                                            <Flame className="w-3 h-3" />
                                            HOT DEAL
                                        </div>
                                    )}

                                    <div className="relative">
                                        <img
                                            src={
                                                offer.image
                                                    ? `${baseUrl}${offer.image}`
                                                    : "https://via.placeholder.com/640x480?text=Offer"
                                            }
                                            alt={offer.title}
                                            className={`w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500 ${
                                                isHotOffer(offer) ? "mt-7" : ""
                                            }`}
                                            loading="lazy"
                                            onError={(e) =>
                                                (e.target.src =
                                                    "https://via.placeholder.com/640x480?text=Offer")
                                            }
                                        />
                                        {offer.category && (
                                            <span className="absolute top-3 left-3 px-2 py-1 bg-gray-900/90 backdrop-blur-sm rounded text-xs font-medium">
                                                {offer.category}
                                            </span>
                                        )}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                                            {calculateDiscount(
                                                offer.price,
                                                offer.discount_price
                                            ) > 0 && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-lg"
                                                >
                                                    {calculateDiscount(
                                                        offer.price,
                                                        offer.discount_price
                                                    )}
                                                    % OFF
                                                </motion.div>
                                            )}
                                            <button
                                                onClick={() =>
                                                    toggleFavorite(offer.id)
                                                }
                                                className="w-9 h-9 rounded-full bg-gray-900/70 backdrop-blur-sm flex items-center justify-center hover:bg-gray-700 transition"
                                            >
                                                <Heart
                                                    size={18}
                                                    className={
                                                        favorites[offer.id]
                                                            ?.is_favorite
                                                            ? "text-red-500 fill-red-500"
                                                            : "text-gray-300"
                                                    }
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="font-bold text-lg mb-2 line-clamp-1">
                                            {offer.title}
                                        </h3>
                                        {offer.location && (
                                            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
                                                <MapPin
                                                    size={16}
                                                    className="text-orange-400"
                                                />
                                                {offer.location}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 mb-3">
                                            {renderStars(offer.rating)}
                                            <span className="text-gray-500 text-sm ml-2">
                                                ({offer.rating || "–"})
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm line-clamp-2 mb-3 flex-grow">
                                            {offer.description ||
                                                "No description available."}
                                        </p>

                                        {/* Expiry Warning */}
                                        {offer.end_date && (
                                            <div
                                                className={`flex items-center gap-1.5 text-sm mb-4 px-3 py-2 rounded-lg ${
                                                    isExpiringSoon(
                                                        offer.end_date
                                                    )
                                                        ? "bg-red-900/30 text-red-400 border border-red-800"
                                                        : "bg-gray-700/30 text-gray-400"
                                                }`}
                                            >
                                                <Clock size={16} />
                                                <span className="text-xs">
                                                    {isExpiringSoon(
                                                        offer.end_date
                                                    ) ? (
                                                        <span className="font-bold">
                                                            ⚡ Only{" "}
                                                            {getDaysLeft(
                                                                offer.end_date
                                                            )}{" "}
                                                            {getDaysLeft(
                                                                offer.end_date
                                                            ) === 1
                                                                ? "day"
                                                                : "days"}{" "}
                                                            left!
                                                        </span>
                                                    ) : (
                                                        `Until ${formatDate(
                                                            offer.end_date
                                                        )}`
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        <div className="mt-auto">
                                            <div className="flex items-baseline gap-2 mb-4">
                                                {offer.discount_price ? (
                                                    <>
                                                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                                                            $
                                                            {parseFloat(
                                                                offer.discount_price
                                                            ).toFixed(2)}
                                                        </span>
                                                        <span className="text-sm line-through text-gray-500">
                                                            $
                                                            {parseFloat(
                                                                offer.price
                                                            ).toFixed(2)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                                                        $
                                                        {parseFloat(
                                                            offer.price
                                                        ).toFixed(2)}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400">
                                                    / person
                                                </span>
                                            </div>
                                            <Link
                                                href={`/offers/${offer.id}`}
                                                className="block text-center py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg font-medium transition shadow-lg shadow-orange-900/20"
                                            >
                                                Grab This Deal
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {filteredOffers.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg ${
                                currentPage === 1
                                    ? "text-gray-600"
                                    : "hover:bg-gray-700"
                            }`}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                        ).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-lg ${
                                    currentPage === page
                                        ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                                        : "hover:bg-gray-700"
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(p + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg ${
                                currentPage === totalPages
                                    ? "text-gray-600"
                                    : "hover:bg-gray-700"
                            }`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
