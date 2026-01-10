import React, { useState, useEffect, useReducer } from "react";
import { Head, usePage, Link, router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Filter,
    Calendar,
    Star,
    Bookmark,
    Users,
    DollarSign,
    CheckCircle,
    CreditCard,
    X,
    Loader,
    Package,
    Map,
    Tag,
    Building2,
    AlertCircle,
    Clock,
    Heart,
    Sparkles,
    TrendingUp,
    Award,
    Grid3x3,
    List,
} from "lucide-react";
import Navbar from "../Components/Nav";
import Footer from "../Components/Footer";
import toast, { Toaster } from "react-hot-toast";
import moment from "moment";

const UserBookings = ({ auth }) => {
    const { props } = usePage();
    const { bookings = [], favorites = [], flash = {} } = props;
    const user = auth?.user || null;

    const initialState = {
        activeTab: "bookings",
        searchQuery: "",
        currentPage: 1,
        sortBy: "newest",
        filterOpen: false,
        selectedFilters: [],
        isLoading: false,
        cancelConfirmation: null,
        ratingModal: null,
        selectedRating: 0,
        ratingComment: "",
        viewMode: "grid",
    };

    const reducer = (state, action) => {
        switch (action.type) {
            case "SET_ACTIVE_TAB":
                return {
                    ...state,
                    activeTab: action.payload,
                    currentPage: 1,
                    selectedFilters: [],
                };
            case "SET_SEARCH_QUERY":
                return {
                    ...state,
                    searchQuery: action.payload,
                    currentPage: 1,
                };
            case "SET_CURRENT_PAGE":
                return { ...state, currentPage: action.payload };
            case "SET_SORT_BY":
                return { ...state, sortBy: action.payload };
            case "TOGGLE_FILTER_OPEN":
                return { ...state, filterOpen: !state.filterOpen };
            case "TOGGLE_FILTER":
                return {
                    ...state,
                    selectedFilters: state.selectedFilters.includes(
                        action.payload
                    )
                        ? state.selectedFilters.filter(
                              (f) => f !== action.payload
                          )
                        : [...state.selectedFilters, action.payload],
                    currentPage: 1,
                };
            case "CLEAR_FILTERS":
                return { ...state, selectedFilters: [], currentPage: 1 };
            case "SET_LOADING":
                return { ...state, isLoading: action.payload };
            case "SET_CANCEL_CONFIRMATION":
                return { ...state, cancelConfirmation: action.payload };
            case "SET_RATING_MODAL":
                return {
                    ...state,
                    ratingModal: action.payload,
                    selectedRating: 0,
                    ratingComment: "",
                };
            case "SET_SELECTED_RATING":
                return { ...state, selectedRating: action.payload };
            case "SET_RATING_COMMENT":
                return { ...state, ratingComment: action.payload };
            case "CLEAR_SEARCH":
                return { ...state, searchQuery: "", currentPage: 1 };
            case "SET_VIEW_MODE":
                return { ...state, viewMode: action.payload };
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(reducer, initialState);
    const {
        activeTab,
        searchQuery,
        currentPage,
        sortBy,
        filterOpen,
        selectedFilters,
        isLoading,
        cancelConfirmation,
        ratingModal,
        selectedRating,
        ratingComment,
        viewMode,
    } = state;

    const itemsPerPage = 6;
    const bookingStatuses = ["pending", "confirmed", "cancelled", "completed"];

    // Filter and sort items
    const filterItems = (items) => {
        return items
            .filter((item) => {
                const entity = item.destination || item.offer || item.package;
                if (!entity) return false;

                const title = entity.title || "";
                const location = entity.location || "";
                const description = entity.description || "";
                const companyName = item.company?.name || "";

                const matchesSearch =
                    title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    location
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    companyName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());

                const matchesFilter =
                    selectedFilters.length === 0 ||
                    (activeTab === "bookings" &&
                        selectedFilters.includes(item.status));

                return matchesSearch && matchesFilter;
            })
            .sort((a, b) => {
                const entityA = a.destination || a.offer || a.package;
                const entityB = b.destination || b.offer || b.package;
                if (!entityA || !entityB) return 0;

                switch (sortBy) {
                    case "priceAsc":
                        return (
                            (parseFloat(entityA.discount_price) ||
                                parseFloat(entityA.price)) -
                            (parseFloat(entityB.discount_price) ||
                                parseFloat(entityB.price))
                        );
                    case "priceDesc":
                        return (
                            (parseFloat(entityB.discount_price) ||
                                parseFloat(entityB.price)) -
                            (parseFloat(entityA.discount_price) ||
                                parseFloat(entityA.price))
                        );
                    case "newest":
                    default:
                        return (
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime()
                        );
                }
            });
    };

    const filteredItems =
        activeTab === "bookings"
            ? filterItems(bookings)
            : filterItems(favorites);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    const calculateDiscount = (original, discounted) => {
        if (!discounted || isNaN(original) || isNaN(discounted)) return null;
        return Math.round(((original - discounted) / original) * 100);
    };

    const renderStars = (rating, interactive = false) => {
        return Array.from({ length: 5 }, (_, i) => (
            <motion.div
                key={i}
                whileHover={interactive ? { scale: 1.2 } : {}}
                whileTap={interactive ? { scale: 0.9 } : {}}
                onClick={
                    interactive
                        ? () =>
                              dispatch({
                                  type: "SET_SELECTED_RATING",
                                  payload: i + 1,
                              })
                        : null
                }
                className={interactive ? "cursor-pointer" : ""}
            >
                <Star
                    size={16}
                    className={
                        i <
                        (interactive ? selectedRating : Math.round(rating || 0))
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                    }
                />
            </motion.div>
        ));
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return "N/A";
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "confirmed":
                return {
                    bg: "bg-emerald-500/20",
                    text: "text-emerald-400",
                    border: "border-emerald-500/30",
                };
            case "pending":
                return {
                    bg: "bg-amber-500/20",
                    text: "text-amber-400",
                    border: "border-amber-500/30",
                };
            case "cancelled":
                return {
                    bg: "bg-red-500/20",
                    text: "text-red-400",
                    border: "border-red-500/30",
                };
            case "completed":
                return {
                    bg: "bg-blue-500/20",
                    text: "text-blue-400",
                    border: "border-blue-500/30",
                };
            default:
                return {
                    bg: "bg-gray-500/20",
                    text: "text-gray-400",
                    border: "border-gray-500/30",
                };
        }
    };

    const canCancelBooking = (booking) => {
        if (
            !booking.created_at ||
            !["pending", "confirmed"].includes(booking.status)
        )
            return false;
        const hoursDiff = moment().diff(moment(booking.created_at), "hours");
        return hoursDiff <= 12;
    };

    const canRateBooking = (booking) => {
        if (!booking.created_at || booking.status !== "completed") return false;
        const hoursDiff = moment().diff(moment(booking.created_at), "hours");
        return hoursDiff >= 24;
    };

    const getCancelCountdown = (createdAt) => {
        if (!createdAt) return null;
        const deadline = moment(createdAt).add(12, "hours");
        if (moment().isAfter(deadline)) return null;
        const duration = moment.duration(deadline.diff(moment()));
        return `${Math.floor(duration.asHours())}h ${duration.minutes()}m`;
    };

    const handleCancelBooking = (bookingId) => {
        dispatch({ type: "SET_LOADING", payload: true });
        router.delete(`/bookings/${bookingId}/cancel`, {
            onSuccess: () => {
                dispatch({ type: "SET_LOADING", payload: false });
                dispatch({ type: "SET_CANCEL_CONFIRMATION", payload: null });
            },
            onError: (errors) => {
                toast.error(errors.message || "Failed to cancel booking.");
                dispatch({ type: "SET_LOADING", payload: false });
                dispatch({ type: "SET_CANCEL_CONFIRMATION", payload: null });
            },
        });
    };

    const handleSubmitRating = (booking) => {
        if (!selectedRating) {
            toast.error("Please select a rating.");
            return;
        }
        dispatch({ type: "SET_LOADING", payload: true });
        router.post(
            `/bookings/${booking.id}/rate`,
            { rating: selectedRating, comment: ratingComment },
            {
                onSuccess: () => {
                    toast.success("Rating submitted successfully!");
                    dispatch({ type: "SET_LOADING", payload: false });
                    dispatch({ type: "SET_RATING_MODAL", payload: null });
                },
                onError: (errors) => {
                    toast.error(errors.error || "Failed to submit rating.");
                    dispatch({ type: "SET_LOADING", payload: false });
                },
            }
        );
    };

    const getFavoriteTypeIcon = (type) => {
        const icons = {
            offer: <Tag size={14} className="text-amber-400" />,
            destination: <Map size={14} className="text-blue-400" />,
            package: <Package size={14} className="text-emerald-400" />,
        };
        return icons[type] || null;
    };

    const getFavoriteDetailsUrl = (item) => {
        const type = item.favoritable_type;
        const id = item.favoritable_id;
        if (!type || !id) return "/";
        const routes = {
            offer: `/offers/${id}`,
            destination: `/destinations/${id}`,
            package: `/packages/${id}`,
        };
        return routes[type.toLowerCase()] || "/";
    };

    const activeBookingsCount = bookings.filter((b) =>
        ["pending", "confirmed"].includes(b.status)
    ).length;

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Head>
                <title>My Bookings & Favorites - Triplus</title>
            </Head>
            <Toaster position="top-right" />
            <Navbar user={user} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-semibold text-emerald-400">
                                Your Travel Hub
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                            My{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                                Adventures
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                            Manage your bookings and saved destinations all in
                            one place
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-3xl font-bold text-emerald-400">
                                            {activeBookingsCount}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Active Bookings
                                        </p>
                                    </div>
                                    <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-7 h-7 text-emerald-400" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-3xl font-bold text-blue-400">
                                            {favorites.length}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Saved Favorites
                                        </p>
                                    </div>
                                    <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <Heart className="w-7 h-7 text-blue-400" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-center gap-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-2">
                        <button
                            onClick={() =>
                                dispatch({
                                    type: "SET_ACTIVE_TAB",
                                    payload: "bookings",
                                })
                            }
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all ${
                                activeTab === "bookings"
                                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            <Calendar className="w-5 h-5" />
                            My Bookings
                        </button>
                        <button
                            onClick={() =>
                                dispatch({
                                    type: "SET_ACTIVE_TAB",
                                    payload: "favorites",
                                })
                            }
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all ${
                                activeTab === "favorites"
                                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            <Heart className="w-5 h-5" />
                            Favorites
                        </button>
                    </div>
                </motion.div>

                {/* Search & Filters Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6"
                >
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by title, location, or company..."
                                value={searchQuery}
                                onChange={(e) =>
                                    dispatch({
                                        type: "SET_SEARCH_QUERY",
                                        payload: e.target.value,
                                    })
                                }
                                className="w-full pl-12 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() =>
                                        dispatch({ type: "CLEAR_SEARCH" })
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                                </button>
                            )}
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) =>
                                dispatch({
                                    type: "SET_SORT_BY",
                                    payload: e.target.value,
                                })
                            }
                            className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="priceAsc">Price: Low to High</option>
                            <option value="priceDesc">
                                Price: High to Low
                            </option>
                        </select>

                        {/* Filter Button */}
                        {activeTab === "bookings" && (
                            <button
                                onClick={() =>
                                    dispatch({ type: "TOGGLE_FILTER_OPEN" })
                                }
                                className="flex items-center gap-2 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white hover:border-emerald-500 transition-all"
                            >
                                <Filter className="w-5 h-5" />
                                Filters
                                {selectedFilters.length > 0 && (
                                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                                        {selectedFilters.length}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Filters Dropdown */}
                    <AnimatePresence>
                        {filterOpen && activeTab === "bookings" && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 pt-4 border-t border-gray-700 overflow-hidden"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {bookingStatuses.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() =>
                                                dispatch({
                                                    type: "TOGGLE_FILTER",
                                                    payload: status,
                                                })
                                            }
                                            className={`px-4 py-2 rounded-xl font-medium transition-all ${
                                                selectedFilters.includes(status)
                                                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                                                    : "bg-gray-900/50 text-gray-400 hover:text-white border border-gray-700"
                                            }`}
                                        >
                                            {status.charAt(0).toUpperCase() +
                                                status.slice(1)}
                                        </button>
                                    ))}
                                    {selectedFilters.length > 0 && (
                                        <button
                                            onClick={() =>
                                                dispatch({
                                                    type: "CLEAR_FILTERS",
                                                })
                                            }
                                            className="px-4 py-2 rounded-xl font-medium text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results Count */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                        <span>
                            Showing{" "}
                            {filteredItems.length > 0
                                ? (currentPage - 1) * itemsPerPage + 1
                                : 0}
                            -
                            {Math.min(
                                currentPage * itemsPerPage,
                                filteredItems.length
                            )}{" "}
                            of {filteredItems.length}{" "}
                            {activeTab === "bookings"
                                ? "bookings"
                                : "favorites"}
                        </span>
                    </div>
                </motion.div>

                {/* Items Grid */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                >
                    <AnimatePresence mode="popLayout">
                        {paginatedItems.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="col-span-full text-center py-20"
                            >
                                <div className="max-w-md mx-auto">
                                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center">
                                        <Search className="w-10 h-10 text-gray-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">
                                        No{" "}
                                        {activeTab === "bookings"
                                            ? "Bookings"
                                            : "Favorites"}{" "}
                                        Found
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        {activeTab === "bookings"
                                            ? "You haven't booked any trips yet. Start exploring now!"
                                            : "You haven't saved any destinations yet."}
                                    </p>
                                    <Link
                                        href="/booking"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-semibold hover:shadow-lg transition-all"
                                    >
                                        Explore Now
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            paginatedItems.map((item) => {
                                const entity =
                                    item.destination ||
                                    item.offer ||
                                    item.package;
                                if (!entity) return null;

                                const isBooking = activeTab === "bookings";
                                const countdown = isBooking
                                    ? getCancelCountdown(item.created_at)
                                    : null;
                                const userReview = item.reviews?.[0];
                                const statusColors = getStatusColor(
                                    item.status
                                );
                                const discount = calculateDiscount(
                                    entity.price,
                                    entity.discount_price
                                );

                                return (
                                    <motion.div
                                        key={`${activeTab}-${item.id}`}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        whileHover={{ y: -8 }}
                                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden group"
                                    >
                                        {/* Image */}
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={
                                                    entity.image ||
                                                    "/images/placeholder.jpg"
                                                }
                                                alt={entity.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.src =
                                                        "/images/placeholder.jpg";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                {entity.category && (
                                                    <span className="px-3 py-1 bg-gray-900/80 backdrop-blur-sm text-white rounded-full text-xs font-semibold">
                                                        {entity.category}
                                                    </span>
                                                )}
                                                {isBooking && item.status && (
                                                    <span
                                                        className={`px-3 py-1 ${statusColors.bg} border ${statusColors.border} backdrop-blur-sm ${statusColors.text} rounded-full text-xs font-semibold capitalize`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                )}
                                            </div>

                                            {discount > 0 && (
                                                <div className="absolute top-3 right-3 px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                                                    -{discount}%
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold mb-2 line-clamp-1">
                                                {entity.title}
                                            </h3>

                                            {entity.location && (
                                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                                                    <MapPin className="w-4 h-4 text-emerald-400" />
                                                    <span>
                                                        {entity.location}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Rating */}
                                            <div className="flex items-center gap-1 mb-3">
                                                {renderStars(
                                                    entity.rating || 0
                                                )}
                                                <span className="text-xs text-gray-400 ml-1">
                                                    ({entity.rating || 0}/5)
                                                </span>
                                            </div>

                                            {/* Booking Details */}
                                            {isBooking ? (
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                                        <Calendar className="w-4 h-4 text-emerald-400" />
                                                        <span>
                                                            {formatDate(
                                                                item.check_in
                                                            )}{" "}
                                                            -{" "}
                                                            {formatDate(
                                                                item.check_out
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                                        <Users className="w-4 h-4 text-emerald-400" />
                                                        <span>
                                                            {item.guests} Guests
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                                        <DollarSign className="w-4 h-4 text-emerald-400" />
                                                        <span className="font-semibold text-emerald-400">
                                                            $
                                                            {parseFloat(
                                                                item.total_price
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mb-4">
                                                    <div className="flex items-baseline gap-2">
                                                        {entity.discount_price ? (
                                                            <>
                                                                <span className="text-2xl font-bold text-emerald-400">
                                                                    $
                                                                    {parseFloat(
                                                                        entity.discount_price
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                                <span className="text-sm line-through text-gray-500">
                                                                    $
                                                                    {parseFloat(
                                                                        entity.price
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-2xl font-bold text-emerald-400">
                                                                $
                                                                {parseFloat(
                                                                    entity.price
                                                                ).toFixed(2)}
                                                            </span>
                                                        )}
                                                        <span className="text-sm text-gray-400">
                                                            /person
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                {isBooking ? (
                                                    <>
                                                        {canCancelBooking(
                                                            item
                                                        ) &&
                                                            countdown && (
                                                                <button
                                                                    onClick={() =>
                                                                        dispatch(
                                                                            {
                                                                                type: "SET_CANCEL_CONFIRMATION",
                                                                                payload:
                                                                                    item,
                                                                            }
                                                                        )
                                                                    }
                                                                    className="flex-1 py-2 px-3 bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium hover:bg-red-600/30 transition-all"
                                                                >
                                                                    Cancel (
                                                                    {countdown})
                                                                </button>
                                                            )}
                                                        {canRateBooking(item) &&
                                                            !userReview && (
                                                                <button
                                                                    onClick={() =>
                                                                        dispatch(
                                                                            {
                                                                                type: "SET_RATING_MODAL",
                                                                                payload:
                                                                                    item,
                                                                            }
                                                                        )
                                                                    }
                                                                    className="flex-1 py-2 px-3 bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-600/30 transition-all"
                                                                >
                                                                    <Star className="w-4 h-4 inline-block mr-1" />
                                                                    Rate
                                                                </button>
                                                            )}
                                                    </>
                                                ) : (
                                                    <Link
                                                        href={getFavoriteDetailsUrl(
                                                            item
                                                        )}
                                                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold text-center hover:shadow-lg transition-all"
                                                    >
                                                        View Details
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                        <button
                            onClick={() =>
                                dispatch({
                                    type: "SET_CURRENT_PAGE",
                                    payload: Math.max(1, currentPage - 1),
                                })
                            }
                            disabled={currentPage === 1}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                currentPage === 1
                                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                                    : "bg-gray-800 text-white hover:bg-gray-700"
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                        ).map((page) => (
                            <button
                                key={page}
                                onClick={() =>
                                    dispatch({
                                        type: "SET_CURRENT_PAGE",
                                        payload: page,
                                    })
                                }
                                className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                                    currentPage === page
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                                        : "bg-gray-800 text-gray-400 hover:text-white"
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() =>
                                dispatch({
                                    type: "SET_CURRENT_PAGE",
                                    payload: Math.min(
                                        currentPage + 1,
                                        totalPages
                                    ),
                                })
                            }
                            disabled={currentPage === totalPages}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                currentPage === totalPages
                                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                                    : "bg-gray-800 text-white hover:bg-gray-700"
                            }`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </section>

            {/* Cancel Modal */}
            <AnimatePresence>
                {cancelConfirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() =>
                            dispatch({
                                type: "SET_CANCEL_CONFIRMATION",
                                payload: null,
                            })
                        }
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 border border-gray-700 rounded-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold">
                                    Cancel Booking?
                                </h3>
                            </div>

                            <p className="text-gray-400 mb-6">
                                Are you sure you want to cancel your booking for{" "}
                                <strong className="text-white">
                                    {
                                        (
                                            cancelConfirmation.destination ||
                                            cancelConfirmation.offer ||
                                            cancelConfirmation.package
                                        )?.title
                                    }
                                </strong>
                                ? This action cannot be undone.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() =>
                                        dispatch({
                                            type: "SET_CANCEL_CONFIRMATION",
                                            payload: null,
                                        })
                                    }
                                    className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
                                >
                                    Keep Booking
                                </button>
                                <button
                                    onClick={() =>
                                        handleCancelBooking(
                                            cancelConfirmation.id
                                        )
                                    }
                                    disabled={isLoading}
                                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading && (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    )}
                                    Confirm Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rating Modal */}
            <AnimatePresence>
                {ratingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() =>
                            dispatch({
                                type: "SET_RATING_MODAL",
                                payload: null,
                            })
                        }
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 border border-gray-700 rounded-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                    <Star className="w-6 h-6 text-amber-400" />
                                </div>
                                <h3 className="text-xl font-bold">
                                    Rate Your Experience
                                </h3>
                            </div>

                            <p className="text-gray-400 mb-4">
                                How was your experience with{" "}
                                <strong className="text-white">
                                    {
                                        (
                                            ratingModal.destination ||
                                            ratingModal.offer ||
                                            ratingModal.package
                                        )?.title
                                    }
                                </strong>
                                ?
                            </p>

                            {/* Stars */}
                            <div className="flex justify-center gap-2 mb-6">
                                {renderStars(selectedRating, true)}
                            </div>

                            {/* Comment */}
                            <textarea
                                value={ratingComment}
                                onChange={(e) =>
                                    dispatch({
                                        type: "SET_RATING_COMMENT",
                                        payload: e.target.value,
                                    })
                                }
                                placeholder="Share your experience (optional)..."
                                className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none mb-4"
                                rows="4"
                                maxLength={500}
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() =>
                                        dispatch({
                                            type: "SET_RATING_MODAL",
                                            payload: null,
                                        })
                                    }
                                    className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() =>
                                        handleSubmitRating(ratingModal)
                                    }
                                    disabled={isLoading || !selectedRating}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading && (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    )}
                                    Submit Rating
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default UserBookings;
