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
    Calendar,
    Star,
    Heart,
    Clock,
    Zap,
    Award,
    Percent,
    Tag,
    Flame,
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
    const [isDarkMode, setIsDarkMode] = useState(true);
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

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
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

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "priceAsc", label: "Price: Low to High" },
        { value: "priceDesc", label: "Price: High to Low" },
        { value: "discount", label: "Biggest Discount" },
        { value: "expiring", label: "Expiring Soon" },
    ];

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
                            ? "text-yellow-300 fill-yellow-300"
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
                    const discountA = a.discount_price
                        ? (a.price - a.discount_price) / a.price
                        : 0;
                    const discountB = b.discount_price
                        ? (b.price - b.discount_price) / b.price
                        : 0;
                    return discountB - discountA;
                case "expiring":
                    const daysLeftA = getDaysLeft(a.end_date) || Infinity;
                    const daysLeftB = getDaysLeft(b.end_date) || Infinity;
                    return daysLeftA - daysLeftB;
                case "newest":
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });

    const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
    const paginatedOffers = filteredOffers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white transition-all duration-300 relative">
            <Head>
                <title>Exclusive Offers - Travel Deal</title>
                <meta
                    name="description"
                    content="Discover limited-time exclusive travel deals with exclusive offer."
                />
            </Head>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

            <Navbar
                user={user}
                isDarkMode={isDarkMode}
                toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />

            <div className="relative h-80 md:h-96 overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 bg-opacity-80"></div>
                <div className="absolute inset-0 bg-[url('/images/world.svg')] bg-no-repeat bg-center bg-opacity-30 bg-contain"></div>

                <div className="absolute inset-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.15, scale: 1 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2"
                    >
                        <Percent className="w-20 h-20 text-amber-200" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.15, scale: 1 }}
                        transition={{
                            duration: 1.3,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: 0.5,
                        }}
                        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2"
                    >
                        <Tag className="w-20 h-20 text-blue-200" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.15, scale: 1 }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: 0.3,
                        }}
                        className="absolute top-1/3 right-1/3"
                    >
                        <Flame className="w-16 h-16 text-red-600" />
                    </motion.div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-block mb-4 px-3 py-1 bg-amber-500 text-sm text-white font-bold rounded-full"
                        >
                            LIMITED TIME OFFERS
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="text-4xl md:text-6xl font-extrabold mb-3 leading-tight"
                        >
                            Exclusive{" "}
                            <span className="text-amber-400">Deals</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                            className="text-lg text-gray-300 mb-4 max-w-xl mx-auto"
                        >
                            Unbeatable offers with limited availability - book
                            before they're gone!
                        </motion.p>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "6rem" }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="h-1 bg-amber-400 mx-auto rounded-full"
                        ></motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 bg-gray-800 bg-opacity-50 p-4 rounded-xl border border-gray-700"
                >
                    <div className="flex flex-col items-center p-3 border-r border-gray-700">
                        <Zap className="w-6 h-6 text-amber-300 mb-2" />
                        <p className="text-lg font-bold text-white">
                            {offers.filter((o) => isHotOffer(o)).length}
                        </p>
                        <p className="text-sm text-gray-400">Hot Deals</p>
                    </div>
                    <div className="flex flex-col items-center p-3 md:border-r border-gray-700">
                        <Clock className="w-6 h-6 text-red-300 mb-2" />
                        <p className="text-lg font-bold text-white">
                            {
                                offers.filter((o) => isExpiringSoon(o.end_date))
                                    .length
                            }
                        </p>
                        <p className="text-sm text-gray-400">Ending Soon</p>
                    </div>
                    <div className="flex flex-col items-center p-3 border-r border-gray-700">
                        <Award className="w-6 h-6 text-yellow-300 mb-2" />
                        <p className="text-lg font-bold text-white">
                            {
                                offers.filter(
                                    (o) =>
                                        calculateDiscount(
                                            o.price,
                                            o.discount_price
                                        ) > 30
                                ).length
                            }
                        </p>
                        <p className="text-sm text-gray-400">Big Discounts</p>
                    </div>
                    <div className="flex flex-col items-center p-3">
                        <Tag className="w-6 h-6 text-blue-300 mb-2" />
                        <p className="text-lg font-bold text-white">
                            {offers.length}
                        </p>
                        <p className="text-sm text-gray-400">Total Offers</p>
                    </div>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    className="mb-12"
                >
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Search offers or locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300"
                            />
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-48">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none transition-all duration-300"
                                >
                                    {sortOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-all duration-300"
                            >
                                <Filter className="w-4 h-4" />
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
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 bg-gray-800 bg-opacity-70 rounded-lg mb-6 border border-gray-700">
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tags className="w-4 h-4 text-amber-400" />
                                            <h3 className="text-lg font-semibold">
                                                Categories
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((category) => (
                                                <button
                                                    key={category}
                                                    onClick={() =>
                                                        toggleCategory(category)
                                                    }
                                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                                                        selectedCategories.includes(
                                                            category
                                                        )
                                                            ? "bg-amber-500 text-white"
                                                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                    }`}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-400">
                            Showing{" "}
                            {filteredOffers.length > 0
                                ? Math.min(
                                      (currentPage - 1) * itemsPerPage + 1,
                                      filteredOffers.length
                                  )
                                : 0}
                            -
                            {Math.min(
                                currentPage * itemsPerPage,
                                filteredOffers.length
                            )}{" "}
                            of {filteredOffers.length} offers
                        </p>
                        {selectedCategories.length > 0 && (
                            <button
                                onClick={() => setSelectedCategories([])}
                                className="text-amber-300 hover:text-amber-200 text-sm"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16"
                >
                    <AnimatePresence mode="popLayout">
                        {paginatedOffers.length === 0 ? (
                            <motion.div
                                variants={fadeIn}
                                className="col-span-full text-center py-16"
                            >
                                <div className="max-w-md mx-auto">
                                    <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">
                                        No Offers Found
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        We couldn't find any offers matching
                                        your search criteria. Try adjusting the
                                        filters or search term.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedCategories([]);
                                        }}
                                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-300"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            paginatedOffers.map((offer) => (
                                <motion.div
                                    key={offer.id}
                                    variants={cardVariants}
                                    layout
                                    whileHover={{
                                        y: -8,
                                        transition: { duration: 0.3 },
                                    }}
                                    className="bg-gray-800 bg-opacity-90 rounded-xl overflow-hidden shadow-xl border border-gray-700 flex flex-col group backdrop-blur-sm"
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={
                                                offer.image ||
                                                "https://via.placeholder.com/640x480?text=Offer+Image"
                                            }
                                            alt={offer.title}
                                            className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src =
                                                    "https://via.placeholder.com/640x480?text=Offer+Image";
                                            }}
                                        />
                                        {offer.category && (
                                            <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500 rounded-full text-xs font-medium text-white">
                                                {offer.category}
                                            </span>
                                        )}
                                        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                                            {calculateDiscount(
                                                offer.price,
                                                offer.discount_price
                                            ) > 0 && (
                                                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                    {calculateDiscount(
                                                        offer.price,
                                                        offer.discount_price
                                                    )}
                                                    % OFF
                                                </div>
                                            )}
                                            <button
                                                onClick={() =>
                                                    toggleFavorite(offer.id)
                                                }
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-20 ${
                                                    favorites[offer.id]
                                                        ?.is_favorite
                                                        ? "bg-red-500 hover:bg-red-600"
                                                        : "bg-gray-900 bg-opacity-50 hover:bg-gray-700"
                                                }`}
                                                aria-label={
                                                    favorites[offer.id]
                                                        ?.is_favorite
                                                        ? "Remove from favorites"
                                                        : "Add to favorites"
                                                }
                                            >
                                                <Heart
                                                    size={18}
                                                    className={
                                                        favorites[offer.id]
                                                            ?.is_favorite
                                                            ? "text-white fill-white"
                                                            : "text-gray-300"
                                                    }
                                                />
                                            </button>
                                        </div>
                                        {isHotOffer(offer) && (
                                            <div className="absolute bottom-0 left-0 w-full bg-red-600 text-white py-2 text-center text-sm font-bold">
                                                HOT DEAL
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-bold text-white line-clamp-1">
                                                {offer.title}
                                            </h3>
                                        </div>
                                        {offer.location && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin
                                                    size={16}
                                                    className="text-amber-400"
                                                />
                                                <span className="text-gray-300 text-sm">
                                                    {offer.location}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 mb-3">
                                            {renderStars(offer.rating || 0)}
                                            <span className="text-gray-400 text-sm ml-2">
                                                ({offer.rating || 0}/5)
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                                            {offer.description ||
                                                "No description available."}
                                        </p>

                                        {offer.end_date && (
                                            <div
                                                className={`flex items-center gap-2 mb-4 ${
                                                    isExpiringSoon(
                                                        offer.end_date
                                                    )
                                                        ? "text-red-500"
                                                        : "text-gray-300"
                                                }`}
                                            >
                                                <Clock
                                                    size={16}
                                                    className={
                                                        isExpiringSoon(
                                                            offer.end_date
                                                        )
                                                            ? "text-red-500"
                                                            : "text-amber-400"
                                                    }
                                                />
                                                <span className="text-sm">
                                                    {isExpiringSoon(
                                                        offer.end_date
                                                    ) ? (
                                                        <span className="font-bold">
                                                            Only{" "}
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
                                                        `Valid until ${formatDate(
                                                            offer.end_date
                                                        )}`
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        <div className="mt-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="block text-gray-400 text-sm">
                                                        Starting from
                                                    </span>
                                                    <div className="flex items-baseline gap-2">
                                                        {offer.discount_price ? (
                                                            <>
                                                                <span className="text-lg font-bold text-amber-400">
                                                                    $
                                                                    {parseFloat(
                                                                        offer.discount_price
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                                <span className="text-sm line-through text-red-500">
                                                                    $
                                                                    {parseFloat(
                                                                        offer.price
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-lg font-bold text-amber-400">
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
                                                </div>
                                            </div>
                                            <Link
                                                href={`/offers/${offer.id}`}
                                                className="w-full inline-block text-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-all duration-300 transform group-hover:shadow-lg"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>

                {filteredOffers.length > 0 && totalPages > 1 && (
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="flex justify-center items-center"
                    >
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() =>
                                    setCurrentPage(Math.max(currentPage - 1, 1))
                                }
                                disabled={currentPage === 1}
                                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                    currentPage === 1
                                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                        : "bg-gray-800 text-white hover:bg-amber-500 transition-all duration-300"
                                }`}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => {
                                const pageNum = i + 1;
                                const isCurrentPage = pageNum === currentPage;
                                const shouldShow =
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    Math.abs(pageNum - currentPage) <= 1;

                                if (!shouldShow) {
                                    if (
                                        pageNum === 2 ||
                                        pageNum === totalPages - 1
                                    ) {
                                        return (
                                            <span
                                                key={pageNum}
                                                className="w-10 h-10 flex items-center justify-center text-gray-400"
                                            >
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            isCurrentPage
                                                ? "bg-amber-500 text-white"
                                                : "bg-gray-800 text-white hover:bg-gray-700 transition-all duration-300"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() =>
                                    setCurrentPage(
                                        Math.min(currentPage + 1, totalPages)
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                    currentPage === totalPages
                                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                        : "bg-gray-800 text-white hover:bg-amber-500 transition-all duration-300"
                                }`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
            <Footer />
        </div>
    );
}
