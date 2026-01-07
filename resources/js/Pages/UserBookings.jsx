import React, { useState, useEffect, useReducer } from "react";
import { Head, usePage, Link, router } from "@inertiajs/react";
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
    Bookmark,
    BookOpen,
    Users,
    DollarSign,
    CheckCircle,
    CreditCard,
    Info,
    X,
    Loader,
    Package,
    Map,
    Tag,
    Building2,
    AlertCircle,
} from "lucide-react";
import Navbar from "../Components/Nav";
import Footer from "../Components/Footer";
import toast, { Toaster } from "react-hot-toast";
import moment from "moment";

const UserBookings = ({ auth }) => {
    const { props } = usePage();
    const { bookings = [], favorites = [], flash = {} } = props;
    const user = auth?.user || null;

    // State management with useReducer
    const initialState = {
        activeTab: "bookings",
        searchQuery: "",
        currentPage: 1,
        sortBy: "newest",
        filterOpen: false,
        selectedFilters: [],
        isDarkMode: true,
        isLoading: false,
        cancelConfirmation: null,
        ratingModal: null,
        selectedRating: 0,
        ratingComment: "",
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
            case "TOGGLE_DARK_MODE":
                return { ...state, isDarkMode: !state.isDarkMode };
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
        isDarkMode,
        isLoading,
        cancelConfirmation,
        ratingModal,
        selectedRating,
        ratingComment,
    } = state;

    const itemsPerPage = 6;
    const bookingStatuses = ["pending", "confirmed", "cancelled", "completed"];
    const favoriteCategories = [
        "hotel",
        "flight",
        "package",
        "adventure",
        "city_break",
        "luxury",
    ];

    // Animations
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    };

    const tabTransition = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    };

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "priceAsc", label: "Price: Low to High" },
        { value: "priceDesc", label: "Price: High to Low" },
    ];

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
                        selectedFilters.includes(item.status)) ||
                    (activeTab !== "bookings" &&
                        entity.category &&
                        selectedFilters.includes(entity.category));
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

    // Flash messages
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    // Calculate discount percentage
    const calculateDiscount = (original, discounted) => {
        if (!discounted || isNaN(original) || isNaN(discounted)) return null;
        const percentage = Math.round(
            ((original - discounted) / original) * 100
        );
        return percentage;
    };

    // Render star ratings
    const renderStars = (rating, interactive = false) => {
        const stars = [];
        const roundedRating = Math.round((rating || 0) * 2) / 2;
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <motion.div
                    key={i}
                    whileHover={interactive ? { scale: 1.2 } : {}}
                    whileTap={interactive ? { scale: 0.9 } : {}}
                    onClick={
                        interactive
                            ? () =>
                                  dispatch({
                                      type: "SET_SELECTED_RATING",
                                      payload: i,
                                  })
                            : null
                    }
                    className={interactive ? "cursor-pointer" : ""}
                >
                    <Star
                        size={16}
                        className={
                            i <= (interactive ? selectedRating : roundedRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-600"
                        }
                    />
                </motion.div>
            );
        }
        return stars;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return "N/A";
        }
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "confirmed":
                return "bg-green-600";
            case "pending":
                return "bg-yellow-600";
            case "cancelled":
                return "bg-red-600";
            case "completed":
                return "bg-blue-600";
            default:
                return "bg-gray-600";
        }
    };

    // Check if booking can be cancelled
    const canCancelBooking = (booking) => {
        if (
            !booking.created_at ||
            !["pending", "confirmed"].includes(booking.status)
        )
            return false;
        const createdAt = moment(booking.created_at);
        const now = moment();
        const hoursDiff = now.diff(createdAt, "hours");
        return hoursDiff <= 12;
    };

    // Check if booking can be rated (after 24 hours and completed)
    const canRateBooking = (booking) => {
        if (!booking.created_at || booking.status !== "completed") return false;
        const createdAt = moment(booking.created_at);
        const now = moment();
        const hoursDiff = now.diff(createdAt, "hours");
        return hoursDiff >= 24;
    };

    // Get cancellation countdown
    const getCancelCountdown = (createdAt) => {
        if (!createdAt) return null;
        const createdMoment = moment(createdAt);
        const deadline = createdMoment.clone().add(12, "hours");
        const now = moment();
        if (now.isAfter(deadline)) return null;
        const duration = moment.duration(deadline.diff(now));
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        return `${hours}h ${minutes}m`;
    };

    // Handle cancel booking
    const handleCancelBooking = (bookingId) => {
        dispatch({ type: "SET_LOADING", payload: true });
        router.delete(`/bookings/${bookingId}/cancel`, {
            onSuccess: (page) => {
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
    // Handle submit rating
    const handleSubmitRating = (booking) => {
        if (!selectedRating) {
            toast.error("Please select a rating.");
            return;
        }
        dispatch({ type: "SET_LOADING", payload: true });
        router.post(
            `/bookings/${booking.id}/rate`,
            {
                rating: selectedRating,
                comment: ratingComment,
            },
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

    // Favorite type icon
    const getFavoriteTypeIcon = (type) => {
        switch (type) {
            case "offer":
                return <Tag size={14} className="text-blue-500" />;
            case "destination":
                return <Map size={14} className="text-blue-500" />;
            case "package":
                return <Package size={14} className="text-blue-500" />;
            default:
                return null;
        }
    };

    // Favorite details URL
    const getFavoriteDetailsUrl = (item) => {
        const type = item.favoritable_type;
        const id = item.favoritable_id;
        if (!type || !id) {
            console.warn(
                `Missing favoritable_type or favoritable_id for item:`,
                item
            );
            return "/";
        }
        switch (type.toLowerCase()) {
            case "offer":
                return `/offers/${id}`;
            case "destination":
                return `/destinations/${id}`;
            case "package":
                return `/packages/${id}`;
            default:
                console.warn(
                    `Invalid favoritable_type: ${type} for item ID: ${id}`
                );
                return "/";
        }
    };

    // Statistics
    const activeBookingsCount = bookings.filter((b) =>
        ["pending", "confirmed"].includes(b.status)
    ).length;
    const totalFavoritesCount = favorites.length;

    return (
        <div
            className={`min-h-screen transition-all duration-300 ${
                isDarkMode
                    ? "bg-gray-900 text-white"
                    : "bg-gray-50 text-gray-900"
            }`}
        >
            <Head>
                <title>My Bookings & Favorites - Triplus</title>
                <meta
                    name="description"
                    content="Manage your bookings and favorite destinations with Triplus."
                />
            </Head>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

            <Navbar
                user={user}
                isDarkMode={isDarkMode}
                toggleDarkMode={() => dispatch({ type: "TOGGLE_DARK_MODE" })}
            />

            {/* Hero Section */}
            <section className="relative h-64 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-gray-800/70"></div>
                <div className="absolute inset-0 bg-[url('/images/world.png')] bg-no-repeat bg-center opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <h1
                            className={`text-3xl md:text-4xl font-extrabold mb-4 ${
                                isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                        >
                            My{" "}
                            <span className="text-blue-500">
                                Bookings & Favorites
                            </span>
                        </h1>
                        <p
                            className={`text-lg ${
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                            } max-w-xl mx-auto`}
                        >
                            Plan and track your adventures effortlessly
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Statistics Section */}
            <section
                className={`py-6 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        <div
                            className={`p-4 rounded-xl ${
                                isDarkMode ? "bg-gray-800" : "bg-blue-50"
                            } flex items-center gap-3 shadow-md`}
                        >
                            <BookOpen className="w-8 h-8 text-blue-500" />
                            <div>
                                <h3
                                    className={`text-lg font-semibold ${
                                        isDarkMode
                                            ? "text-white"
                                            : "text-gray-900"
                                    }`}
                                >
                                    {activeBookingsCount}
                                </h3>
                                <p
                                    className={`text-sm ${
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                    }`}
                                >
                                    Active Bookings
                                </p>
                            </div>
                        </div>
                        <div
                            className={`p-4 rounded-xl ${
                                isDarkMode ? "bg-gray-800" : "bg-blue-50"
                            } flex items-center gap-3 shadow-md`}
                        >
                            <Bookmark className="w-8 h-8 text-blue-500" />
                            <div>
                                <h3
                                    className={`text-lg font-semibold ${
                                        isDarkMode
                                            ? "text-white"
                                            : "text-gray-900"
                                    }`}
                                >
                                    {totalFavoritesCount}
                                </h3>
                                <p
                                    className={`text-sm ${
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                    }`}
                                >
                                    Favorites
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section
                className={`py-12 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    {/* Tabs */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="mb-6"
                    >
                        <div className="flex justify-center border-b border-gray-700/30">
                            <motion.button
                                variants={tabTransition}
                                onClick={() =>
                                    dispatch({
                                        type: "SET_ACTIVE_TAB",
                                        payload: "bookings",
                                    })
                                }
                                className={`flex-1 sm:flex-none py-2 px-4 text-center font-semibold text-base transition-all duration-300 rounded-t-md ${
                                    activeTab === "bookings"
                                        ? "bg-blue-600 text-white shadow-md"
                                        : isDarkMode
                                        ? "text-gray-400 hover:text-gray-200"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <BookOpen className="inline-block w-4 h-4 mr-1" />
                                Bookings
                            </motion.button>
                            <motion.button
                                variants={tabTransition}
                                onClick={() =>
                                    dispatch({
                                        type: "SET_ACTIVE_TAB",
                                        payload: "favorites",
                                    })
                                }
                                className={`flex-1 sm:flex-none py-2 px-4 text-center font-semibold text-base transition-all duration-300 rounded-t-md ${
                                    activeTab === "favorites"
                                        ? "bg-blue-600 text-white shadow-md"
                                        : isDarkMode
                                        ? "text-gray-400 hover:text-gray-200"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <Bookmark className="inline-block w-4 h-4 mr-1" />
                                Favorites
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Search and Filters */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="mb-8"
                    >
                        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-4">
                            <div className="relative w-full sm:w-80">
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
                                    className={`w-full pl-10 pr-10 py-2 rounded-full text-sm ${
                                        isDarkMode
                                            ? "bg-gray-800 text-gray-300 border-gray-700"
                                            : "bg-gray-100 text-gray-800 border-gray-200"
                                    } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                                />
                                <Search
                                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                    } w-4 h-4`}
                                />
                                {searchQuery && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() =>
                                            dispatch({ type: "CLEAR_SEARCH" })
                                        }
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        <X
                                            className={`w-4 h-4 ${
                                                isDarkMode
                                                    ? "text-gray-400"
                                                    : "text-gray-600"
                                            }`}
                                        />
                                    </motion.button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative w-full sm:w-36">
                                    <select
                                        value={sortBy}
                                        onChange={(e) =>
                                            dispatch({
                                                type: "SET_SORT_BY",
                                                payload: e.target.value,
                                            })
                                        }
                                        className={`w-full px-3 py-2 rounded-full text-sm ${
                                            isDarkMode
                                                ? "bg-gray-800 text-gray-300 border-gray-700"
                                                : "bg-gray-100 text-gray-800 border-gray-200"
                                        } border focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none`}
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
                                    <ChevronDown
                                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                                            isDarkMode
                                                ? "text-gray-400"
                                                : "text-gray-600"
                                        } h-4 w-4`}
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                        dispatch({ type: "TOGGLE_FILTER_OPEN" })
                                    }
                                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm ${
                                        isDarkMode
                                            ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                                            : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
                                    } border transition-all duration-300`}
                                >
                                    <Filter className="w-4 h-4" />
                                    Filters
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
                                    <div
                                        className={`p-4 rounded-xl shadow-lg ${
                                            isDarkMode
                                                ? "bg-gray-800 border-gray-700"
                                                : "bg-white border-gray-200"
                                        } border mb-4`}
                                    >
                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Tags className="w-4 h-4 text-blue-500" />
                                                <h3
                                                    className={`text-sm font-semibold ${
                                                        isDarkMode
                                                            ? "text-white"
                                                            : "text-gray-900"
                                                    }`}
                                                >
                                                    {activeTab === "bookings"
                                                        ? "Status"
                                                        : "Categories"}
                                                </h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {(activeTab === "bookings"
                                                    ? bookingStatuses
                                                    : favoriteCategories
                                                ).map((filter) => (
                                                    <motion.button
                                                        key={filter}
                                                        whileHover={{
                                                            scale: 1.05,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.95,
                                                        }}
                                                        onClick={() =>
                                                            dispatch({
                                                                type: "TOGGLE_FILTER",
                                                                payload: filter,
                                                            })
                                                        }
                                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                                                            selectedFilters.includes(
                                                                filter
                                                            )
                                                                ? "bg-blue-600 text-white"
                                                                : isDarkMode
                                                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`}
                                                    >
                                                        {filter
                                                            .replace("_", " ")
                                                            .toUpperCase()}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="flex justify-between items-center mb-4">
                            <p
                                className={`text-xs ${
                                    isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                }`}
                            >
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
                            </p>
                            {selectedFilters.length > 0 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                        dispatch({ type: "CLEAR_FILTERS" })
                                    }
                                    className="text-blue-500 text-xs hover:text-blue-400 font-medium"
                                >
                                    Clear Filters
                                </motion.button>
                            )}
                        </div>
                    </motion.div>

                    {/* Cards Grid */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
                    >
                        <AnimatePresence mode="popLayout">
                            {paginatedItems.length === 0 ? (
                                <motion.div
                                    variants={fadeIn}
                                    className="col-span-full text-center py-12"
                                >
                                    <div className="max-w-sm mx-auto">
                                        <Search
                                            className={`w-12 h-12 mx-auto mb-4 ${
                                                isDarkMode
                                                    ? "text-gray-500"
                                                    : "text-gray-400"
                                            }`}
                                        />
                                        <h3
                                            className={`text-xl font-bold mb-2 ${
                                                isDarkMode
                                                    ? "text-white"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            No{" "}
                                            {activeTab === "bookings"
                                                ? "Bookings"
                                                : "Favorites"}{" "}
                                            Found
                                        </h3>
                                        <p
                                            className={`text-sm mb-4 ${
                                                isDarkMode
                                                    ? "text-gray-400"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            {activeTab === "bookings"
                                                ? "You haven't booked any trips yet. Start exploring now!"
                                                : "You haven't favorited any destinations yet."}
                                        </p>
                                        <Link
                                            href="/destinations"
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                                                isDarkMode
                                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                            } transition-all duration-300`}
                                        >
                                            Explore Destinations
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

                                    return (
                                        <motion.div
                                            key={`${activeTab}-${item.id}`}
                                            variants={cardVariants}
                                            layout
                                            whileHover={{
                                                y: -8,
                                                boxShadow:
                                                    "0 10px 20px rgba(0,0,0,0.2)",
                                                transition: { duration: 0.3 },
                                            }}
                                            className={`rounded-2xl overflow-hidden shadow-lg ${
                                                isDarkMode
                                                    ? "bg-gray-800 border-gray-700"
                                                    : "bg-white border-gray-200"
                                            } border flex flex-col group transition-all duration-300`}
                                        >
                                            <div className="relative overflow-hidden">
                                                <img
                                                    src={
                                                        entity.image ||
                                                        "https://placehold.co/640x480?text=No+Image"
                                                    }
                                                    alt={entity.title}
                                                    className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.src =
                                                            "/images/placeholder.jpg";
                                                    }}
                                                />
                                                {entity.category && (
                                                    <span className="absolute top-2 left-2 px-2 py-1 bg-blue-600 rounded-full text-xs font-medium text-white capitalize">
                                                        {entity.category}
                                                    </span>
                                                )}
                                                {isBooking && item.status && (
                                                    <span
                                                        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white capitalize ${getStatusColor(
                                                            item.status
                                                        )}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                )}
                                                {calculateDiscount(
                                                    entity.price,
                                                    entity.discount_price
                                                ) && (
                                                    <div className="absolute bottom-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                                        {calculateDiscount(
                                                            entity.price,
                                                            entity.discount_price
                                                        )}
                                                        % OFF
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 flex flex-col flex-grow">
                                                <h3
                                                    className={`text-base font-semibold mb-2 line-clamp-1 ${
                                                        isDarkMode
                                                            ? "text-white"
                                                            : "text-gray-900"
                                                    }`}
                                                >
                                                    {entity.title}
                                                </h3>
                                                {entity.location && (
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <MapPin
                                                            size={14}
                                                            className="text-blue-500"
                                                        />
                                                        <span
                                                            className={`text-xs ${
                                                                isDarkMode
                                                                    ? "text-gray-300"
                                                                    : "text-gray-600"
                                                            }`}
                                                        >
                                                            {entity.location}
                                                        </span>
                                                    </div>
                                                )}
                                                {item.company?.name && (
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <Building2
                                                            size={14}
                                                            className="text-blue-500"
                                                        />
                                                        <span
                                                            className={`text-xs ${
                                                                isDarkMode
                                                                    ? "text-gray-300"
                                                                    : "text-gray-600"
                                                            }`}
                                                        >
                                                            {item.company.name}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 mb-2">
                                                    {renderStars(
                                                        entity.rating || 0
                                                    )}
                                                    <span
                                                        className={`text-xs ml-1 ${
                                                            isDarkMode
                                                                ? "text-gray-400"
                                                                : "text-gray-500"
                                                        }`}
                                                    >
                                                        ({entity.rating || 0}/5)
                                                    </span>
                                                </div>
                                                {!isBooking &&
                                                    item.favoritable_type && (
                                                        <div className="flex items-center gap-1 mb-2">
                                                            {getFavoriteTypeIcon(
                                                                item.favoritable_type
                                                            )}
                                                            <span
                                                                className={`text-xs capitalize ${
                                                                    isDarkMode
                                                                        ? "text-gray-300"
                                                                        : "text-gray-600"
                                                                }`}
                                                            >
                                                                Favorited from:{" "}
                                                                {
                                                                    item.favoritable_type
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                {isBooking && userReview && (
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <Star
                                                            size={14}
                                                            className="text-yellow-400"
                                                        />
                                                        <span
                                                            className={`text-xs ${
                                                                isDarkMode
                                                                    ? "text-gray-300"
                                                                    : "text-gray-600"
                                                            }`}
                                                        >
                                                            Your rating:{" "}
                                                            {userReview.rating}
                                                            /5
                                                        </span>
                                                    </div>
                                                )}
                                                {isBooking &&
                                                    userReview?.comment && (
                                                        <p
                                                            className={`text-xs italic ${
                                                                isDarkMode
                                                                    ? "text-gray-400"
                                                                    : "text-gray-500"
                                                            } mb-2`}
                                                        >
                                                            Your comment:{" "}
                                                            {userReview.comment}
                                                        </p>
                                                    )}
                                                <p
                                                    className={`text-xs mb-3 line-clamp-2 ${
                                                        isDarkMode
                                                            ? "text-gray-400"
                                                            : "text-gray-600"
                                                    }`}
                                                >
                                                    {entity.description ||
                                                        "No description available."}
                                                </p>
                                                {isBooking ? (
                                                    <>
                                                        <div className="flex items-center gap-1 mb-2">
                                                            <Calendar
                                                                size={14}
                                                                className="text-blue-500"
                                                            />
                                                            <span
                                                                className={`text-xs ${
                                                                    isDarkMode
                                                                        ? "text-gray-300"
                                                                        : "text-gray-600"
                                                                }`}
                                                            >
                                                                {formatDate(
                                                                    item.check_in
                                                                )}{" "}
                                                                -{" "}
                                                                {formatDate(
                                                                    item.check_out
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 mb-2">
                                                            <Users
                                                                size={14}
                                                                className="text-blue-500"
                                                            />
                                                            <span
                                                                className={`text-xs ${
                                                                    isDarkMode
                                                                        ? "text-gray-300"
                                                                        : "text-gray-600"
                                                                }`}
                                                            >
                                                                {item.guests}{" "}
                                                                Guests
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 mb-2">
                                                            <CreditCard
                                                                size={14}
                                                                className="text-blue-500"
                                                            />
                                                            <span
                                                                className={`text-xs ${
                                                                    isDarkMode
                                                                        ? "text-gray-300"
                                                                        : "text-gray-600"
                                                                }`}
                                                            >
                                                                Payment:{" "}
                                                                {item.payment_method ||
                                                                    "Cash"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 mb-2">
                                                            <CheckCircle
                                                                size={14}
                                                                className="text-blue-500"
                                                            />
                                                            <span
                                                                className={`text-xs ${
                                                                    isDarkMode
                                                                        ? "text-gray-300"
                                                                        : "text-gray-600"
                                                                }`}
                                                            >
                                                                Code:{" "}
                                                                {item.confirmation_code ||
                                                                    "N/A"}
                                                            </span>
                                                        </div>
                                                        {item.notes && (
                                                            <p
                                                                className={`text-xs italic ${
                                                                    isDarkMode
                                                                        ? "text-gray-400"
                                                                        : "text-gray-500"
                                                                } mb-2`}
                                                            >
                                                                Notes:{" "}
                                                                {item.notes}
                                                            </p>
                                                        )}
                                                    </>
                                                ) : (
                                                    entity.end_date && (
                                                        <div className="flex items-center gap-1 mb-3">
                                                            <Calendar
                                                                size={14}
                                                                className="text-blue-500"
                                                            />
                                                            <span
                                                                className={`text-xs ${
                                                                    isDarkMode
                                                                        ? "text-gray-300"
                                                                        : "text-gray-600"
                                                                }`}
                                                            >
                                                                Valid until{" "}
                                                                {formatDate(
                                                                    entity.end_date
                                                                )}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                                <div className="mt-auto">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <span
                                                                className={`text-xs font-medium ${
                                                                    isDarkMode
                                                                        ? "text-gray-400"
                                                                        : "text-gray-600"
                                                                }`}
                                                            >
                                                                {isBooking
                                                                    ? "Total Price"
                                                                    : "Starting from"}
                                                            </span>
                                                            <div className="flex items-baseline gap-1">
                                                                {isBooking ? (
                                                                    <span className="text-base font-semibold text-blue-500">
                                                                        $
                                                                        {parseFloat(
                                                                            item.total_price
                                                                        ).toFixed(
                                                                            2
                                                                        )}
                                                                    </span>
                                                                ) : entity.discount_price ? (
                                                                    <>
                                                                        <span className="text-base font-semibold text-blue-500">
                                                                            $
                                                                            {parseFloat(
                                                                                entity.discount_price
                                                                            ).toFixed(
                                                                                2
                                                                            )}
                                                                        </span>
                                                                        <span
                                                                            className={`text-xs line-through ${
                                                                                isDarkMode
                                                                                    ? "text-gray-400"
                                                                                    : "text-gray-500"
                                                                            }`}
                                                                        >
                                                                            $
                                                                            {parseFloat(
                                                                                entity.price
                                                                            ).toFixed(
                                                                                2
                                                                            )}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-base font-semibold text-blue-500">
                                                                        $
                                                                        {parseFloat(
                                                                            entity.price
                                                                        ).toFixed(
                                                                            2
                                                                        )}
                                                                    </span>
                                                                )}
                                                                {!isBooking && (
                                                                    <span
                                                                        className={`text-xs ${
                                                                            isDarkMode
                                                                                ? "text-gray-400"
                                                                                : "text-gray-500"
                                                                        }`}
                                                                    >
                                                                        /person
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {isBooking &&
                                                            canCancelBooking(
                                                                item
                                                            ) &&
                                                            countdown && (
                                                                <motion.button
                                                                    whileHover={{
                                                                        scale: 1.05,
                                                                    }}
                                                                    whileTap={{
                                                                        scale: 0.95,
                                                                    }}
                                                                    onClick={() =>
                                                                        dispatch(
                                                                            {
                                                                                type: "SET_CANCEL_CONFIRMATION",
                                                                                payload:
                                                                                    item,
                                                                            }
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isLoading
                                                                    }
                                                                    className={`flex-1 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-1 ${
                                                                        isLoading
                                                                            ? "bg-gray-600 cursor-not-allowed"
                                                                            : "bg-red-600 text-white hover:bg-red-700"
                                                                    } transition-all duration-300`}
                                                                >
                                                                    {isLoading ? (
                                                                        <Loader
                                                                            size={
                                                                                16
                                                                            }
                                                                            className="animate-spin"
                                                                        />
                                                                    ) : (
                                                                        <X
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    )}
                                                                    Cancel (
                                                                    {countdown})
                                                                </motion.button>
                                                            )}
                                                        {isBooking &&
                                                            canRateBooking(
                                                                item
                                                            ) &&
                                                            !userReview && (
                                                                <motion.button
                                                                    whileHover={{
                                                                        scale: 1.05,
                                                                    }}
                                                                    whileTap={{
                                                                        scale: 0.95,
                                                                    }}
                                                                    onClick={() =>
                                                                        dispatch(
                                                                            {
                                                                                type: "SET_RATING_MODAL",
                                                                                payload:
                                                                                    item,
                                                                            }
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isLoading
                                                                    }
                                                                    className={`flex-1 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-1 ${
                                                                        isLoading
                                                                            ? "bg-gray-600 cursor-not-allowed"
                                                                            : "bg-yellow-600 text-white hover:bg-yellow-700"
                                                                    } transition-all duration-300`}
                                                                >
                                                                    <Star
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                    Rate
                                                                </motion.button>
                                                            )}
                                                        {isBooking &&
                                                            (!canCancelBooking(
                                                                item
                                                            ) ||
                                                                !countdown) &&
                                                            !canRateBooking(
                                                                item
                                                            ) &&
                                                            item.status !==
                                                                "completed" && (
                                                                <motion.button
                                                                    whileHover={{
                                                                        scale: 1.05,
                                                                    }}
                                                                    whileTap={{
                                                                        scale: 0.95,
                                                                    }}
                                                                    onClick={() =>
                                                                        toast.error(
                                                                            "Cancellation is only available within 12 hours of booking."
                                                                        )
                                                                    }
                                                                    className="flex-1 py-2 rounded-full text-sm font-medium bg-gray-600 text-white cursor-not-allowed transition-all duration-300"
                                                                >
                                                                    Cancel
                                                                    (Expired)
                                                                </motion.button>
                                                            )}
                                                        {!isBooking && (
                                                            <Link
                                                                href={getFavoriteDetailsUrl(
                                                                    item
                                                                )}
                                                                className="w-full inline-block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all duration-300 transform group-hover:shadow-lg"
                                                            >
                                                                View Details
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Cancel Confirmation Modal */}
                    <AnimatePresence>
                        {cancelConfirmation && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                                onClick={() =>
                                    dispatch({
                                        type: "SET_CANCEL_CONFIRMATION",
                                        payload: null,
                                    })
                                }
                            >
                                <motion.div
                                    variants={modalVariants}
                                    className={`rounded-xl max-w-md w-full p-6 ${
                                        isDarkMode ? "bg-gray-800" : "bg-white"
                                    } shadow-xl`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertCircle
                                            size={24}
                                            className="text-red-500"
                                        />
                                        <h3
                                            className={`text-lg font-semibold ${
                                                isDarkMode
                                                    ? "text-white"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            Confirm Cancellation
                                        </h3>
                                    </div>
                                    <p
                                        className={`text-sm mb-6 ${
                                            isDarkMode
                                                ? "text-gray-300"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        Are you sure you want to cancel your
                                        booking for{" "}
                                        <strong>
                                            {cancelConfirmation.offer?.title ||
                                                cancelConfirmation.package
                                                    ?.title ||
                                                cancelConfirmation.destination
                                                    ?.title}
                                        </strong>
                                        ? This action cannot be undone.
                                    </p>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                dispatch({
                                                    type: "SET_CANCEL_CONFIRMATION",
                                                    payload: null,
                                                })
                                            }
                                            className={`flex-1 py-2 rounded-full text-sm font-medium ${
                                                isDarkMode
                                                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                            }`}
                                        >
                                            Keep Booking
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                handleCancelBooking(
                                                    cancelConfirmation.id
                                                )
                                            }
                                            disabled={isLoading}
                                            className={`flex-1 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-1 ${
                                                isLoading
                                                    ? "bg-gray-600 cursor-not-allowed"
                                                    : "bg-red-600 text-white hover:bg-red-700"
                                            }`}
                                        >
                                            {isLoading && (
                                                <Loader
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            )}
                                            Confirm Cancellation
                                        </motion.button>
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
                                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                                onClick={() =>
                                    dispatch({
                                        type: "SET_RATING_MODAL",
                                        payload: null,
                                    })
                                }
                            >
                                <motion.div
                                    variants={modalVariants}
                                    className={`rounded-xl max-w-md w-full p-6 ${
                                        isDarkMode ? "bg-gray-800" : "bg-white"
                                    } shadow-xl`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <Star
                                            size={24}
                                            className="text-yellow-400"
                                        />
                                        <h3
                                            className={`text-lg font-semibold ${
                                                isDarkMode
                                                    ? "text-white"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            Rate Your Experience
                                        </h3>
                                    </div>
                                    <p
                                        className={`text-sm mb-4 ${
                                            isDarkMode
                                                ? "text-gray-300"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        How would you rate{" "}
                                        <strong>
                                            {ratingModal.offer?.title ||
                                                ratingModal.package?.title ||
                                                ratingModal.destination?.title}
                                        </strong>
                                        ?
                                    </p>
                                    <div className="flex justify-center gap-2 mb-4">
                                        {renderStars(selectedRating, true)}
                                    </div>
                                    <div className="mb-4">
                                        <label
                                            className={`text-sm font-medium ${
                                                isDarkMode
                                                    ? "text-gray-300"
                                                    : "text-gray-900"
                                            }`}
                                            htmlFor="rating-comment"
                                        >
                                            Comment (Optional)
                                        </label>
                                        <textarea
                                            id="rating-comment"
                                            value={ratingComment}
                                            onChange={(e) =>
                                                dispatch({
                                                    type: "SET_RATING_COMMENT",
                                                    payload: e.target.value,
                                                })
                                            }
                                            placeholder="Share your experience..."
                                            className={`w-full p-2 mt-1 rounded-md border ${
                                                isDarkMode
                                                    ? "bg-gray-700 text-gray-300 border-gray-600"
                                                    : "bg-gray-100 text-gray-900 border-gray-200"
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 resize-none h-24`}
                                            maxLength={500}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                dispatch({
                                                    type: "SET_RATING_MODAL",
                                                    payload: null,
                                                })
                                            }
                                            className={`flex-1 py-2 rounded-full text-sm font-medium ${
                                                isDarkMode
                                                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                            }`}
                                        >
                                            Cancel
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                handleSubmitRating(ratingModal)
                                            }
                                            disabled={
                                                isLoading || !selectedRating
                                            }
                                            className={`flex-1 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-1 ${
                                                isLoading || !selectedRating
                                                    ? "bg-gray-600 cursor-not-allowed"
                                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                            } transition-all duration-300`}
                                        >
                                            {isLoading && (
                                                <Loader
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            )}
                                            Submit Rating
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pagination */}
                    {filteredItems.length > 0 && totalPages > 0 && (
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeIn}
                            className="flex justify-center items-center gap-2 mb-12"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                    dispatch({
                                        type: "SET_CURRENT_PAGE",
                                        payload: Math.max(1, currentPage - 1),
                                    })
                                }
                                disabled={currentPage === 1}
                                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                    currentPage === 1
                                        ? isDarkMode
                                            ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : isDarkMode
                                        ? "bg-gray-800 text-white hover:bg-gray-700"
                                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                } transition-all duration-300`}
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
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= startPage && page <= endPage)
                                    ) {
                                        return (
                                            <motion.button
                                                key={page}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() =>
                                                    dispatch({
                                                        type: "SET_CURRENT_PAGE",
                                                        payload: page,
                                                    })
                                                }
                                                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                                                    currentPage === page
                                                        ? "bg-blue-600 text-white"
                                                        : isDarkMode
                                                        ? "bg-gray-800 text-white hover:bg-gray-700"
                                                        : "bg-gray-200 text-gray-800 hover:bg-blue-100"
                                                } transition-all duration-300`}
                                            >
                                                {page}
                                            </motion.button>
                                        );
                                    }
                                    if (page === startPage - 1 && page > 1) {
                                        return (
                                            <span
                                                key="ellipsis-start"
                                                className={`text-sm ${
                                                    isDarkMode
                                                        ? "text-gray-500"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                ...
                                            </span>
                                        );
                                    }
                                    if (
                                        page === endPage + 1 &&
                                        page < totalPages
                                    ) {
                                        return (
                                            <span
                                                key="ellipsis-end"
                                                className={`text-sm ${
                                                    isDarkMode
                                                        ? "text-gray-500"
                                                        : "text-gray-400"
                                                }`}
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
                                    dispatch({
                                        type: "SET_CURRENT_PAGE",
                                        payload: Math.min(
                                            currentPage + 1,
                                            totalPages
                                        ),
                                    })
                                }
                                disabled={currentPage === totalPages}
                                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                    currentPage === totalPages
                                        ? isDarkMode
                                            ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : isDarkMode
                                        ? "bg-gray-800 text-white hover:bg-gray-700"
                                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                } transition-all duration-300`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </section>

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

export default UserBookings;
