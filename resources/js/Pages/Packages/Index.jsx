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
    Check,
} from "lucide-react";
import Navbar from "../../Components/Nav";
import Footer from "../../Components/Footer";
import toast, { Toaster } from "react-hot-toast";

const PackagesPage = ({ auth, packages = [] }) => {
    const user = auth?.user || null;
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("newest");
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [favorites, setFavorites] = useState(
        packages.reduce(
            (acc, pkg) => ({
                ...acc,
                [pkg.id]: {
                    is_favorite: pkg.is_favorite || false,
                    favorite_id: pkg.favorite_id || null,
                },
            }),
            {}
        )
    );
    const [loadingFavorites, setLoadingFavorites] = useState({});

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

    const toggleCategory = (category) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
        setCurrentPage(1);
    };

    const toggleFavorite = async (packageId) => {
        if (!user) {
            toast.error("Please log in to add to favorites");
            return;
        }

        try {
            const response = await axios.post("/favorites", {
                package_id: packageId,
            });

            const { success, message, is_favorite, favorite_id } =
                response.data;

            if (success) {
                setFavorites((prev) => ({
                    ...prev,
                    [packageId]: { is_favorite, favorite_id },
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

    const filteredPackages = packages
        .filter(
            (pkg) =>
                (pkg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    pkg.location
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())) &&
                (selectedCategories.length === 0 ||
                    selectedCategories.includes(pkg.category))
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
                case "newest":
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });

    const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
    const paginatedPackages = filteredPackages.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const resetPage = () => setCurrentPage(1);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        resetPage();
    };

    const handleCategoryToggle = (category) => {
        toggleCategory(category);
        resetPage();
    };

    const baseUrl = "/storage/";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <Head>
                <title>Packages - Triplus</title>
                <meta
                    name="description"
                    content="Explore our curated selection of travel packages with Triplus."
                />
            </Head>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Navbar user={user} />

            <div className="relative h-72 md:h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 opacity-80"></div>
                <div className="absolute inset-0 bg-[url('/images/world.png')] bg-no-repeat bg-center opacity-30 bg-contain"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="text-6xl font-extrabold mb-3 leading-tight"
                        >
                            Amazing{" "}
                            <span className="text-green-400">Packages</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                            className="text-xl text-gray-300 mb-4 max-w-xl mx-auto"
                        >
                            Discover incredible packages worldwide for your next
                            adventure
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                        >
                            <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
                <motion.div
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Search packages or locations..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-48">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
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
                                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 hover:bg-gray-700"
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
                                            <Tags className="w-4 h-4 text-green-400" />
                                            <h3 className="text-lg font-semibold">
                                                Categories
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((category) => (
                                                <button
                                                    key={category}
                                                    onClick={() =>
                                                        handleCategoryToggle(
                                                            category
                                                        )
                                                    }
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        selectedCategories.includes(
                                                            category
                                                        )
                                                            ? "bg-green-600 text-white"
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
                            {filteredPackages.length > 0
                                ? Math.min(
                                      (currentPage - 1) * itemsPerPage + 1,
                                      filteredPackages.length
                                  )
                                : 0}
                            -
                            {Math.min(
                                currentPage * itemsPerPage,
                                filteredPackages.length
                            )}{" "}
                            of {filteredPackages.length} packages
                        </p>
                        {selectedCategories.length > 0 && (
                            <button
                                onClick={() => setSelectedCategories([])}
                                className="text-green-400 hover:text-green-300 text-sm"
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
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
                >
                    <AnimatePresence mode="popLayout">
                        {paginatedPackages.length === 0 ? (
                            <motion.div
                                variants={fadeIn}
                                className="col-span-full text-center py-16"
                            >
                                <div className="max-w-md mx-auto">
                                    <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">
                                        No Packages Found
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        We couldn't find any packages matching
                                        your search criteria. Try adjusting the
                                        filters or search term.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedCategories([]);
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            paginatedPackages.map((pkg) => (
                                <motion.div
                                    key={pkg.id}
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
                                                pkg.image
                                                    ? `${baseUrl}${pkg.image}`
                                                    : "https://via.placeholder.com/640x480?text=Package+Image"
                                            }
                                            alt={pkg.title}
                                            className="w-full h-56 object-cover transform transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src =
                                                    "https://via.placeholder.com/640x480?text=Package+Image";
                                            }}
                                        />
                                        {pkg.category && (
                                            <span className="absolute top-3 left-3 px-2 py-1 bg-green-600 rounded-full text-xs font-medium text-white">
                                                {pkg.category}
                                            </span>
                                        )}
                                        <div className="absolute top-3 right-3 flex items-center gap-2">
                                            {calculateDiscount(
                                                pkg.price,
                                                pkg.discount_price
                                            ) > 0 && (
                                                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                    {calculateDiscount(
                                                        pkg.price,
                                                        pkg.discount_price
                                                    )}
                                                    % OFF
                                                </div>
                                            )}
                                            <button
                                                onClick={() =>
                                                    toggleFavorite(pkg.id)
                                                }
                                                disabled={
                                                    loadingFavorites[pkg.id]
                                                }
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-20 ${
                                                    favorites[pkg.id]
                                                        ?.is_favorite
                                                        ? "bg-red-500 hover:bg-red-600"
                                                        : "bg-gray-900 bg-opacity-50 hover:bg-gray-700"
                                                }
                                                    } ${
                                                        loadingFavorites[pkg.id]
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : ""
                                                    }`}
                                                aria-label={
                                                    favorites[pkg.id]
                                                        ?.is_favorite
                                                        ? "Remove from favorites"
                                                        : "Add to favorites"
                                                }
                                                aria-busy={
                                                    loadingFavorites[pkg.id]
                                                }
                                            >
                                                <Heart
                                                    size={18}
                                                    className={
                                                        favorites[pkg.id]
                                                            ?.is_favorite
                                                            ? "text-white fill-white"
                                                            : "text-gray-300"
                                                    }
                                                />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-white line-clamp-1">
                                                {pkg.title}
                                            </h3>
                                        </div>
                                        {pkg.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin
                                                    size={16}
                                                    className="text-green-400"
                                                />
                                                <span className="text-gray-300 text-sm">
                                                    {pkg.location}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            {renderStars(pkg.rating || 0)}
                                            <span className="text-gray-400 text-sm ml-2">
                                                ({pkg.rating || 0}/5)
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                                            {pkg.description ||
                                                "No description available."}
                                        </p>
                                        <div className="mt-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="block text-gray-400 text-xs">
                                                        Starting from
                                                    </span>
                                                    <div className="flex items-baseline gap-2">
                                                        {pkg.discount_price ? (
                                                            <>
                                                                <span className="text-lg font-bold text-green-400">
                                                                    $
                                                                    {parseFloat(
                                                                        pkg.discount_price
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                                <span className="text-sm line-through text-gray-500">
                                                                    $
                                                                    {parseFloat(
                                                                        pkg.price
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-lg font-bold text-green-400">
                                                                $
                                                                {parseFloat(
                                                                    pkg.price
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
                                                href={`/packages/${pkg.id}`}
                                                className="w-full inline-block text-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
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

                {filteredPackages.length > 0 && totalPages > 1 && (
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
                            }`}
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

                                if (page >= startPage && page <= endPage) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                                currentPage === page
                                                    ? "bg-green-600 text-white"
                                                    : "bg-gray-800 text-white hover:bg-gray-700"
                                            }`}
                                        >
                                            {page}
                                        </button>
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
                            }`}
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

export default PackagesPage;
