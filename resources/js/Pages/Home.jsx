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

// New Unique Offer Card Design
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
        const discount = calculateDiscount(offer.price, offer.discount_price);

        return (
            <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`group rounded-2xl overflow-hidden ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                } shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full`}
            >
                {/* Image Section */}
                <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                        src={offer.image || "/images/placeholder-offer.jpg"}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) =>
                            (e.target.src = "/images/placeholder-offer.jpg")
                        }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    {/* Discount Badge - Top Right - Eye-catching */}
                    {discount && (
                        <div className="absolute top-0 right-0">
                            <div className="relative">
                                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white px-4 py-3 rounded-bl-2xl shadow-2xl">
                                    <div className="text-center">
                                        <div className="text-2xl font-black leading-none">
                                            {discount}%
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide">
                                            OFF
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Category & Favorite - Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                        {offer.category && (
                            <span className="inline-block bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                {offer.category}
                            </span>
                        )}
                        <button
                            onClick={() => toggleFavorite(offer.id, "offer_id")}
                            disabled={loadingFavorite[`offer_${offer.id}`]}
                            className={`p-2.5 rounded-xl backdrop-blur-sm transition-all ${
                                favorites[`offer_${offer.id}`]?.is_favorite
                                    ? "bg-red-500 scale-110"
                                    : "bg-white/90 hover:bg-white"
                            } ${
                                loadingFavorite[`offer_${offer.id}`]
                                    ? "opacity-50"
                                    : ""
                            }`}
                            aria-label="Toggle favorite"
                        >
                            <Heart
                                size={18}
                                className={
                                    favorites[`offer_${offer.id}`]?.is_favorite
                                        ? "text-white fill-white"
                                        : "text-gray-700"
                                }
                            />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow">
                    {/* Title */}
                    <h3
                        className={`text-xl font-bold mb-3 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                        } line-clamp-1 group-hover:text-blue-600 transition-colors`}
                    >
                        {offer.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-2 mb-3">
                        <div
                            className={`p-1.5 rounded-lg ${
                                isDarkMode ? "bg-gray-700" : "bg-gray-100"
                            }`}
                        >
                            <MapPin size={14} className="text-blue-600" />
                        </div>
                        <span
                            className={`text-sm font-medium ${
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                            } line-clamp-1`}
                        >
                            {offer.destination_location}
                        </span>
                    </div>

                    {/* Dates */}
                    <div
                        className={`flex items-center gap-2 mb-4 text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                        <Calendar size={13} />
                        <span>
                            {new Date(offer.start_date).toLocaleDateString(
                                "en-US",
                                {
                                    month: "short",
                                    day: "numeric",
                                }
                            )}{" "}
                            -{" "}
                            {new Date(offer.end_date).toLocaleDateString(
                                "en-US",
                                {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                }
                            )}
                        </span>
                    </div>

                    {/* Price & CTA Section - Redesigned for Perfect Alignment */}
                    <div
                        className={`mt-auto pt-4 border-t ${
                            isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            {/* Price Column */}
                            <div className="flex-1">
                                <div
                                    className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {translations.starting_from || "From"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-blue-600">
                                        ${offer.discount_price || offer.price}
                                    </span>
                                    {offer.discount_price && (
                                        <div className="flex flex-col">
                                            <span
                                                className={`text-xs line-through ${
                                                    isDarkMode
                                                        ? "text-gray-500"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                ${offer.price}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={`text-xs ${
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {translations.per_night || "per night"}
                                </div>
                            </div>

                            {/* CTA Button */}
                            <Link
                                href={`/offers/${offer.id}`}
                                className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 text-sm font-bold shadow-sm hover:shadow-md group/btn"
                                aria-label={`View ${offer.title}`}
                            >
                                View
                                <ArrowRight
                                    size={16}
                                    className="group-hover/btn:translate-x-0.5 transition-transform"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }
);

// New Unique Destination Card Design
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
        const discount = calculateDiscount(
            destination.price,
            destination.discount_price
        );

        return (
            <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`group rounded-2xl overflow-hidden ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                } shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full`}
            >
                {/* Image Section */}
                <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                        src={
                            destination.image ||
                            "/images/placeholder-destination.jpg"
                        }
                        alt={destination.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) =>
                            (e.target.src =
                                "/images/placeholder-destination.jpg")
                        }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    {/* Discount Badge - Top Right - Eye-catching */}
                    {discount && (
                        <div className="absolute top-0 right-0">
                            <div className="relative">
                                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white px-4 py-3 rounded-bl-2xl shadow-2xl">
                                    <div className="text-center">
                                        <div className="text-2xl font-black leading-none">
                                            {discount}%
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide">
                                            OFF
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Category & Favorite - Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                        {destination.category && (
                            <span className="inline-block bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                {destination.category}
                            </span>
                        )}
                        <button
                            onClick={() =>
                                toggleFavorite(destination.id, "destination_id")
                            }
                            disabled={
                                loadingFavorite[`destination_${destination.id}`]
                            }
                            className={`p-2.5 rounded-xl backdrop-blur-sm transition-all ${
                                favorites[`destination_${destination.id}`]
                                    ?.is_favorite
                                    ? "bg-red-500 scale-110"
                                    : "bg-white/90 hover:bg-white"
                            } ${
                                loadingFavorite[`destination_${destination.id}`]
                                    ? "opacity-50"
                                    : ""
                            }`}
                            aria-label="Toggle favorite"
                        >
                            <Heart
                                size={18}
                                className={
                                    favorites[`destination_${destination.id}`]
                                        ?.is_favorite
                                        ? "text-white fill-white"
                                        : "text-gray-700"
                                }
                            />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow">
                    {/* Title */}
                    <h3
                        className={`text-xl font-bold mb-3 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                        } line-clamp-1 group-hover:text-blue-600 transition-colors`}
                    >
                        {destination.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-2 mb-3">
                        <div
                            className={`p-1.5 rounded-lg ${
                                isDarkMode ? "bg-gray-700" : "bg-gray-100"
                            }`}
                        >
                            <MapPin size={14} className="text-blue-600" />
                        </div>
                        <span
                            className={`text-sm font-medium ${
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                            } line-clamp-1`}
                        >
                            {destination.location}
                        </span>
                    </div>

                    {/* Duration & Group Size */}
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className={`flex items-center gap-1.5 text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            <Calendar size={13} />
                            <span>{destination.duration || "3-7 days"}</span>
                        </div>
                        <div
                            className={`w-1 h-1 rounded-full ${
                                isDarkMode ? "bg-gray-600" : "bg-gray-300"
                            }`}
                        ></div>
                        <div
                            className={`flex items-center gap-1.5 text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            <Users size={13} />
                            <span>{destination.group_size || "2-8 ppl"}</span>
                        </div>
                    </div>

                    {/* Price & CTA Section - Redesigned for Perfect Alignment */}
                    <div
                        className={`mt-auto pt-4 border-t ${
                            isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            {/* Price Column */}
                            <div className="flex-1">
                                <div
                                    className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {translations.starting_from || "From"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-blue-600">
                                        $
                                        {destination.discount_price ||
                                            destination.price}
                                    </span>
                                    {destination.discount_price && (
                                        <div className="flex flex-col">
                                            <span
                                                className={`text-xs line-through ${
                                                    isDarkMode
                                                        ? "text-gray-500"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                ${destination.price}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={`text-xs ${
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {translations.per_night || "per night"}
                                </div>
                            </div>

                            {/* CTA Button */}
                            <Link
                                href={`/destinations/${destination.id}`}
                                className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 text-sm font-bold shadow-sm hover:shadow-md group/btn"
                                aria-label={`View ${destination.title}`}
                            >
                                View
                                <ArrowRight
                                    size={16}
                                    className="group-hover/btn:translate-x-0.5 transition-transform"
                                />
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
        <div className="flex items-center justify-center gap-2 mt-10">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2.5 rounded-xl ${
                    isDarkMode
                        ? "bg-gray-800 text-white hover:bg-gray-700"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                } disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm`}
                aria-label="Previous page"
            >
                <ArrowLeft size={18} />
            </button>
            {pages
                .filter((page) => page >= startPage && page <= endPage)
                .map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`min-w-[40px] px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                            currentPage === page
                                ? "bg-blue-600 text-white"
                                : isDarkMode
                                ? "bg-gray-800 text-white hover:bg-gray-700"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                        }`}
                        aria-label={`Page ${page}`}
                    >
                        {page}
                    </button>
                ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2.5 rounded-xl ${
                    isDarkMode
                        ? "bg-gray-800 text-white hover:bg-gray-700"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                } disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm`}
                aria-label="Next page"
            >
                <ChevronRight size={18} />
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

    useEffect(() => {
        localStorage.setItem("darkMode", isDarkMode);
        document.documentElement.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const toggleChat = useCallback(() => setIsChatOpen((prev) => !prev), []);
    const handleCloseTooltip = useCallback(
        () => setIsTooltipVisible(false),
        []
    );
    const toggleDarkMode = useCallback(
        () => setIsDarkMode((prev) => !prev),
        []
    );

    const scrollToSearch = useCallback(() => {
        searchRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setIsTooltipVisible(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (heroSections.length > 1) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % heroSections.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [heroSections]);

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

    const clearSearch = useCallback(() => {
        setSearchQuery("");
        setSuggestions([]);
    }, []);

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
                    : "bg-gray-50 text-gray-900"
            }`}
            data-dark-mode={isDarkMode}
        >
            <Head>
                <title>Triplus - Your Adventure Awaits</title>
                <meta
                    name="description"
                    content="Discover unforgettable trips, explore stunning destinations, and book the best travel deals with Triplus."
                />
            </Head>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Navbar
                user={user}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
            />

            {/* Hero Section */}
            <section className="relative h-screen w-full overflow-hidden">
                {heroSections.length === 0 ? (
                    <div
                        className={`absolute inset-0 flex items-center justify-center ${
                            isDarkMode ? "bg-gray-900" : "bg-gray-100"
                        }`}
                    >
                        <p
                            className={`text-xl ${
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                        >
                            No hero sections available.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="absolute inset-0">
                            <AnimatePresence initial={false} mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60"></div>
                                    <img
                                        src={
                                            heroSections[currentSlide]?.image ||
                                            "/images/placeholder-hero.jpg"
                                        }
                                        alt={
                                            heroSections[currentSlide]?.title ||
                                            "Hero Image"
                                        }
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) =>
                                            (e.target.src =
                                                "/images/placeholder-hero.jpg")
                                        }
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                            <motion.div
                                key={`content-${currentSlide}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="max-w-4xl"
                            >
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                                    {heroSections[currentSlide]?.title ||
                                        "Welcome to Triplus"}
                                </h1>
                                <p className="text-xl md:text-2xl text-white/90 mb-8">
                                    {heroSections[currentSlide]?.subtitle ||
                                        "Plan your next adventure with us."}
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        href="/booking"
                                        className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
                                        aria-label="Start planning"
                                    >
                                        {heroSections[currentSlide]?.cta_text ||
                                            "Start Planning"}
                                    </Link>
                                    <button
                                        onClick={scrollToSearch}
                                        className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-colors font-semibold text-lg border border-white/30"
                                        aria-label="Explore"
                                    >
                                        Explore Destinations
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-8">
                            <button
                                onClick={() =>
                                    setCurrentSlide((prev) =>
                                        prev === 0
                                            ? heroSections.length - 1
                                            : prev - 1
                                    )
                                }
                                className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors"
                                aria-label="Previous"
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
                                className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors"
                                aria-label="Next"
                            >
                                <ArrowRight size={24} />
                            </button>
                        </div>

                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {heroSections.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-2 rounded-full transition-all ${
                                        currentSlide === index
                                            ? "w-8 bg-white"
                                            : "w-2 bg-white/50"
                                    }`}
                                    aria-label={`Slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>

            {/* Search Section */}
            <section
                className={`py-20 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
                ref={searchRef}
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2
                            className={`text-4xl md:text-5xl font-bold mb-4 ${
                                isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                        >
                            Find Your Perfect Adventure
                        </h2>
                        <p
                            className={`text-lg ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                        >
                            Search destinations, offers, and packages
                        </p>
                    </div>

                    <div className="relative mb-10">
                        <div className="relative">
                            <Search
                                className={`absolute left-5 top-1/2 transform -translate-y-1/2 ${
                                    isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                }`}
                                size={22}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Where would you like to go?"
                                className={`w-full pl-14 pr-14 py-5 ${
                                    isDarkMode
                                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                                } border-2 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm`}
                                aria-label="Search"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className={`absolute right-5 top-1/2 transform -translate-y-1/2 ${
                                        isDarkMode
                                            ? "text-gray-400 hover:text-white"
                                            : "text-gray-500 hover:text-gray-900"
                                    }`}
                                    aria-label="Clear"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            const isActive =
                                selectedCategory ===
                                category.name.toLowerCase();
                            return (
                                <button
                                    key={category.name}
                                    onClick={() =>
                                        setSelectedCategory(
                                            category.name.toLowerCase()
                                        )
                                    }
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                        isActive
                                            ? "bg-blue-600 text-white shadow-md"
                                            : isDarkMode
                                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                            : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
                                    }`}
                                >
                                    <Icon size={16} />
                                    {category.name}
                                </button>
                            );
                        })}
                        <button
                            onClick={handleSurpriseMe}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
                        >
                            <Sparkles size={16} />
                            Surprise Me
                        </button>
                    </div>

                    <AnimatePresence>
                        {suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-5"
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
                                        className={`flex items-center gap-4 p-4 rounded-xl ${
                                            isDarkMode
                                                ? "bg-gray-800 hover:bg-gray-750"
                                                : "bg-white hover:bg-gray-50 border-2 border-gray-200"
                                        } transition-all shadow-sm hover:shadow-md`}
                                    >
                                        <img
                                            src={
                                                item.image ||
                                                "/images/placeholder-small.jpg"
                                            }
                                            alt={item.name || item.title}
                                            className="w-20 h-20 rounded-xl object-cover"
                                            loading="lazy"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3
                                                className={`font-bold mb-1 line-clamp-1 ${
                                                    isDarkMode
                                                        ? "text-white"
                                                        : "text-gray-900"
                                                }`}
                                            >
                                                {item.name || item.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                                                {item.location ||
                                                    item.destination_name}
                                            </p>
                                            <p className="text-base font-bold text-blue-600">
                                                $
                                                {item.discount_price ||
                                                    item.price}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Offers Section */}
            <section
                className={`py-20 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2
                                className={`text-3xl md:text-4xl font-bold mb-2 ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                            >
                                Exclusive Offers
                            </h2>
                            <p
                                className={`text-base ${
                                    isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                }`}
                            >
                                Limited-time deals with incredible savings
                            </p>
                        </div>
                        <Link
                            href="/offers"
                            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                        >
                            View All
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    {paginatedOffers.length === 0 ? (
                        <div
                            className={`text-center py-16 ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            <Tag
                                size={56}
                                className="mx-auto mb-4 opacity-40"
                            />
                            <p className="text-lg">
                                No offers available at the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        </div>
                    )}

                    {totalOfferPages > 1 && (
                        <Pagination
                            currentPage={offerPage}
                            totalPages={totalOfferPages}
                            onPageChange={setOfferPage}
                            isDarkMode={isDarkMode}
                        />
                    )}

                    <div className="text-center mt-8 sm:hidden">
                        <Link
                            href="/offers"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                        >
                            View All Offers
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Destinations Section */}
            <section
                className={`py-20 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2
                            className={`text-3xl md:text-4xl font-bold mb-4 ${
                                isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                        >
                            Trending Destinations
                        </h2>
                        <p
                            className={`text-lg ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                        >
                            Explore the world's most breathtaking places
                        </p>
                    </div>

                    {paginatedDestinations.length === 0 ? (
                        <div
                            className={`text-center py-16 ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            <Compass
                                size={56}
                                className="mx-auto mb-4 opacity-40"
                            />
                            <p className="text-lg">
                                No destinations available.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        </div>
                    )}

                    {totalDestinationPages > 1 && (
                        <Pagination
                            currentPage={destinationPage}
                            totalPages={totalDestinationPages}
                            onPageChange={setDestinationPage}
                            isDarkMode={isDarkMode}
                        />
                    )}

                    <div className="text-center mt-12">
                        <Link
                            href="/destinations"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-lg shadow-md"
                        >
                            Explore All Destinations
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section
                className={`py-20 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2
                            className={`text-3xl md:text-4xl font-bold mb-4 ${
                                isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                        >
                            Why Choose Triplus
                        </h2>
                        <p
                            className={`text-lg ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                        >
                            Travel with confidence and peace of mind
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Tag,
                                title: "Best Price Guarantee",
                                description:
                                    "We guarantee the best prices with our price match protection.",
                            },
                            {
                                icon: Shield,
                                title: "Secure Booking",
                                description:
                                    "Your payments are protected with bank-level encryption.",
                            },
                            {
                                icon: Award,
                                title: "Premium Service",
                                description:
                                    "24/7 support team ready to assist you anytime.",
                            },
                            {
                                icon: Star,
                                title: "Loyalty Rewards",
                                description:
                                    "Earn points with every booking and unlock exclusive benefits.",
                            },
                        ].map((benefit, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-2xl ${
                                    isDarkMode
                                        ? "bg-gray-800"
                                        : "bg-white border-2 border-gray-200"
                                } shadow-sm hover:shadow-md transition-shadow`}
                            >
                                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                    <benefit.icon
                                        size={28}
                                        className="text-blue-600"
                                    />
                                </div>
                                <h3
                                    className={`text-lg font-bold mb-2 ${
                                        isDarkMode
                                            ? "text-white"
                                            : "text-gray-900"
                                    }`}
                                >
                                    {benefit.title}
                                </h3>
                                <p
                                    className={`text-sm leading-relaxed ${
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                    }`}
                                >
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer isDarkMode={isDarkMode} />

            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
                {isTooltipVisible && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`max-w-xs p-4 ${
                            isDarkMode
                                ? "bg-gray-800 text-white"
                                : "bg-white text-gray-900 border-2 border-gray-200"
                        } rounded-xl shadow-lg`}
                    >
                        <button
                            onClick={handleCloseTooltip}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                        <p className="text-sm font-semibold mb-1">Need Help?</p>
                        <p className="text-xs opacity-80">
                            Our AI assistant is here to help!
                        </p>
                    </motion.div>
                )}
                <ChatBot
                    isChatOpen={isChatOpen}
                    toggleChat={toggleChat}
                    isDarkMode={isDarkMode}
                />
            </div>
        </div>
    );
};

export default HomePage;
