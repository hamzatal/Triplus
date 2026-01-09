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
    X,
    Heart,
    Star,
    Calendar,
    Users,
    Sparkles,
    TrendingUp,
    Clock,
    DollarSign,
    ArrowUpDown,
    Grid3x3,
    LayoutGrid,
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
    const [activeTab, setActiveTab] = useState("all");
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [viewMode, setViewMode] = useState("grid"); // grid or list
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

    const itemsPerPage = viewMode === "grid" ? 9 : 6;

    // Helper function to safely parse price
    const parsePrice = (price) => {
        const parsed = parseFloat(price);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Combined data
    const allData = [
        ...destinations.map((item) => ({ ...item, type: "destination" })),
        ...packages.map((item) => ({ ...item, type: "package" })),
        ...offers.map((item) => ({ ...item, type: "offer" })),
    ];

    const categories = [
        { id: "beach", label: "Beach", icon: "🏖️" },
        { id: "mountain", label: "Mountain", icon: "⛰️" },
        { id: "city", label: "City", icon: "🏙️" },
        { id: "cultural", label: "Cultural", icon: "🏛️" },
        { id: "adventure", label: "Adventure", icon: "🎒" },
        { id: "historical", label: "Historical", icon: "🏰" },
        { id: "wildlife", label: "Wildlife", icon: "🦁" },
    ];

    const tabs = [
        { id: "all", label: "All Adventures", count: allData.length },
        {
            id: "destination",
            label: "Destinations",
            count: destinations.length,
        },
        { id: "package", label: "Packages", count: packages.length },
        { id: "offer", label: "Special Offers", count: offers.length },
    ];

    // Filter by tab
    const filteredByTab =
        activeTab === "all"
            ? allData
            : allData.filter((item) => item.type === activeTab);

    // Apply all filters
    const filteredData = filteredByTab
        .filter((item) => {
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
                );

            const categoryMatch =
                selectedCategories.length === 0 ||
                selectedCategories.some(
                    (cat) => item.category?.toLowerCase() === cat.toLowerCase()
                );

            const itemPrice = parsePrice(item.discount_price || item.price);
            const priceMatch =
                itemPrice >= priceRange.min && itemPrice <= priceRange.max;

            return searchMatch && categoryMatch && priceMatch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "priceAsc":
                    return (
                        parsePrice(a.discount_price || a.price) -
                        parsePrice(b.discount_price || b.price)
                    );
                case "priceDesc":
                    return (
                        parsePrice(b.discount_price || b.price) -
                        parsePrice(a.discount_price || a.price)
                    );
                case "rating":
                    return (b.rating || 0) - (a.rating || 0);
                case "discount":
                    const priceA = parsePrice(a.price);
                    const discountPriceA = parsePrice(a.discount_price);
                    const discountA = discountPriceA
                        ? ((priceA - discountPriceA) / priceA) * 100
                        : 0;

                    const priceB = parsePrice(b.price);
                    const discountPriceB = parsePrice(b.discount_price);
                    const discountB = discountPriceB
                        ? ((priceB - discountPriceB) / priceB) * 100
                        : 0;

                    return discountB - discountA;
                default:
                    return (
                        new Date(b.created_at || 0) -
                        new Date(a.created_at || 0)
                    );
            }
        });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleCategory = (categoryId) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((c) => c !== categoryId)
                : [...prev, categoryId]
        );
        setCurrentPage(1);
    };

    const calculateDiscount = (original, discounted) => {
        const origPrice = parsePrice(original);
        const discPrice = parsePrice(discounted);
        if (!discPrice || origPrice === 0) return 0;
        return Math.round(((origPrice - discPrice) / origPrice) * 100);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={14}
                className={
                    i < Math.round(rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-600"
                }
            />
        ));
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

    const getTypeBadge = (type) => {
        const badges = {
            destination: {
                label: "Destination",
                class: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            },
            package: {
                label: "Package",
                class: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
            },
            offer: {
                label: "Special Offer",
                class: "bg-purple-500/20 text-purple-400 border-purple-500/30",
            },
        };
        return badges[type] || badges.destination;
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeTab, selectedCategories, sortBy, priceRange]);

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Head>
                <title>Explore Adventures - Triplus</title>
                <meta
                    name="description"
                    content="Discover amazing destinations, packages, and special offers"
                />
            </Head>

            <Toaster position="top-right" />
            <Navbar user={user} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-semibold text-emerald-400">
                                Discover Your Next Adventure
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
                            Explore Amazing
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                                Destinations
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                            From tropical beaches to mountain peaks, find your
                            perfect getaway
                        </p>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search destinations, packages, or offers..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-12 pr-4 py-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                />
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-3"
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                    activeTab === tab.id
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                                        : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                        activeTab === tab.id
                                            ? "bg-white/20"
                                            : "bg-gray-700"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                {/* Filters & Controls */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6">
                        {/* Results Count */}
                        <div className="flex items-center gap-4">
                            <p className="text-gray-400">
                                <span className="text-white font-semibold">
                                    {filteredData.length}
                                </span>{" "}
                                results found
                            </p>

                            {/* View Toggle */}
                            <div className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded ${
                                        viewMode === "grid"
                                            ? "bg-emerald-600 text-white"
                                            : "text-gray-400 hover:text-white"
                                    }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded ${
                                        viewMode === "list"
                                            ? "bg-emerald-600 text-white"
                                            : "text-gray-400 hover:text-white"
                                    }`}
                                >
                                    <Grid3x3 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Sort & Filter */}
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 lg:flex-initial">
                                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full lg:w-48 pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="priceAsc">
                                        Price: Low to High
                                    </option>
                                    <option value="priceDesc">
                                        Price: High to Low
                                    </option>
                                    <option value="rating">
                                        Highest Rated
                                    </option>
                                    <option value="discount">
                                        Best Discount
                                    </option>
                                </select>
                            </div>

                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                                    filterOpen
                                        ? "bg-emerald-600 border-emerald-500 text-white"
                                        : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
                                }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filters</span>
                                {(selectedCategories.length > 0 ||
                                    priceRange.min > 0 ||
                                    priceRange.max < 10000) && (
                                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                                        {selectedCategories.length +
                                            (priceRange.min > 0 ||
                                            priceRange.max < 10000
                                                ? 1
                                                : 0)}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {filterOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold">
                                            Filters
                                        </h3>
                                        {(selectedCategories.length > 0 ||
                                            priceRange.min > 0 ||
                                            priceRange.max < 10000) && (
                                            <button
                                                onClick={() => {
                                                    setSelectedCategories([]);
                                                    setPriceRange({
                                                        min: 0,
                                                        max: 10000,
                                                    });
                                                }}
                                                className="text-sm text-emerald-400 hover:text-emerald-300"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        {/* Categories */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-400 mb-4">
                                                CATEGORIES
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {categories.map((category) => (
                                                    <button
                                                        key={category.id}
                                                        onClick={() =>
                                                            toggleCategory(
                                                                category.id
                                                            )
                                                        }
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                                                            selectedCategories.includes(
                                                                category.id
                                                            )
                                                                ? "bg-emerald-600 border-emerald-500 text-white"
                                                                : "bg-gray-900/50 border-gray-700 text-gray-300 hover:border-emerald-500/50"
                                                        }`}
                                                    >
                                                        <span>
                                                            {category.icon}
                                                        </span>
                                                        <span className="text-sm">
                                                            {category.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price Range */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-400 mb-4">
                                                PRICE RANGE
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1">
                                                        <label className="block text-xs text-gray-500 mb-2">
                                                            Min: $
                                                            {priceRange.min}
                                                        </label>
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
                                                                        ),
                                                                        priceRange.max
                                                                    ),
                                                                })
                                                            }
                                                            className="w-full accent-emerald-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-xs text-gray-500 mb-2">
                                                            Max: $
                                                            {priceRange.max}
                                                        </label>
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
                                                                        ),
                                                                        priceRange.min
                                                                    ),
                                                                })
                                                            }
                                                            className="w-full accent-emerald-500"
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

                    {/* Active Filters */}
                    {(selectedCategories.length > 0 ||
                        priceRange.min > 0 ||
                        priceRange.max < 10000) && (
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                            <span className="text-sm text-gray-400">
                                Active filters:
                            </span>
                            {selectedCategories.map((catId) => {
                                const cat = categories.find(
                                    (c) => c.id === catId
                                );
                                return (
                                    <button
                                        key={catId}
                                        onClick={() => toggleCategory(catId)}
                                        className="flex items-center gap-2 px-3 py-1 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-full text-sm"
                                    >
                                        <span>{cat?.label}</span>
                                        <X className="w-3 h-3" />
                                    </button>
                                );
                            })}
                            {(priceRange.min > 0 || priceRange.max < 10000) && (
                                <button
                                    onClick={() =>
                                        setPriceRange({ min: 0, max: 10000 })
                                    }
                                    className="flex items-center gap-2 px-3 py-1 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-full text-sm"
                                >
                                    <span>
                                        ${priceRange.min} - ${priceRange.max}
                                    </span>
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Results Grid/List */}
                {paginatedData.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center">
                            <Search className="w-12 h-12 text-gray-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                            No results found
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Try adjusting your filters or search query
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategories([]);
                                setPriceRange({ min: 0, max: 10000 });
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            Clear All Filters
                        </button>
                    </motion.div>
                ) : (
                    <>
                        <div
                            className={`grid gap-6 mb-12 ${
                                viewMode === "grid"
                                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                                    : "grid-cols-1"
                            }`}
                        >
                            <AnimatePresence mode="popLayout">
                                {paginatedData.map((item, index) => {
                                    const badge = getTypeBadge(item.type);
                                    const discount = calculateDiscount(
                                        item.price,
                                        item.discount_price
                                    );
                                    const currentPrice = parsePrice(
                                        item.discount_price || item.price
                                    );
                                    const originalPrice = parsePrice(
                                        item.price
                                    );

                                    return (
                                        <motion.div
                                            key={`${item.type}-${item.id}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: index * 0.05 }}
                                            layout
                                            className={`group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all ${
                                                viewMode === "list"
                                                    ? "flex flex-col md:flex-row"
                                                    : ""
                                            }`}
                                        >
                                            {/* Image */}
                                            <div
                                                className={`relative overflow-hidden ${
                                                    viewMode === "list"
                                                        ? "md:w-80 h-64 md:h-auto"
                                                        : "h-56"
                                                }`}
                                            >
                                                <img
                                                    src={
                                                        item.image ||
                                                        "https://via.placeholder.com/400x300"
                                                    }
                                                    alt={item.title || "Item"}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    loading="lazy"
                                                    onError={(e) =>
                                                        (e.target.src =
                                                            "https://via.placeholder.com/400x300")
                                                    }
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                                {/* Badges */}
                                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${badge.class}`}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                    {discount > 0 && (
                                                        <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                                                            -{discount}%
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Rating */}
                                                {item.rating && (
                                                    <div className="absolute bottom-4 left-4 flex items-center gap-1 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="text-sm font-semibold">
                                                            {parseFloat(
                                                                item.rating
                                                            ).toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 flex flex-col flex-1">
                                                <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                                                    {item.title ||
                                                        item.name ||
                                                        "Untitled"}
                                                </h3>

                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>
                                                        {item.location ||
                                                            item.destination_title ||
                                                            "Location"}
                                                    </span>
                                                </div>

                                                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                                                    {item.description ||
                                                        "No description available"}
                                                </p>

                                                {/* Details */}
                                                {(item.duration ||
                                                    item.group_size) && (
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                                                        {item.duration && (
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4" />
                                                                <span>
                                                                    {
                                                                        item.duration
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {item.group_size && (
                                                            <div className="flex items-center gap-2">
                                                                <Users className="w-4 h-4" />
                                                                <span>
                                                                    {
                                                                        item.group_size
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Price & CTA */}
                                                <div className="mt-auto pt-4 border-t border-gray-700 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            Starting from
                                                        </p>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-2xl font-bold text-emerald-400">
                                                                $
                                                                {currentPrice.toFixed(
                                                                    2
                                                                )}
                                                            </span>
                                                            {item.discount_price &&
                                                                originalPrice >
                                                                    currentPrice && (
                                                                    <span className="text-sm text-gray-500 line-through">
                                                                        $
                                                                        {originalPrice.toFixed(
                                                                            2
                                                                        )}
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </div>

                                                    <Link
                                                        href={getItemUrl(item)}
                                                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2">
                                <button
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(1, p - 1)
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="p-3 rounded-xl bg-gray-800/50 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="flex gap-2">
                                    {Array.from({ length: totalPages }).map(
                                        (_, i) => {
                                            const page = i + 1;
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 &&
                                                    page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() =>
                                                            setCurrentPage(page)
                                                        }
                                                        className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                                                            currentPage === page
                                                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                                                                : "bg-gray-800/50 border border-gray-700 hover:bg-gray-700"
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (
                                                page === currentPage - 2 ||
                                                page === currentPage + 2
                                            ) {
                                                return (
                                                    <span
                                                        key={page}
                                                        className="flex items-center px-2"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        }
                                    )}
                                </div>

                                <button
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(totalPages, p + 1)
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="p-3 rounded-xl bg-gray-800/50 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            <Footer />
        </div>
    );
};

export default BookNowPage;
