import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { motion } from "framer-motion";
import { MapPin, ChevronLeft, Star, Heart, Check, X } from "lucide-react";
import Navbar from "../../Components/Nav";
import Footer from "../../Components/Footer";
import toast, { Toaster } from "react-hot-toast";

export default function PackageDetails({ package: pkg, auth }) {
    const [favoriteState, setFavoriteState] = useState({
        is_favorite: pkg.is_favorite || false,
        favorite_id: pkg.favorite_id || null,
    });
    const [loadingFavorite, setLoadingFavorite] = useState(false);
    const user = auth?.user || null;

    useEffect(() => {
        console.log("Auth prop:", auth);
        console.log("Package image:", pkg.image);
    }, [auth, pkg.image]);

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
                    size={18}
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

    const formatPrice = (price) => {
        const parsed = parseFloat(price);
        return isNaN(parsed) ? "0.00" : parsed.toFixed(2);
    };

    const toggleFavorite = async () => {
        if (!user) {
            toast.error("Please log in to add to favorites.", {
                icon: <X size={16} className="text-red-500" />,
            });
            return;
        }

        const prevState = { ...favoriteState };
        setFavoriteState({
            is_favorite: !favoriteState.is_favorite,
            favorite_id: favoriteState.is_favorite ? null : "temp",
        });
        setLoadingFavorite(true);

        try {
            const response = await axios.post("/favorites", {
                package_id: pkg.id,
            });

            const { success, message, is_favorite, favorite_id } =
                response.data;

            if (success) {
                setFavoriteState({ is_favorite, favorite_id });
                toast.success(message, {
                    icon: <Check size={16} className="text-green-600" />,
                });
            } else {
                toast.error(message, {
                    icon: <X size={16} className="text-red-600" />,
                });
                setFavoriteState(prevState);
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to toggle favorite.";
            toast.error(errorMessage, {
                icon: <X size={16} className="text-red-500" />,
            });
            setFavoriteState(prevState);
        } finally {
            setLoadingFavorite(false);
        }
    };

    const serviceFee = 50;
    const bookingFee = 100;
    const basePrice = parseFloat(pkg.discount_price || pkg.price || 0);
    const totalPrice = basePrice + serviceFee + bookingFee;

    const imageSrc = pkg.image || "/images/placeholder.jpg";

    if (!pkg || Object.keys(pkg).length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
                <p className="text-center">No package details available.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <Head title={`${pkg.title || "Package"} - Triplus`} />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Navbar user={user} />
            <div className="relative h-64 md:h-72 overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 bg-opacity-80"></div>
                <div className="absolute inset-0 bg-[url('/images/static/worlds.svg')] bg-no-repeat bg-center opacity-30 bg-contain"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="text-4xl md:text-6xl font-extrabold mb-2 leading-tight"
                        >
                            {pkg.title}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                            className="text-xl text-gray-300 mb-4 max-w-xl mx-auto"
                        >
                            <MapPin
                                className="inline-block mr-1 mb-1"
                                size={18}
                            />
                            {pkg.location || "Location not specified"}
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
                    animate="visible"
                    className="mb-8"
                >
                    <div className="flex items-center text-sm text-gray-400">
                        <Link
                            href="/packages"
                            className="hover:text-green-600 flex items-center"
                        >
                            <ChevronLeft size={16} className="mr-1" />
                            Back to Packages
                        </Link>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-gray-800 bg-opacity-90 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm border border-gray-700">
                            <div className="relative">
                                <img
                                    src={imageSrc}
                                    alt={pkg.title}
                                    className="w-full h-96 object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                        console.error(
                                            "Image failed to load:",
                                            imageSrc
                                        );
                                        e.target.src =
                                            "/images/placeholder.jpg";
                                    }}
                                />
                                {pkg.category && (
                                    <span className="absolute top-4 left-4 px-3 py-1 bg-green-600 rounded-full text-sm font-medium text-white">
                                        {pkg.category}
                                    </span>
                                )}
                                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                    {calculateDiscount(
                                        pkg.price,
                                        pkg.discount_price
                                    ) > 0 && (
                                        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                            {calculateDiscount(
                                                pkg.price,
                                                pkg.discount_price
                                            )}
                                            % OFF
                                        </div>
                                    )}
                                    <button
                                        onClick={toggleFavorite}
                                        disabled={loadingFavorite}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm z-20 ${
                                            favoriteState.is_favorite
                                                ? "bg-red-600 hover:bg-red-700"
                                                : "bg-gray-900 bg-opacity-50 hover:bg-gray-700"
                                        } ${
                                            loadingFavorite
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                        aria-label={
                                            favoriteState.is_favorite
                                                ? "Remove from favorites"
                                                : "Add to favorites"
                                        }
                                        aria-busy={loadingFavorite}
                                    >
                                        <Heart
                                            size={20}
                                            className={
                                                favoriteState.is_favorite
                                                    ? "text-white fill-white"
                                                    : "text-white"
                                            }
                                        />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="flex flex-wrap gap-2 items-center mb-4">
                                    <div className="flex items-center">
                                        {renderStars(pkg.rating || 0)}
                                        <span className="text-gray-400 text-sm ml-2">
                                            ({pkg.rating || 0}/5)
                                        </span>
                                    </div>
                                    {pkg.category && (
                                        <span className="px-3 py-1 bg-green-600 bg-opacity-20 text-green-400 rounded-full text-xs">
                                            {pkg.category}
                                        </span>
                                    )}
                                    {pkg.is_featured && (
                                        <span className="px-3 py-1 bg-purple-600 bg-opacity-20 text-purple-400 rounded-full text-xs">
                                            Featured
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    About this package
                                </h2>
                                <div className="prose prose-lg prose-invert">
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-line mb-6">
                                        {pkg.description ||
                                            "No description available."}
                                    </p>
                                    {pkg.duration && (
                                        <p className="text-gray-300">
                                            <strong>Duration:</strong>{" "}
                                            {pkg.duration}
                                        </p>
                                    )}
                                    {pkg.group_size && (
                                        <p className="text-gray-300">
                                            <strong>Group Size:</strong>{" "}
                                            {pkg.group_size}
                                        </p>
                                    )}
                                    {pkg.company && (
                                        <p className="text-gray-300">
                                            <strong>Operated by:</strong>{" "}
                                            {pkg.company.company_name}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold mb-4 text-green-400">
                                        Price Details
                                    </h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                                        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 flex-1">
                                            <div className="text-gray-400 text-sm mb-1">
                                                Starting from
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                {pkg.discount_price ? (
                                                    <>
                                                        <span className="text-2xl font-bold text-green-400">
                                                            $
                                                            {formatPrice(
                                                                pkg.discount_price
                                                            )}
                                                        </span>
                                                        <span className="text-sm line-through text-gray-500">
                                                            $
                                                            {formatPrice(
                                                                pkg.price
                                                            )}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-2xl font-bold text-green-400">
                                                        $
                                                        {formatPrice(pkg.price)}
                                                    </span>
                                                )}
                                                <span className="text-sm text-gray-400">
                                                    / person
                                                </span>
                                            </div>
                                        </div>
                                        {calculateDiscount(
                                            pkg.price,
                                            pkg.discount_price
                                        ) > 0 && (
                                            <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 flex-1">
                                                <div className="text-gray-400 text-sm mb-1">
                                                    You save
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-green-400">
                                                        $
                                                        {formatPrice(
                                                            pkg.price -
                                                                pkg.discount_price
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-gray-400">
                                                        (
                                                        {calculateDiscount(
                                                            pkg.price,
                                                            pkg.discount_price
                                                        )}
                                                        % off)
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <motion.div
                            variants={fadeIn}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-8 bg-gray-800 bg-opacity-90 rounded-xl p-6 md:p-8 shadow-xl backdrop-blur-sm border border-gray-700"
                        >
                            <h3 className="text-xl font-semibold mb-4 text-green-400">
                                Location Information
                            </h3>
                            <p className="text-gray-300 mb-4">
                                <MapPin
                                    className="inline-block mr-2 mb-1"
                                    size={18}
                                />
                                {pkg.location || "Location not specified"}
                            </p>
                            <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 mt-4">
                                <p className="text-gray-400">
                                    This package is located in{" "}
                                    {pkg.location || "the specified location"}.
                                    The exact details and itinerary will be
                                    provided after booking.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="bg-gray-800 bg-opacity-90 rounded-xl p-6 shadow-xl backdrop-blur-sm border border-gray-700 sticky top-24 z-10">
                            <h3 className="text-xl font-semibold mb-4">
                                Book this package
                            </h3>
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">
                                        Price per person
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        {pkg.discount_price ? (
                                            <>
                                                <span className="text-lg font-bold text-green-400">
                                                    $
                                                    {formatPrice(
                                                        pkg.discount_price
                                                    )}
                                                </span>
                                                <span className="text-sm line-through text-gray-500">
                                                    ${formatPrice(pkg.price)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-lg font-bold text-green-400">
                                                ${formatPrice(pkg.price)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-400">
                                        Service fee
                                    </span>
                                    <span className="text-gray-300">
                                        ${formatPrice(serviceFee)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-400">
                                        Booking fee
                                    </span>
                                    <span className="text-gray-300">
                                        ${formatPrice(bookingFee)}
                                    </span>
                                </div>
                                <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold text-lg">
                                        ${formatPrice(totalPrice)}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Link
                                    href={`/book?package_id=${pkg.id}`}
                                    className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg transform hover:scale-105 transition-all duration-300"
                                >
                                    Book Now
                                </Link>
                                <button
                                    onClick={toggleFavorite}
                                    disabled={loadingFavorite}
                                    className={`block w-full text-center py-3 rounded-lg transition-all duration-300 ${
                                        favoriteState.is_favorite
                                            ? "bg-red-600 hover:bg-red-700 text-white"
                                            : "bg-transparent border border-green-500 text-green-400 hover:bg-green-900 hover:bg-opacity-20"
                                    } ${
                                        loadingFavorite
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                    aria-label={
                                        favoriteState.is_favorite
                                            ? "Remove from favorites"
                                            : "Save to favorites"
                                    }
                                    aria-busy={loadingFavorite}
                                >
                                    {favoriteState.is_favorite
                                        ? "Saved to Favorites"
                                        : "Save to Favorites"}
                                </button>
                            </div>
                            <div className="mt-4 text-center text-sm text-gray-400">
                                No payment required to book
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center bg-green-900 bg-opacity-40 rounded-xl p-8 shadow-xl max-w-4xl mx-auto mt-16 border border-green-800"
                >
                    <h2 className="text-2xl font-bold mb-4">
                        Ready to Experience{" "}
                        <span className="text-green-400">{pkg.title}</span>?
                    </h2>
                    <p className="text-gray-300 mb-6">
                        Book your package now and create unforgettable memories
                        with this amazing experience.
                    </p>
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={`/book?package_id=${pkg.id}`}
                        className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-300"
                    >
                        Book Now
                    </motion.a>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}
