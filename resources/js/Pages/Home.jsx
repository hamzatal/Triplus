import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    ArrowRight,
    MessageCircle,
    X,
    Heart,
    Shield,
    Tag,
    Award,
    Compass,
    Sun,
    ArrowLeft,
    ArrowRight as ChevronRight,
    Calendar,
    Users,
    Search,
    Sparkles,
    CircleX,
    Globe2,
    Building,
    Star,
    Clock,
    Map,
    Mountain,
    Umbrella,
} from "lucide-react";
import { Head, usePage, Link } from "@inertiajs/react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../Components/Nav";
import Footer from "../Components/Footer";
import ChatBot from "../Components/ChatBot";

// Offer Card Component
const OfferCard = React.memo(
    ({
        offer,
        translations,
        isDarkMode,
        calculateDiscount,
        toggleFavorite,
        favorites,
        loadingFavorite,
    }) => {
        return (
            <motion.div
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`rounded-2xl overflow-hidden shadow-lg ${
                    isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                } border hover:shadow-xl transition-all duration-300 group flex flex-col h-full`}
            >
                <div className="relative overflow-hidden h-56">
                    <img
                        src={offer.image || "/images/placeholder-offer.jpg"}
                        alt={offer.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) =>
                            (e.target.src = "/images/placeholder-offer.jpg")
                        }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                        {offer.category && (
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
                                {offer.category}
                            </div>
                        )}
                        <button
                            onClick={() => toggleFavorite(offer.id, "offer_id")}
                            disabled={loadingFavorite[`offer_${offer.id}`]}
                            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${
                                favorites[`offer_${offer.id}`]?.is_favorite
                                    ? "bg-red-500 hover:bg-red-600 shadow-lg"
                                    : "bg-white/20 hover:bg-white/40"
                            } ${
                                loadingFavorite[`offer_${offer.id}`]
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                            aria-label={
                                favorites[`offer_${offer.id}`]?.is_favorite
                                    ? "Remove from favorites"
                                    : "Add to favorites"
                            }
                        >
                            <Heart
                                size={18}
                                className={
                                    favorites[`offer_${offer.id}`]?.is_favorite
                                        ? "text-white fill-white"
                                        : "text-white"
                                }
                            />
                        </button>
                    </div>
                    {calculateDiscount(offer.price, offer.discount_price) && (
                        <div className="absolute top-16 right-0 bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1 rounded-l-full text-xs font-bold shadow-lg">
                            {calculateDiscount(
                                offer.price,
                                offer.discount_price
                            )}
                            % OFF
                        </div>
                    )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <div className="mb-2">
                        <h3
                            className={`text-lg font-semibold ${
                                isDarkMode ? "text-white" : "text-gray-900"
                            } line-clamp-1`}
                        >
                            {offer.title}
                        </h3>
                        <p
                            className={`text-sm ${
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                            } line-clamp-1`}
                        >
                            {offer.company_name || "Triplus"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <MapPin
                                size={14}
                                className="text-blue-600 flex-shrink-0"
                            />
                            <span
                                className={`text-sm ${
                                    isDarkMode
                                        ? "text-gray-300"
                                        : "text-gray-600"
                                } line-clamp-1`}
                            >
                                {offer.destination_location}
                            </span>
                        </div>
                    </div>
                    {offer.description && (
                        <p
                            className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            } mb-3 line-clamp-2`}
                        >
                            {offer.description}
                        </p>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center">
                            <Calendar
                                size={14}
                                className={
                                    isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                }
                            />
                            <span
                                className={`text-xs ${
                                    isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                } ml-1`}
                            >
                                {new Date(
                                    offer.start_date
                                ).toLocaleDateString() || "N/A"}{" "}
                                -{" "}
                                {new Date(
                                    offer.end_date
                                ).toLocaleDateString() || "N/A"}
                            </span>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <div
                            className={`flex items-center justify-between pt-3 border-t ${
                                isDarkMode
                                    ? "border-gray-700"
                                    : "border-gray-200"
                            }`}
                        >
                            <div>
                                <span
                                    className={`block text-xs font-medium ${
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {translations.starting_from ||
                                        "Starting from"}
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-blue-600 font-bold text-base">
                                        ${offer.discount_price || offer.price}
                                    </span>
                                    {offer.discount_price && (
                                        <span
                                            className={`text-xs ${
                                                isDarkMode
                                                    ? "text-gray-500"
                                                    : "text-gray-400"
                                            } line-through`}
                                        >
                                            ${offer.price}
                                        </span>
                                    )}
                                    <span
                                        className={`text-xs ${
                                            isDarkMode
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {translations.per_night || "/ night"}
                                    </span>
                                </div>
                            </div>
                            <Link
                                href={`/offers/${offer.id}`}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                                aria-label={`View ${offer.title} details`}
                            >
                                {translations.details || "Details"}
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }
);

// Destination Card Component
const DestinationCard = React.memo(
    ({
        destination,
        translations,
        isDarkMode,
        calculateDiscount,
        toggleFavorite,
        favorites,
        loadingFavorite,
    }) => {
        return (
            <motion.div
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`rounded-2xl overflow-hidden shadow-lg ${
                    isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                } border hover:shadow-xl transition-all duration-300 group flex flex-col h-full`}
            >
                <div className="relative overflow-hidden h-56">
                    <img
                        src={
                            destination.image ||
                            "/images/placeholder-destination.jpg"
                        }
                        alt={destination.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) =>
                            (e.target.src =
                                "/images/placeholder-destination.jpg")
                        }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                        {destination.category && (
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
                                {destination.category}
                            </div>
                        )}
                        <button
                            onClick={() =>
                                toggleFavorite(destination.id, "destination_id")
                            }
                            disabled={
                                loadingFavorite[`destination_${destination.id}`]
                            }
                            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${
                                favorites[`destination_${destination.id}`]
                                    ?.is_favorite
                                    ? "bg-red-500 hover:bg-red-600 shadow-lg"
                                    : "bg-white/20 hover:bg-white/40"
                            } ${
                                loadingFavorite[`destination_${destination.id}`]
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                            aria-label={
                                favorites[`destination_${destination.id}`]
                                    ?.is_favorite
                                    ? "Remove from favorites"
                                    : "Add to favorites"
                            }
                        >
                            <Heart
                                size={18}
                                className={
                                    favorites[`destination_${destination.id}`]
                                        ?.is_favorite
                                        ? "text-white fill-white"
                                        : "text-white"
                                }
                            />
                        </button>
                    </div>
                    {calculateDiscount(
                        destination.price,
                        destination.discount_price
                    ) && (
                        <div className="absolute top-16 right-0 bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1 rounded-l-full text-xs font-bold shadow-lg">
                            {calculateDiscount(
                                destination.price,
                                destination.discount_price
                            )}
                            % OFF
                        </div>
                    )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <div className="mb-2">
                        <h3
                            className={`text-lg font-semibold ${
                                isDarkMode ? "text-white" : "text-gray-900"
                            } line-clamp-1`}
                        >
                            {destination.title}
                        </h3>
                        <p
                            className={`text-sm ${
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                            } line-clamp-1`}
                        >
                            {destination.company_name || "Triplus"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <MapPin
                                size={14}
                                className="text-blue-600 flex-shrink-0"
                            />
                            <span
                                className={`text-sm ${
                                    isDarkMode
                                        ? "text-gray-300"
                                        : "text-gray-600"
                                } line-clamp-1`}
                            >
                                {destination.location}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center">
                            <Calendar
                                size={14}
                                className={
                                    isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                }
                            />
                            <span
                                className={`text-xs ${
                                    isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                } ml-1`}
                            >
                                {destination.duration || "3-7 days"}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <Users
                                size={14}
                                className={
                                    isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                }
                            />
                            <span
                                className={`text-xs ${
                                    isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                } ml-1`}
                            >
                                {destination.group_size || "2-8 people"}
                            </span>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <div
                            className={`flex items-center justify-between pt-3 border-t ${
                                isDarkMode
                                    ? "border-gray-700"
                                    : "border-gray-200"
                            }`}
                        >
                            <div>
                                <span
                                    className={`block text-xs font-medium ${
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {translations.starting_from ||
                                        "Starting from"}
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-blue-600 font-bold text-base">
                                        $
                                        {destination.discount_price ||
                                            destination.price}
                                    </span>
                                    {destination.discount_price && (
                                        <span
                                            className={`text-xs ${
                                                isDarkMode
                                                    ? "text-gray-500"
                                                    : "text-gray-400"
                                            } line-through`}
                                        >
                                            ${destination.price}
                                        </span>
                                    )}
                                    <span
                                        className={`text-xs ${
                                            isDarkMode
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {translations.per_night || "/ night"}
                                    </span>
                                </div>
                            </div>
                            <Link
                                href={`/destinations/${destination.id}`}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                                aria-label={`View ${destination.title} details`}
                            >
                                {translations.details || "Details"}
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, isDarkMode }) => {
    const pages = [...Array(totalPages).keys()].map((i) => i + 1);
    const pageRange = 2;
    const startPage = Math.max(1, currentPage - pageRange);
    const endPage = Math.min(totalPages, currentPage + pageRange);

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-full ${
                    isDarkMode
                        ? "bg-gray-700 text-white hover:bg-blue-600"
                        : "bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white"
                } disabled:opacity-50 transition-all duration-300 shadow-md`}
                aria-label="Previous page"
            >
                <ArrowLeft size={20} />
            </button>
            {pages
                .filter((page) => page >= startPage && page <= endPage)
                .map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                            currentPage === page
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                                : isDarkMode
                                ? "bg-gray-700 text-white hover:bg-blue-600"
                                : "bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white"
                        } transition-all duration-300 shadow-md`}
                        aria-label={`Go to page ${page}`}
                    >
                        {page}
                    </button>
                ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full ${
                    isDarkMode
                        ? "bg-gray-700 text-white hover:bg-blue-600"
                        : "bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white"
                } disabled:opacity-50 transition-all duration-300 shadow-md`}
                aria-label="Next page"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

const HomePage = ({ auth, favorites: initialFavorites = [] }) => {
    const { props } = usePage();
    const {
        heroSections = [],
        flash = {},
        offers = [],
        destinations = [],
        packages = [],
        translations = {},
    } = props;
    const user = auth?.user || null;
    const successMessage = flash?.success || null;
    const searchRef = useRef(null);

    // Initialize dark mode from localStorage or system preference
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem("darkMode");
        if (savedMode !== null) {
            return savedMode === "true";
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [suggestions, setSuggestions] = useState([]);
    const [offerPage, setOfferPage] = useState(1);
    const [destinationPage, setDestinationPage] = useState(1);
    const [favorites, setFavorites] = useState(() => {
        const initial = {};
        initialFavorites.forEach((fav) => {
            const type = fav.favoritable_type.toLowerCase();
            const id = fav.favoritable_id;
            initial[`${type}_${id}`] = {
                is_favorite: true,
                favorite_id: fav.id,
            };
        });
        // Merge with offers and destinations
        offers.forEach((offer) => {
            if (!initial[`offer_${offer.id}`]) {
                initial[`offer_${offer.id}`] = {
                    is_favorite: offer.is_favorite || false,
                    favorite_id: offer.favorite_id || null,
                };
            }
        });
        destinations.forEach((destination) => {
            if (!initial[`destination_${destination.id}`]) {
                initial[`destination_${destination.id}`] = {
                    is_favorite: destination.is_favorite || false,
                    favorite_id: destination.favorite_id || null,
                };
            }
        });
        return initial;
    });
    const [loadingFavorite, setLoadingFavorite] = useState({});
    const itemsPerPage = 4;

    // Persist dark mode to localStorage
    useEffect(() => {
        localStorage.setItem("darkMode", isDarkMode);
        document.documentElement.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

    // Show flash messages as toasts
    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Feature toggles
    const toggleChat = useCallback(() => setIsChatOpen((prev) => !prev), []);
    const handleCloseTooltip = useCallback(
        () => setIsTooltipVisible(false),
        []
    );
    const toggleDarkMode = useCallback(
        () => setIsDarkMode((prev) => !prev),
        []
    );

    // Scroll to search section
    const scrollToSearch = useCallback(() => {
        searchRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Auto hide tooltip after delay
    useEffect(() => {
        const timer = setTimeout(() => setIsTooltipVisible(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    // Auto advance slider for hero sections
    useEffect(() => {
        if (heroSections.length > 1) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % heroSections.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [heroSections]);

    // Toggle favorite with optimistic update
    const toggleFavorite = useCallback(
        async (itemId, itemType) => {
            if (!user) {
                toast.error("Please log in to add to favorites");
                return { success: false };
            }

            const key = `${itemType.split("_")[0]}_${itemId}`;
            const prevState = { ...favorites[key] } || {
                is_favorite: false,
                favorite_id: null,
            };

            // Optimistic update
            setFavorites((prev) => ({
                ...prev,
                [key]: {
                    is_favorite: !prevState.is_favorite,
                    favorite_id: prevState.is_favorite ? null : "temp",
                },
            }));
            setLoadingFavorite((prev) => ({ ...prev, [key]: true }));

            try {
                const response = await axios.post("/favorites", {
                    [itemType]: itemId,
                });

                const { success, message, is_favorite, favorite_id } =
                    response.data;

                if (success) {
                    setFavorites((prev) => ({
                        ...prev,
                        [key]: { is_favorite, favorite_id },
                    }));
                    toast.success(message);
                    return { success: true };
                } else {
                    toast.error(message);
                    setFavorites((prev) => ({ ...prev, [key]: prevState }));
                    return { success: false };
                }
            } catch (error) {
                const errorMessage =
                    error.response?.data?.message ||
                    "Failed to toggle favorite";
                toast.error(errorMessage);
                setFavorites((prev) => ({ ...prev, [key]: prevState }));
                return { success: false };
            } finally {
                setLoadingFavorite((prev) => ({ ...prev, [key]: false }));
            }
        },
        [user, favorites]
    );

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            const lowerQuery = searchQuery.toLowerCase();
            const allItems = [
                ...destinations.map((d) => ({
                    ...d,
                    type: "destination",
                    name: d.title,
                    location: d.location,
                    destination_name: d.title,
                })),
                ...offers.map((o) => ({
                    ...o,
                    type: "offer",
                    name: o.title,
                    location: o.destination_location,
                    destination_name: o.destination_title,
                })),
                ...packages.map((p) => ({
                    ...p,
                    type: "package",
                    name: p.title,
                    location: p.destination_location,
                    destination_name: p.destination_title,
                })),
            ];
            const filtered = allItems
                .filter((item) => {
                    const matchesQuery =
                        (item.name?.toLowerCase().includes(lowerQuery) ||
                            item.title?.toLowerCase().includes(lowerQuery) ||
                            item.description
                                ?.toLowerCase()
                                .includes(lowerQuery) ||
                            item.location?.toLowerCase().includes(lowerQuery) ||
                            item.destination_name
                                ?.toLowerCase()
                                .includes(lowerQuery)) &&
                        (selectedCategory === "all" ||
                            item.category?.toLowerCase() ===
                                selectedCategory.toLowerCase());
                    return matchesQuery;
                })
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 3);
            setSuggestions(filtered);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery, selectedCategory, destinations, offers, packages]);

    // Calculate discount percentage
    const calculateDiscount = useCallback((original, discounted) => {
        if (
            !discounted ||
            original <= discounted ||
            isNaN(original) ||
            isNaN(discounted)
        )
            return null;
        return Math.round(((original - discounted) / original) * 100);
    }, []);

    // Handle "Surprise Me" button
    const handleSurpriseMe = useCallback(() => {
        const allItems = [
            ...destinations.map((d) => ({
                ...d,
                type: "destination",
                name: d.title,
                location: d.location,
                destination_name: d.title,
            })),
            ...offers.map((o) => ({
                ...o,
                type: "offer",
                name: o.title,
                location: o.destination_location,
                destination_name: o.destination_title,
            })),
            ...packages.map((p) => ({
                ...p,
                type: "package",
                name: p.title,
                location: p.destination_location,
                destination_name: p.destination_title,
            })),
        ];
        const shuffled = allItems.sort(() => Math.random() - 0.5);
        setSuggestions(shuffled.slice(0, 3));
    }, [destinations, offers, packages]);

    // Clear search input
    const clearSearch = useCallback(() => {
        setSearchQuery("");
        setSuggestions([]);
    }, []);

    // Pagination for offers and destinations
    const paginatedOffers = useMemo(() => {
        const start = (offerPage - 1) * itemsPerPage;
        return offers.slice(start, start + itemsPerPage);
    }, [offers, offerPage]);

    const paginatedDestinations = useMemo(() => {
        const start = (destinationPage - 1) * itemsPerPage;
        return destinations.slice(start, start + itemsPerPage);
    }, [destinations, destinationPage]);

    const totalOfferPages = Math.ceil(offers.length / itemsPerPage);
    const totalDestinationPages = Math.ceil(destinations.length / itemsPerPage);

    // Categories with icons
    const categories = [
        { name: "All", icon: Compass },
        { name: "Beach", icon: Umbrella },
        { name: "Adventure", icon: MapPin },
        { name: "Cultural", icon: Building },
        { name: "Historical", icon: Clock },
        { name: "Wildlife", icon: Globe2 },
        { name: "Mountain", icon: Mountain },
    ];

    return (
        <div
            className={`min-h-screen ${
                isDarkMode
                    ? "dark bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-900"
            } transition-all duration-300`}
            data-dark-mode={isDarkMode}
        >
            <Head>
                <title>Triplus - Your Adventure Awaits</title>
                <meta
                    name="description"
                    content="Discover unforgettable trips, explore stunning destinations, and book the best travel deals with Triplus."
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="true"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Navbar
                user={user}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
            />

            {/* Hero Carousel Section */}
            <section className="relative h-screen w-full overflow-hidden">
                {heroSections.length === 0 ? (
                    <div
                        className={`absolute inset-0 flex items-center justify-center ${
                            isDarkMode
                                ? "bg-gradient-to-r from-gray-900 to-gray-800"
                                : "bg-gradient-to-r from-gray-200 to-gray-300"
                        } text-center p-6`}
                    >
                        <p
                            className={`text-xl ${
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                        >
                            No hero sections available. Please add some in the
                            admin dashboard.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gray-900">
                            <AnimatePresence initial={false}>
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 0.8,
                                        ease: [0.4, 0, 0.2, 1],
                                    }}
                                    className="absolute inset-0"
                                >
                                    <div className="relative w-full h-full">
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
                                        <img
                                            src={
                                                heroSections[currentSlide]
                                                    ?.image ||
                                                "/images/placeholder-hero.jpg"
                                            }
                                            alt={
                                                heroSections[currentSlide]
                                                    ?.title || "Hero Image"
                                            }
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) =>
                                                (e.target.src =
                                                    "/images/placeholder-hero.jpg")
                                            }
                                        />
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 z-10 pt-44">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="max-w-5xl mx-auto text-center px-6"
                            >
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-xl">
                                    {heroSections[currentSlide]?.title ||
                                        "Welcome to Triplus"}
                                </h1>
                                <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl mx-auto font-light drop-shadow-md">
                                    {heroSections[currentSlide]?.subtitle ||
                                        "Plan your next adventure with us."}
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                                    <Link
                                        href="/booking"
                                        className="px-8 py-4 bg-white text-gray-900 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 font-semibold text-lg min-w-48 text-center hover:scale-105 transform"
                                        aria-label="Start planning your trip"
                                    >
                                        {heroSections[currentSlide]?.cta_text ||
                                            "Start Planning"}
                                    </Link>
                                    <button
                                        onClick={scrollToSearch}
                                        className="flex items-center gap-2 px-8 py-4 border-2 border-white/80 rounded-full hover:bg-white/10 transition-all duration-300 font-medium text-white hover:scale-105 transform"
                                        aria-label="Search for destinations"
                                    >
                                        <Search size={20} />
                                        Find Your Destination
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-10 z-20">
                            <button
                                onClick={() =>
                                    setCurrentSlide((prev) =>
                                        prev === 0
                                            ? heroSections.length - 1
                                            : prev - 1
                                    )
                                }
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 shadow-lg hover:scale-110 transform"
                                aria-label="Previous slide"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <button
                                onClick={() =>
                                    setCurrentSlide((prev) =>
                                        prev === heroSections.length - 1
                                            ? 0
                                            : prev + 1
                                    )
                                }
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 shadow-lg hover:scale-110 transform"
                                aria-label="Next slide"
                            >
                                <ArrowRight size={24} />
                            </button>
                        </div>

                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-20">
                            {heroSections.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-1 rounded-full transition-all duration-300 ${
                                        currentSlide === index
                                            ? "w-8 bg-white"
                                            : "w-3 bg-white/50"
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                ></button>
                            ))}
                        </div>
                    </>
                )}
            </section>

            {/* Journey Planner Section */}
            <section
                className={`relative py-16 ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                } -mt-0 z-20`}
                ref={searchRef}
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`relative ${
                            isDarkMode
                                ? "bg-gray-900 border-gray-700"
                                : "bg-white border-gray-200"
                        } rounded-3xl p-8 shadow-2xl border`}
                    >
                        <h2
                            className={`text-3xl md:text-4xl font-bold text-center ${
                                isDarkMode ? "text-white" : "text-gray-800"
                            } mb-4`}
                        >
                            {translations.journey_planner_title ||
                                "Discover Your Next Adventure"}{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Adventure
                            </span>
                        </h2>
                        <p
                            className={`text-lg ${
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                            } text-center mb-8 max-w-2xl mx-auto`}
                        >
                            {translations.journey_planner_subtitle ||
                                "Search for your favorite destinations or browse new offers and packages"}
                        </p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative flex items-center mb-8"
                        >
                            <div className="relative w-full max-w-3xl mx-auto">
                                <Search
                                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                                        isDarkMode
                                            ? "text-blue-400"
                                            : "text-blue-600"
                                    }`}
                                    size={24}
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder={
                                        translations.search_placeholder ||
                                        "Search for destinations, offers, or packages..."
                                    }
                                    className={`w-full pl-12 pr-12 py-4 ${
                                        isDarkMode
                                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                                            : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400"
                                    } border rounded-full text-lg font-light focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 shadow-md`}
                                    aria-label="Search destinations, offers, or packages"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                                            isDarkMode
                                                ? "text-gray-400 hover:text-gray-200"
                                                : "text-gray-500 hover:text-gray-800"
                                        } transition-all duration-300`}
                                        aria-label="Clear search"
                                    >
                                        <X size={24} />
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
                        >
                            <div className="flex flex-wrap justify-center gap-3">
                                {categories.map((category) => {
                                    const Icon = category.icon;
                                    return (
                                        <motion.button
                                            key={category.name}
                                            whileHover={{
                                                scale: 1.1,
                                                boxShadow:
                                                    "0 0 10px rgba(59, 130, 246, 0.3)",
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                setSelectedCategory(
                                                    category.name.toLowerCase()
                                                )
                                            }
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                                selectedCategory ===
                                                category.name.toLowerCase()
                                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                                                    : isDarkMode
                                                    ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600"
                                                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                                            } border`}
                                            aria-label={`Filter by ${category.name}`}
                                        >
                                            <Icon size={16} />
                                            {category.name}
                                        </motion.button>
                                    );
                                })}
                            </div>
                            <motion.button
                                whileHover={{
                                    scale: 1.1,
                                    boxShadow:
                                        "0 0 15px rgba(59, 130, 246, 0.5)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSurpriseMe}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold hover:shadow-lg"
                                aria-label="Get random travel suggestions"
                            >
                                <Sparkles size={20} />
                                {translations.surprise_me || "Surprise Me"}
                            </motion.button>
                        </motion.div>

                        <AnimatePresence>
                            {suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                                >
                                    {suggestions.map((item) => (
                                        <Link
                                            key={`${item.type}-${item.id}`}
                                            href={
                                                item.type === "destination"
                                                    ? `/destinations/${item.id}`
                                                    : item.type === "offer"
                                                    ? `/offers/${item.id}`
                                                    : `/packages/${item.id}`
                                            }
                                            className={`relative ${
                                                isDarkMode
                                                    ? "bg-gray-800 border-gray-700"
                                                    : "bg-white border-gray-200"
                                            } rounded-xl p-4 hover:bg-opacity-90 transition-all duration-300 shadow-md border group hover:shadow-lg`}
                                            aria-label={`View ${
                                                item.name || item.title
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={
                                                        item.image ||
                                                        "/images/placeholder-small.jpg"
                                                    }
                                                    alt={
                                                        item.name || item.title
                                                    }
                                                    className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                    onError={(e) =>
                                                        (e.target.src =
                                                            "/images/placeholder-small.jpg")
                                                    }
                                                />
                                                <div>
                                                    <h3
                                                        className={`text-lg font-semibold ${
                                                            isDarkMode
                                                                ? "text-white"
                                                                : "text-gray-800"
                                                        }`}
                                                    >
                                                        {item.name ||
                                                            item.title}
                                                    </h3>
                                                    <p
                                                        className={`text-sm ${
                                                            isDarkMode
                                                                ? "text-gray-300"
                                                                : "text-gray-600"
                                                        }`}
                                                    >
                                                        {item.location ||
                                                            item.destination_name ||
                                                            "Unknown"}
                                                    </p>
                                                    <p className="text-blue-600 text-sm font-medium">
                                                        $
                                                        {item.discount_price ||
                                                            item.price}
                                                    </p>
                                                </div>
                                            </div>
                                            {calculateDiscount(
                                                item.price,
                                                item.discount_price
                                            ) && (
                                                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                                                    {calculateDiscount(
                                                        item.price,
                                                        item.discount_price
                                                    )}
                                                    % OFF
                                                </div>
                                            )}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </section>

            {/* Featured Promotions */}
            <section
                className={`py-16 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2
                                    className={`text-3xl font-bold ${
                                        isDarkMode
                                            ? "text-white"
                                            : "text-gray-900"
                                    }`}
                                >
                                    {translations.offers_section_title ||
                                        "Featured Offers"}
                                </h2>
                                <p
                                    className={`mt-2 ${
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                    }`}
                                >
                                    {translations.offers_section_subtitle ||
                                        "Exclusive deals and promotions for your next trip"}
                                </p>
                            </div>
                            <Link
                                href="/offers"
                                className="flex items-center gap-1 text-blue-600 hover:underline"
                                aria-label="View all offers"
                            >
                                {translations.view_all || "View All"}{" "}
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        {paginatedOffers.length === 0 ? (
                            <div
                                className={`text-center ${
                                    isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                } py-8`}
                            >
                                {translations.offers_empty_message ||
                                    "No offers available at the moment."}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                            >
                                {paginatedOffers.map((offer) => (
                                    <OfferCard
                                        key={offer.id}
                                        offer={offer}
                                        translations={translations}
                                        isDarkMode={isDarkMode}
                                        calculateDiscount={calculateDiscount}
                                        toggleFavorite={toggleFavorite}
                                        favorites={favorites}
                                        loadingFavorite={loadingFavorite}
                                    />
                                ))}
                            </motion.div>
                        )}
                        {totalOfferPages > 1 && (
                            <Pagination
                                currentPage={offerPage}
                                totalPages={totalOfferPages}
                                onPageChange={setOfferPage}
                                isDarkMode={isDarkMode}
                            />
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Trending Destinations Section */}
            <section
                className={`py-24 ${
                    isDarkMode
                        ? "bg-gray-800"
                        : "bg-gradient-to-b from-gray-50 to-white"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-12 text-center md:text-left"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                                <h2
                                    className={`text-3xl md:text-4xl font-extrabold ${
                                        isDarkMode
                                            ? "text-white"
                                            : "text-gray-900"
                                    }`}
                                >
                                    {translations.destinations_section_title ||
                                        "Trending Destinations"}
                                </h2>
                                <p
                                    className={`mt-3 text-lg ${
                                        isDarkMode
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }`}
                                >
                                    {translations.destinations_subtitle ||
                                        "Discover our most popular vacation spots loved by travelers worldwide"}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {paginatedDestinations.length === 0 ? (
                        <div
                            className={`text-center ${
                                isDarkMode
                                    ? "text-gray-400 bg-gray-900"
                                    : "text-gray-500 bg-gray-200"
                            } py-16 bg-opacity-10 rounded-xl`}
                        >
                            <Compass
                                size={48}
                                className="mx-auto mb-4 opacity-50"
                            />
                            <p className="text-lg font-medium">
                                {translations.destinations_empty_title ||
                                    "No destinations available at the moment."}
                            </p>
                            <p className="mt-2">
                                {translations.destinations_empty_subtitle ||
                                    "Please check back later for new exciting locations."}
                            </p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {paginatedDestinations.map((destination) => (
                                <DestinationCard
                                    key={destination.id}
                                    destination={destination}
                                    translations={translations}
                                    isDarkMode={isDarkMode}
                                    calculateDiscount={calculateDiscount}
                                    toggleFavorite={toggleFavorite}
                                    favorites={favorites}
                                    loadingFavorite={loadingFavorite}
                                />
                            ))}
                        </motion.div>
                    )}
                    {totalDestinationPages > 1 && (
                        <Pagination
                            currentPage={destinationPage}
                            totalPages={totalDestinationPages}
                            onPageChange={setDestinationPage}
                            isDarkMode={isDarkMode}
                        />
                    )}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="text-center mt-12"
                    >
                        <Link
                            href="/destinations"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                            aria-label="Explore all destinations"
                        >
                            {translations.explore_all_destinations ||
                                "Explore All Destinations"}{" "}
                            <ArrowRight size={18} />
                        </Link>
                        <p
                            className={`mt-4 text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                        >
                            {translations.over_200_destinations ||
                                "Over 200+ exotic locations to discover around the world"}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Benefits Section */}
            <section
                className={`py-20 ${
                    isDarkMode
                        ? "bg-gray-900"
                        : "bg-gradient-to-b from-white to-gray-50"
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2
                            className={`text-3xl font-bold mb-12 text-center ${
                                isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                        >
                            {translations.benefits_section_title ||
                                "Why Choose Triplus"}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {(
                                translations.benefits || [
                                    {
                                        title: "Best Price Guarantee",
                                        description:
                                            "We guarantee the best prices compared to anywhere else.",
                                    },
                                    {
                                        title: "Secure Booking",
                                        description:
                                            "Your personal information and payments are always protected.",
                                    },
                                    {
                                        title: "High-Quality Service",
                                        description:
                                            "Our support team is available 24/7 to assist you.",
                                    },
                                    {
                                        title: "Loyalty Rewards",
                                        description:
                                            "Earn points with every booking and enjoy exclusive benefits.",
                                    },
                                ]
                            ).map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ y: -5 }}
                                    className={`p-6 rounded-xl ${
                                        isDarkMode
                                            ? "bg-gray-800 hover:bg-gray-700"
                                            : "bg-white hover:bg-gray-50"
                                    } shadow-md hover:shadow-lg transition-all duration-300`}
                                >
                                    <div
                                        className={`inline-flex items-center justify-center p-4 rounded-full mb-6 ${
                                            isDarkMode
                                                ? "bg-blue-900 text-blue-400"
                                                : "bg-blue-100 text-blue-600"
                                        }`}
                                    >
                                        {index === 0 && <Tag size={24} />}
                                        {index === 1 && <Shield size={24} />}
                                        {index === 2 && <Award size={24} />}
                                        {index === 3 && <Users size={24} />}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">
                                        {benefit.title}
                                    </h3>
                                    <p
                                        className={
                                            isDarkMode
                                                ? "text-gray-300"
                                                : "text-gray-600"
                                        }
                                    >
                                        {benefit.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer isDarkMode={isDarkMode} />

            {/* Chat Bot & Helpers */}
            <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
                {isTooltipVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`mb-2 p-4 ${
                            isDarkMode
                                ? "bg-gray-800 text-white"
                                : "bg-white text-black"
                        } rounded-lg shadow-lg text-sm transition-all duration-300 max-w-xs`}
                    >
                        <button
                            onClick={handleCloseTooltip}
                            className={`absolute top-1 right-1 ${
                                isDarkMode
                                    ? "text-gray-400 hover:text-white"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                            aria-label="Close tooltip"
                        >
                            <CircleX size={20} />
                        </button>
                        <div className="flex items-center">
                            <MessageCircle
                                className={`mr-2 ${
                                    isDarkMode
                                        ? "text-blue-400"
                                        : "text-blue-600"
                                }`}
                            />
                            <p>
                                Need help planning your trip? Our AI chat bot is
                                here to assist you.
                            </p>
                        </div>
                    </motion.div>
                )}
                <ChatBot
                    isChatOpen={isChatOpen}
                    toggleChat={toggleChat}
                    isDarkMode={isDarkMode}
                />
            </div>

            {/* Flash Message */}
            {successMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg ${
                        isDarkMode
                            ? "bg-green-800 text-white"
                            : "bg-green-600 text-white"
                    } z-50`}
                    role="alert"
                >
                    {successMessage}
                </motion.div>
            )}
        </div>
    );
};

export default HomePage;
