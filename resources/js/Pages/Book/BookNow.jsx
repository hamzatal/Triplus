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
    Calendar,
    Users,
    Compass,
    Tag,
    Package,
} from "lucide-react";
import Navbar from "../../Components/Nav";
import Footer from "../../Components/Footer";
import toast, { Toaster } from "react-hot-toast";

const BookNowPage = ({ auth, favorites: initialFavorites = [] }) => {
    const { props } = usePage();
    const { destinations = [], packages = [], offers = [], flash = {} } = props;
    const user = auth?.user || null;

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("newest");
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState(["all"]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [favorites, setFavorites] = useState(
        initialFavorites.reduce(
            (acc, fav) => ({
                ...acc,
                [`${fav.favoritable_type}-${fav.favoritable_id}`]: {
                    is_favorite: true,
                    favorite_id: fav.id,
                },
            }),
            {}
        )
    );

    const itemsPerPage = 8;

    // Combined data
    const allData = [
        ...destinations.map((item) => ({ ...item, type: "destination" })),
        ...packages.map((item) => ({ ...item, type: "package" })),
        ...offers.map((item) => ({ ...item, type: "offer" })),
    ];

    const categories = [
        "Beach",
        "Mountain",
        "City",
        "Cultural",
        "Adventure",
        "Historical",
        "Wildlife",
    ];

    const types = [
        { id: "all", label: "All", icon: <Compass className="w-4 h-4" /> },
        {
            id: "destination",
            label: "Destinations",
            icon: <MapPin className="w-4 h-4" />,
        },
        {
            id: "package",
            label: "Packages",
            icon: <Package className="w-4 h-4" />,
        },
        { id: "offer", label: "Offers", icon: <Tag className="w-4 h-4" /> },
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

    // Filter by type
    const toggleType = (type) => {
        if (type === "all") {
            setSelectedTypes(["all"]);
        } else {
            const newTypes = selectedTypes.includes("all")
                ? [type]
                : selectedTypes.includes(type)
                ? selectedTypes.filter((t) => t !== type)
                : [...selectedTypes, type];
            setSelectedTypes(newTypes.length === 0 ? ["all"] : newTypes);
        }
        setCurrentPage(1);
    };

    // Filter by category
    const toggleCategory = (category) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
        setCurrentPage(1);
    };

    // Toggle favorite
    // const toggleFavorite = async (item) => {
    //     if (!user) {
    //         toast.error("Please log in to add to favorites");
    //         return;
    //     }

    //     const type = item.type;
    //     const id = item.id;
    //     const key = `${type}-${id}`;
    //     const payload = {};

    //     // Set payload based on item type
    //     switch (type) {
    //         case "destination":
    //             payload.destination_id = id;
    //             break;
    //         case "package":
    //             payload.package_id = id;
    //             break;
    //         case "offer":
    //             payload.offer_id = id;
    //             break;
    //         default:
    //             toast.error("Invalid item type");
    //             return;
    //     }

    //     try {
    //         const response = await axios.post("/favorites", payload);
    //         const { success, message, is_favorite, favorite_id } =
    //             response.data;

    //         if (success) {
    //             setFavorites((prev) => ({
    //                 ...prev,
    //                 [key]: { is_favorite, favorite_id },
    //             }));
    //             toast.success(message);
    //         } else {
    //             toast.error(message);
    //         }
    //     } catch (error) {
    //         toast.error("Failed to toggle favorite");
    //     }
    // };

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "priceAsc", label: "Price: Low to High" },
        { value: "priceDesc", label: "Price: High to Low" },
        { value: "discount", label: "Biggest Discount" },
    ];

    // Filter and sort data
    const filteredData = allData
        .filter((item) => {
            // Type filter
            const typeMatch =
                selectedTypes.includes("all") ||
                selectedTypes.includes(item.type);

            // Search filter
            const searchMatch =
                (
                    item.title?.toLowerCase() ||
                    item.name?.toLowerCase() ||
                    ""
                ).includes(searchQuery.toLowerCase()) ||
                (item.location?.toLowerCase() || "").includes(
                    searchQuery.toLowerCase()
                ) ||
                (item.description?.toLowerCase() || "").includes(
                    searchQuery.toLowerCase()
                ) ||
                (item.destination_title?.toLowerCase() || "").includes(
                    searchQuery.toLowerCase()
                );

            // Category filter
            const categoryMatch =
                selectedCategories.length === 0 ||
                selectedCategories.includes(item.category);

            // Price filter
            const itemPrice = item.discount_price || item.price;
            const priceMatch =
                itemPrice >= priceRange.min && itemPrice <= priceRange.max;

            return typeMatch && searchMatch && categoryMatch && priceMatch;
        })
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
                    return (
                        new Date(b.created_at || b.id) -
                        new Date(a.created_at || a.id)
                    );
            }
        });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedTypes, selectedCategories, priceRange]);

    // Show flash messages as toasts
    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

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

    // Get type-specific details
    const getTypeIcon = (type) => {
        switch (type) {
            case "destination":
                return <MapPin className="w-5 h-5 text-blue-400" />;
            case "package":
                return <Package className="w-5 h-5 text-green-400" />;
            case "offer":
                return <Tag className="w-5 h-5 text-purple-400" />;
            default:
                return <Compass className="w-5 h-5 text-blue-400" />;
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

    const getTypeLabel = (type) => {
        switch (type) {
            case "destination":
                return "Destination";
            case "package":
                return "Package";
            case "offer":
                return "Offer";
            default:
                return "Unknown";
        }
    };

    const getItemDetailUrl = (item) => {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white transition-all duration-300 relative">
            <Head>
                <title>Book Now - Triplus</title>
                <meta
                    name="description"
                    content="Book your next adventure with Triplus. Explore our destinations, packages, and special offers."
                />
            </Head>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

            <Navbar
                user={user}
                isDarkMode={isDarkMode}
                toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />

            <div className="relative h-72 md:h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 opacity-80"></div>
                <div className="absolute inset-0 bg-[url('/images/world.svg')] bg-no-repeat bg-center opacity-30 bg-contain"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="text-4xl md:text-6xl font-extrabold mb-3 leading-tight"
                        >
                            Book Your{" "}
                            <span className="text-green-400">Adventure</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                            className="text-lg md:text-xl text-gray-300 mb-4 max-w-xl mx-auto"
                        >
                            Explore our destinations, packages, and special
                            offers to find your perfect getaway
                        </motion.p>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "6rem" }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="h-1 bg-green-500 mx-auto rounded-full"
                        ></motion.div>
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
                    {/* Type Selection */}
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        {types.map((type) => (
                            <motion.button
                                key={type.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleType(type.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                                    selectedTypes.includes(type.id)
                                        ? "bg-green-600 text-white shadow-lg shadow-green-900/30"
                                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                }`}
                            >
                                {type.icon}
                                <span>{type.label}</span>
                            </motion.button>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Search destinations, packages, offers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                aria-label="Search destinations, packages, or offers"
                            />
                            <Search
                                className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-48">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none transition-all duration-300"
                                    aria-label="Sort options"
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

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-all duration-300"
                                aria-label="Toggle filters"
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Filters
                                </span>
                            </motion.button>
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
                                <div className="p-6 bg-gray-800 bg-opacity-70 rounded-lg mb-6 border border-gray-700">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Categories */}
                                        <div className="w-full">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Tags
                                                    className="w-4 h-4 text-green-400"
                                                    aria-hidden="true"
                                                />
                                                <h3 className="text-lg font-semibold">
                                                    Categories
                                                </h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {categories.map((category) => (
                                                    <motion.button
                                                        key={category}
                                                        whileHover={{
                                                            scale: 1.05,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.95,
                                                        }}
                                                        onClick={() =>
                                                            toggleCategory(
                                                                category
                                                            )
                                                        }
                                                        className={`px-2.5 py-1 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                                                            selectedCategories.includes(
                                                                category
                                                            )
                                                                ? "bg-green-600 text-white"
                                                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                        }`}
                                                        aria-label={`Toggle ${category} category`}
                                                    >
                                                        {category}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price Range */}
                                        <div className="w-full">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Tag
                                                    className="w-4 h-4 text-green-400"
                                                    aria-hidden="true"
                                                />
                                                <h3 className="text-lg font-semibold">
                                                    Price Range
                                                </h3>
                                            </div>
                                            <div className="px-3 bg-gray-900 text-white rounded-lg p-3">
                                                <div className="flex justify-between text-xs text-gray-400 mb-2">
                                                    <span>
                                                        ${priceRange.min}
                                                    </span>
                                                    <span>
                                                        ${priceRange.max}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    {/* Min Price */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-300">
                                                            Min:
                                                        </span>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="10000"
                                                            value={
                                                                priceRange.min
                                                            }
                                                            onChange={(e) =>
                                                                setPriceRange({
                                                                    ...priceRange,
                                                                    min: Math.min(
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) || 0,
                                                                        priceRange.max
                                                                    ),
                                                                })
                                                            }
                                                            className="w-full accent-green-500"
                                                            aria-label="Minimum price"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="10000"
                                                            value={
                                                                priceRange.min
                                                            }
                                                            onChange={(e) =>
                                                                setPriceRange({
                                                                    ...priceRange,
                                                                    min: Math.min(
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) || 0,
                                                                        priceRange.max
                                                                    ),
                                                                })
                                                            }
                                                            className="w-24 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                                            aria-label="Minimum price input"
                                                        />
                                                    </div>
                                                    {/* Max Price */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-300">
                                                            Max:
                                                        </span>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="10000"
                                                            value={
                                                                priceRange.max
                                                            }
                                                            onChange={(e) =>
                                                                setPriceRange({
                                                                    ...priceRange,
                                                                    max: Math.max(
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) || 0,
                                                                        priceRange.min
                                                                    ),
                                                                })
                                                            }
                                                            className="w-full accent-green-500"
                                                            aria-label="Maximum price"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="10000"
                                                            value={
                                                                priceRange.max
                                                            }
                                                            onChange={(e) =>
                                                                setPriceRange({
                                                                    ...priceRange,
                                                                    max: Math.max(
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) || 0,
                                                                        priceRange.min
                                                                    ),
                                                                })
                                                            }
                                                            className="w-24 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                                            aria-label="Maximum price input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-400">
                            Showing{" "}
                            {filteredData.length > 0
                                ? (currentPage - 1) * itemsPerPage + 1
                                : 0}
                            -
                            {Math.min(
                                currentPage * itemsPerPage,
                                filteredData.length
                            )}{" "}
                            of {filteredData.length} items
                        </p>
                        {(selectedCategories.length > 0 ||
                            !selectedTypes.includes("all") ||
                            priceRange.min > 0 ||
                            priceRange.max < 10000) && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setSelectedCategories([]);
                                    setSelectedTypes(["all"]);
                                    setPriceRange({ min: 0, max: 10000 });
                                }}
                                className="text-green-400 hover:text-green-300 text-sm"
                                aria-label="Clear all filters"
                            >
                                Clear all filters
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                >
                    <AnimatePresence mode="popLayout">
                        {paginatedData.length === 0 ? (
                            <motion.div
                                variants={fadeIn}
                                className="col-span-full text-center py-16"
                            >
                                <div className="max-w-md mx-auto">
                                    <Search
                                        className="w-16 h-16 text-gray-600 mx-auto mb-4"
                                        aria-hidden="true"
                                    />
                                    <h3 className="text-2xl font-bold mb-2">
                                        No results found
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        We couldn't find any items matching your
                                        search criteria. Try adjusting your
                                        filters or search query.
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedCategories([]);
                                            setSelectedTypes(["all"]);
                                            setPriceRange({
                                                min: 0,
                                                max: 10000,
                                            });
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
                                        aria-label="Clear all filters"
                                    >
                                        Clear all filters
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            paginatedData.map((item) => (
                                <motion.div
                                    key={`${item.type}-${item.id}`}
                                    variants={cardVariants}
                                    layout
                                    whileHover={{
                                        y: -8,
                                        transition: { duration: 0.3 },
                                    }}
                                    className="bg-gray-800 bg-opacity-80 rounded-xl overflow-hidden shadow-xl border border-gray-700 flex flex-col group backdrop-blur-sm"
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={
                                                item.image ||
                                                "https://via.placeholder.com/640x480?text=No+Image"
                                            }
                                            alt={item.title || "Item"}
                                            className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                            onError={(e) =>
                                                (e.target.src =
                                                    "https://via.placeholder.com/640x480?text=No+Image")
                                            }
                                        />
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span
                                                className={`px-2 py-1 ${getTypeBadgeClass(
                                                    item.type
                                                )} rounded-full text-xs font-medium text-white`}
                                            >
                                                {getTypeLabel(item.type)}
                                            </span>
                                            {item.category && (
                                                <span className="px-2 py-1 bg-gray-700 bg-opacity-80 rounded-full text-xs font-medium text-white">
                                                    {item.category}
                                                </span>
                                            )}
                                        </div>
                                        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                                            {calculateDiscount(
                                                item.price,
                                                item.discount_price
                                            ) > 0 && (
                                                <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                    {calculateDiscount(
                                                        item.price,
                                                        item.discount_price
                                                    )}
                                                    % OFF
                                                </div>
                                            )}
                                            {/* <button
                                                onClick={() =>
                                                    toggleFavorite(item)
                                                }
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-20 ${
                                                    favorites[
                                                        `${item.type}-${item.id}`
                                                    ]?.is_favorite
                                                        ? "bg-red-500 hover:bg-red-600"
                                                        : "bg-gray-900 bg-opacity-50 hover:bg-gray-700"
                                                }`}
                                                aria-label={
                                                    favorites[
                                                        `${item.type}-${item.id}`
                                                    ]?.is_favorite
                                                        ? "Remove from favorites"
                                                        : "Add to favorites"
                                                }
                                            >
                                                <Heart
                                                    size={18}
                                                    className={
                                                        favorites[
                                                            `${item.type}-${item.id}`
                                                        ]?.is_favorite
                                                            ? "text-white fill-white"
                                                            : "text-gray-300"
                                                    }
                                                />
                                            </button> */}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-bold text-white line-clamp-1">
                                                {item.title || "Unknown"}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {getTypeIcon(item.type)}
                                            <span className="text-gray-300 text-sm">
                                                {item.type === "package" &&
                                                item.destination_title
                                                    ? item.destination_title
                                                    : item.location ||
                                                      "Unknown Location"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 mb-3">
                                            {renderStars(item.rating || 0)}
                                            <span className="text-gray-400 text-sm ml-2">
                                                ({item.rating || 0}/5)
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                                            {item.description ||
                                                "No description available."}
                                        </p>
                                        {(item.type === "package" ||
                                            item.type === "offer") && (
                                            <div className="flex flex-col gap-2 mb-4 text-sm text-gray-300">
                                                {item.type === "package" && (
                                                    <>
                                                        {item.duration && (
                                                            <div className="flex items-center gap-2">
                                                                <Calendar
                                                                    size={14}
                                                                    className="text-gray-400"
                                                                />
                                                                <span>
                                                                    Duration:{" "}
                                                                    {
                                                                        item.duration
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {item.group_size && (
                                                            <div className="flex items-center gap-2">
                                                                <Users
                                                                    size={14}
                                                                    className="text-gray-400"
                                                                />
                                                                <span>
                                                                    Group Size:{" "}
                                                                    {
                                                                        item.group_size
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {(item.start_date ||
                                                    item.end_date) && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar
                                                            size={14}
                                                            className="text-gray-400"
                                                        />
                                                        <span>
                                                            {formatDate(
                                                                item.start_date
                                                            )}{" "}
                                                            -{" "}
                                                            {formatDate(
                                                                item.end_date
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {item.discount_type && (
                                                    <div className="flex items-center gap-2">
                                                        <Tag
                                                            size={14}
                                                            className="text-gray-400"
                                                        />
                                                        <span>
                                                            Discount Type:{" "}
                                                            {item.discount_type}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="mt-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="block text-gray-400 text-xs">
                                                        {item.type ===
                                                        "destination"
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
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                                <span className="text-sm line-through text-gray-500">
                                                                    $
                                                                    {parseFloat(
                                                                        item.price
                                                                    ).toFixed(
                                                                        2
                                                                    )}
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
                                                href={getItemDetailUrl(item)}
                                                className="w-full inline-block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all duration-300 transform group-hover:shadow-lg"
                                                aria-label={`View details for ${
                                                    item.title || "item"
                                                }`}
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

                {filteredData.length > 0 && totalPages > 1 && (
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="flex justify-center items-center gap-2 mb-16"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                currentPage === 1
                                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                                    : "bg-gray-800 text-white hover:bg-gray-700"
                            } transition-all duration-300`}
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>

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
                                        <motion.button
                                            key={page}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                                currentPage === page
                                                    ? "bg-green-600 text-white"
                                                    : "bg-gray-800 text-white hover:bg-gray-700"
                                            } transition-all duration-300`}
                                            aria-label={`Go to page ${page}`}
                                        >
                                            {page}
                                        </motion.button>
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

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
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
                            aria-label="Next page"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
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

export default BookNowPage;
