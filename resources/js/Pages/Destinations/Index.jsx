import React, { useState } from "react";
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
    Heart,
    Star,
} from "lucide-react";
import Navbar from "../../Components/Nav";
import Footer from "../../Components/Footer";
import toast, { Toaster } from "react-hot-toast";

const DestinationsPage = ({ auth, destinations = [] }) => {
    const user = auth?.user || null;
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("newest");
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [favorites, setFavorites] = useState(
        destinations.reduce(
            (acc, dest) => ({
                ...acc,
                [dest.id]: {
                    is_favorite: dest.is_favorite || false,
                    favorite_id: dest.favorite_id || null,
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

    const toggleFavorite = async (destinationId) => {
        if (!user) {
            toast.error("Please log in to add to favorites");
            return;
        }
        try {
            const response = await axios.post("/favorites", {
                destination_id: destinationId,
            });
            const { success, message, is_favorite, favorite_id } =
                response.data;
            if (success) {
                setFavorites((prev) => ({
                    ...prev,
                    [destinationId]: { is_favorite, favorite_id },
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

    const filteredDestinations = destinations
        .filter(
            (dest) =>
                (dest.title
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                    dest.location
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())) &&
                (selectedCategories.length === 0 ||
                    selectedCategories.includes(dest.category))
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
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });

    const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage);
    const paginatedDestinations = filteredDestinations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const baseUrl = "/storage/";

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Head>
                <title>Destinations - Triplus</title>
                <meta
                    name="description"
                    content="Explore our curated selection of travel destinations with Triplus."
                />
            </Head>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Navbar user={user} />

            {/* Hero Section */}
            <section className="relative pt-28 pb-16 md:pt-36 md:pb-5 bg-gradient-to-b from-emerald-950/70 via-gray-950 to-gray-950">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
                    >
                        Discover Your{" "}
                        <span className="text-emerald-400">
                            Dream Destinations
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.7 }}
                        className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10"
                    >
                        Explore handpicked destinations from around the world's
                        most breathtaking locations
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.45, duration: 0.6 }}
                        className="inline-block w-24 h-1 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full"
                    />
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
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
                                placeholder="Search destinations or locations..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-800/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 rounded-xl bg-gray-800/70 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                                        <Tags className="text-emerald-400" />
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
                                                        ? "bg-emerald-600 text-white"
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
                            {paginatedDestinations.length > 0
                                ? (currentPage - 1) * itemsPerPage + 1
                                : 0}
                            –
                            {Math.min(
                                currentPage * itemsPerPage,
                                filteredDestinations.length
                            )}{" "}
                            of {filteredDestinations.length} destinations
                        </p>
                        {selectedCategories.length > 0 && (
                            <button
                                onClick={() => setSelectedCategories([])}
                                className="text-emerald-400 hover:text-emerald-300"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Destinations Grid */}
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
                        {paginatedDestinations.length === 0 ? (
                            <motion.div
                                className="col-span-full text-center py-16"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-2xl font-semibold mb-2">
                                    No destinations found
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    Try changing your search or filters
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCategories([]);
                                    }}
                                    className="px-6 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700"
                                >
                                    Clear all
                                </button>
                            </motion.div>
                        ) : (
                            paginatedDestinations.map((dest) => (
                                <motion.div
                                    key={dest.id}
                                    variants={cardVariants}
                                    layout
                                    whileHover={{ y: -6 }}
                                    className="bg-gray-800/80 rounded-xl overflow-hidden border border-gray-700 flex flex-col group"
                                >
                                    <div className="relative">
                                        <img
                                            src={
                                                dest.image
                                                    ? `${baseUrl}${dest.image}`
                                                    : "https://via.placeholder.com/640x480?text=Destination"
                                            }
                                            alt={dest.title}
                                            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                            onError={(e) =>
                                                (e.target.src =
                                                    "https://via.placeholder.com/640x480?text=Destination")
                                            }
                                        />
                                        {dest.category && (
                                            <span className="absolute top-3 left-3 px-2 py-1 bg-emerald-600/90 rounded text-xs font-medium">
                                                {dest.category}
                                            </span>
                                        )}
                                        <button
                                            onClick={() =>
                                                toggleFavorite(dest.id)
                                            }
                                            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-gray-900/70 flex items-center justify-center hover:bg-gray-700 transition"
                                        >
                                            <Heart
                                                size={18}
                                                className={
                                                    favorites[dest.id]
                                                        ?.is_favorite
                                                        ? "text-red-500 fill-red-500"
                                                        : "text-gray-300"
                                                }
                                            />
                                        </button>
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="font-bold text-lg mb-2 line-clamp-1">
                                            {dest.title}
                                        </h3>
                                        {dest.location && (
                                            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
                                                <MapPin
                                                    size={16}
                                                    className="text-emerald-400"
                                                />
                                                {dest.location}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 mb-3">
                                            {renderStars(dest.rating)}
                                            <span className="text-gray-500 text-sm ml-2">
                                                ({dest.rating || "–"})
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm line-clamp-3 mb-4 flex-grow">
                                            {dest.description ||
                                                "No description available."}
                                        </p>

                                        <div className="mt-auto">
                                            <div className="flex items-baseline gap-2 mb-4">
                                                {dest.discount_price ? (
                                                    <>
                                                        <span className="text-2xl font-bold text-emerald-400">
                                                            $
                                                            {parseFloat(
                                                                dest.discount_price
                                                            ).toFixed(2)}
                                                        </span>
                                                        <span className="text-sm line-through text-gray-500">
                                                            $
                                                            {parseFloat(
                                                                dest.price
                                                            ).toFixed(2)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-2xl font-bold text-emerald-400">
                                                        $
                                                        {parseFloat(
                                                            dest.price
                                                        ).toFixed(2)}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400">
                                                    / person
                                                </span>
                                            </div>
                                            <Link
                                                href={`/destinations/${dest.id}`}
                                                className="block text-center py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition"
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

                {/* Pagination */}
                {filteredDestinations.length > 0 && totalPages > 1 && (
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
                                        ? "bg-emerald-600 text-white"
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
};

export default DestinationsPage;
