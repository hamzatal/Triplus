import React, { useState, useEffect } from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Filter,
    Tags,
    Heart,
    Star,
} from "lucide-react";
import Navbar from "../../Components/Nav";
import Footer from "../../Components/Footer";
import toast, { Toaster } from "react-hot-toast";

const DestinationsPage = ({ auth }) => {
    const { props } = usePage();
    const { destinations = [], favorites = [] } = props;
    const user = auth?.user || null;

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("newest");
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [favoriteStates, setFavoriteStates] = useState(
        favorites.reduce(
            (acc, fav) => ({
                ...acc,
                [fav.destination_id]: {
                    is_favorite: true,
                    favorite_id: fav.id,
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

    // Animation variants
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

    const isFavorite = (destinationId) => {
        return favoriteStates[destinationId]?.is_favorite || false;
    };

    const toggleFavorite = async (destinationId) => {
        if (!user) {
            toast.error("Please log in to add to favorites.");
            return;
        }

        try {
            const response = await axios.post("/favorites", {
                destination_id: destinationId,
            });

            const { success, message, is_favorite, favorite_id } =
                response.data;

            if (success) {
                setFavoriteStates((prev) => ({
                    ...prev,
                    [destinationId]: { is_favorite, favorite_id },
                }));
                toast.success(message);
            } else {
                toast.error(message);
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to toggle favorite.";
            toast.error(errorMessage);
        }
    };

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "priceAsc", label: "Price: Low to High" },
        { value: "priceDesc", label: "Price: High to Low" },
        { value: "discount", label: "Biggest Discount" },
    ];

    const filteredDestinations = destinations
        .filter(
            (destination) =>
                (destination.title
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                    destination.location
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    destination.company?.company_name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())) &&
                (selectedCategories.length === 0 ||
                    selectedCategories.includes(destination.category))
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
                case "newest":
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });

    const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage);
    const paginatedDestinations = filteredDestinations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategories]);

    const calculateDiscount = (original, discounted) => {
        if (!discounted) return null;
        const percentage = Math.round(
            ((original - discounted) / original) * 100
        );
        return percentage;
    };

    const renderStars = (rating) => {
        const stars = [];
        const roundedRating = Math.round(rating * 2) / 2;
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white transition-all duration-300 relative">
            <Head>
                <title>Destinations - Triplus</title>
                <meta
                    name="description"
                    content="Explore our curated list of travel destinations with Triplus."
                />
            </Head>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

            <Navbar
                user={user}
                isDarkMode={isDarkMode}
                toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />

            {/* Hero Section */}
            <div className="relative h-64 md:h-72 overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 opacity-80"></div>
                <div className="absolute inset-0 bg-[url('/images/world.svg')] bg-no-repeat bg-center opacity-30 bg-fill"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="text-4xl md:text-6xl font-extrabold mb-3 leading-tight"
                        >
                            Amazing{" "}
                            <span className="text-blue-400">Destinations</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                            className="text-lg md:text-xl text-gray-300 mb-4 max-w-xl mx-auto"
                        >
                            Discover breathtaking places around the world for
                            your next adventure
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                        >
                            <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
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
                                placeholder="Search destinations, locations, or companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            />
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-48">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all duration-300"
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
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </div>
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
                                            <Tags className="w-4 h-4 text-blue-400" />
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
                                                            ? "bg-blue-600 text-white"
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
                            {filteredDestinations.length > 0
                                ? (currentPage - 1) * itemsPerPage + 1
                                : 0}
                            -
                            {Math.min(
                                currentPage * itemsPerPage,
                                filteredDestinations.length
                            )}{" "}
                            of {filteredDestinations.length} destinations
                        </p>
                        {selectedCategories.length > 0 && (
                            <button
                                onClick={() => setSelectedCategories([])}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                                Clear filters
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
                        {paginatedDestinations.length === 0 ? (
                            <motion.div
                                variants={fadeIn}
                                className="col-span-full text-center py-16"
                            >
                                <div className="max-w-md mx-auto">
                                    <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">
                                        No destinations found
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        We couldn't find any destinations
                                        matching your search criteria. Try
                                        adjusting your filters or search query.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedCategories([]);
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            paginatedDestinations.map((destination) => (
                                <motion.div
                                    key={destination.id}
                                    variants={cardVariants}
                                    layout
                                    whileHover={{
                                        y: -8,
                                        transition: { duration: 0.3 },
                                    }}
                                    className="bg-gray-800 bg-opacity-70 rounded-xl overflow-hidden shadow-xl border border-gray-700 flex flex-col group"
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={
                                                destination.image ||
                                                "https://via.placeholder.com/640x480?text=No+Image"
                                            }
                                            alt={destination.title}
                                            className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        {destination.category && (
                                            <span className="absolute top-3 left-3 px-2 py-1 bg-blue-600 rounded-full text-xs font-medium text-white">
                                                {destination.category}
                                            </span>
                                        )}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                                            {calculateDiscount(
                                                destination.price,
                                                destination.discount_price
                                            ) && (
                                                <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold text-center">
                                                    {calculateDiscount(
                                                        destination.price,
                                                        destination.discount_price
                                                    )}
                                                    % OFF
                                                </div>
                                            )}
                                            <button
                                                onClick={() =>
                                                    toggleFavorite(
                                                        destination.id
                                                    )
                                                }
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                                                    isFavorite(destination.id)
                                                        ? "bg-red-500 hover:bg-red-600"
                                                        : "bg-gray-900 bg-opacity-50 hover:bg-gray-700"
                                                }`}
                                                aria-label={
                                                    isFavorite(destination.id)
                                                        ? "Remove from favorites"
                                                        : "Add to favorites"
                                                }
                                            >
                                                <Heart
                                                    size={18}
                                                    className={
                                                        isFavorite(
                                                            destination.id
                                                        )
                                                            ? "text-white fill-white"
                                                            : "text-gray-300"
                                                    }
                                                />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-bold text-white line-clamp-1">
                                                {destination.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin
                                                size={16}
                                                className="text-blue-400"
                                            />
                                            <span className="text-gray-300 text-sm">
                                                {destination.location}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 mb-3">
                                            {renderStars(
                                                destination.rating || 0
                                            )}
                                            <span className="text-gray-400 text-sm ml-2">
                                                ({destination.rating || 0}/5)
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                                            {destination.description}
                                        </p>
                                        <div className="mt-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="block text-gray-400 text-xs">
                                                        Starting from
                                                    </span>
                                                    <div className="flex items-baseline gap-2">
                                                        {destination.discount_price ? (
                                                            <>
                                                                <span className="text-lg font-bold text-blue-400">
                                                                    $
                                                                    {
                                                                        destination.discount_price
                                                                    }
                                                                </span>
                                                                <span className="text-sm line-through text-gray-500">
                                                                    $
                                                                    {
                                                                        destination.price
                                                                    }
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-lg font-bold text-blue-400">
                                                                $
                                                                {
                                                                    destination.price
                                                                }
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-400">
                                                            / person
                                                        </span>
                                                    </div>
                                                </div>
                                                {destination.company && (
                                                    <span className="text-xs text-gray-400">
                                                        by{" "}
                                                        {
                                                            destination.company
                                                                .company_name
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                href={`/destinations/${destination.id}`}
                                                className="w-full inline-block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-300 transform group-hover:shadow-lg"
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

                {filteredDestinations.length > 0 && totalPages > 1 && (
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="flex justify-center items-center gap-2 mb-16"
                    >
                        <button
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                currentPage === 1
                                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                                    : "bg-gray-800 text-white hover:bg-gray-700"
                            } transition-all duration-300`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((page) => {
                                const pageRange = 2;
                                const startPage = Math.max(
                                    1,
                                    currentPage - pageRange
                                );
                                const endPage = Math.min(
                                    totalPages,
                                    currentPage + pageRange
                                );

                                if (
                                    (page >= startPage && page <= endPage) ||
                                    page === 1 ||
                                    page === totalPages
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                                currentPage === page
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-800 text-white hover:bg-gray-700"
                                            } transition-all duration-300`}
                                        >
                                            {page}
                                        </button>
                                    );
                                }

                                if (page === startPage - 1 && page > 1) {
                                    return (
                                        <span
                                            key={`ellipsis-start`}
                                            className="text-gray-500"
                                        >
                                            ...
                                        </span>
                                    );
                                }

                                if (page === endPage + 1 && page < totalPages) {
                                    return (
                                        <span
                                            key={`ellipsis-end`}
                                            className="text-gray-500"
                                        >
                                            ...
                                        </span>
                                    );
                                }

                                return null;
                            })}
                        </div>

                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                currentPage === totalPages
                                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                                    : "bg-gray-800 text-white hover:bg-gray-700"
                            } transition-all duration-300`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </div>
            <Footer />
        </div>
    );
};

const ChevronDown = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export default DestinationsPage;
