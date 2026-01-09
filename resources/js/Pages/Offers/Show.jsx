import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { motion } from "framer-motion";
import {
    MapPin,
    ChevronLeft,
    Star,
    Heart,
    Calendar,
    Tag,
    Users,
} from "lucide-react";
import Navbar from "../../Components/Nav";
import Footer from "../../Components/Footer";
import toast, { Toaster } from "react-hot-toast";

export default function Show({ offer = {}, auth }) {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [favoriteState, setFavoriteState] = useState({
        is_favorite: offer.is_favorite || false,
        favorite_id: offer.favorite_id || null,
    });

    const serviceFee = 9.99;
    const bookingFee = 4.99;

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const calculateDiscount = (original, discounted) => {
        const orig = parseFloat(original);
        const disc = parseFloat(discounted);
        if (!orig || !disc || orig <= disc) return null;
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

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return "N/A";
        }
    };

    const getDaysLeft = (endDate) => {
        if (!endDate) return null;
        const today = new Date();
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const toggleFavorite = async () => {
        if (!auth?.user) {
            toast.error("Please log in to add to favorites.");
            return;
        }

        try {
            const response = await axios.post("/favorites", {
                offer_id: offer.id,
            });

            const { success, message, is_favorite, favorite_id } =
                response.data;

            if (success) {
                setFavoriteState({ is_favorite, favorite_id });
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

    const basePrice = parseFloat(offer.discount_price || offer.price || 0);
    const totalPrice = basePrice + serviceFee + bookingFee;

    const imageSrc =
        offer.image || "https://via.placeholder.com/1200x800?text=No+Image";

    if (!offer || Object.keys(offer).length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
                <p className="text-xl">No offer details available.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white transition-all duration-300 relative">
            <Head title={`${offer.title || "Offer"} - Triplus`} />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

            <Navbar
                user={auth?.user}
                isDarkMode={isDarkMode}
                toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />

            <div className="relative h-64 md:h-72 overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 opacity-80"></div>
                <div className="absolute inset-0 bg-[url('/images/world.svg')] bg-no-repeat bg-center opacity-30 bg-fill"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="text-4xl md:text-6xl font-extrabold mb-2 leading-tight"
                        >
                            {offer.title || "Special Offer"}
                        </motion.h1>
                        {offer.location && (
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
                                {offer.location}
                            </motion.p>
                        )}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className="flex flex-wrap justify-center gap-4 text-sm text-gray-300"
                        >
                            {offer.discount_type && (
                                <span className="flex items-center gap-1">
                                    <Tag size={16} className="text-amber-300" />
                                    Type: {offer.discount_type}
                                </span>
                            )}
                            {offer.max_guests && (
                                <span className="flex items-center gap-1">
                                    <Users
                                        size={16}
                                        className="text-amber-300"
                                    />
                                    Max Guests: {offer.max_guests}
                                </span>
                            )}
                            {offer.start_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar
                                        size={16}
                                        className="text-amber-300"
                                    />
                                    Start: {formatDate(offer.start_date)}
                                </span>
                            )}
                            {offer.end_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar
                                        size={16}
                                        className="text-amber-300"
                                    />
                                    End: {formatDate(offer.end_date)}
                                </span>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="mb-8"
                >
                    <Link
                        href="/offers"
                        className="flex items-center text-sm text-gray-400 hover:text-amber-300 transition-colors duration-300"
                    >
                        <ChevronLeft size={16} className="mr-1" />
                        Back to Offers
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="lg:col-span-2"
                    >
                        <div className="bg-gray-800 bg-opacity-70 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                            <div className="relative">
                                <img
                                    src={imageSrc}
                                    alt={offer.title}
                                    className="w-full h-96 object-cover"
                                    onError={(e) =>
                                        (e.target.src =
                                            "https://via.placeholder.com/1200x800?text=No+Image")
                                    }
                                />
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {offer.discount_type && (
                                        <span className="px-3 py-1 bg-gray-900 bg-opacity-70 rounded-full text-sm font-medium text-gray-300">
                                            {offer.discount_type}
                                        </span>
                                    )}
                                    {offer.max_guests && (
                                        <span className="px-3 py-1 bg-gray-900 bg-opacity-70 rounded-full text-sm font-medium text-gray-300">
                                            Max Guests: {offer.max_guests}
                                        </span>
                                    )}
                                    {offer.end_date && (
                                        <span className="px-3 py-1 bg-gray-900 bg-opacity-70 rounded-full text-sm font-medium text-gray-300">
                                            Valid until{" "}
                                            {formatDate(offer.end_date)}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute top-4 right-1 flex flex-col gap-2">
                                    {calculateDiscount(
                                        offer.price,
                                        offer.discount_price
                                    ) && (
                                        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                            {calculateDiscount(
                                                offer.price,
                                                offer.discount_price
                                            )}
                                            % OFF
                                        </div>
                                    )}
                                    <button
                                        onClick={toggleFavorite}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                                            favoriteState.is_favorite
                                                ? "bg-red-500 hover:bg-red-600"
                                                : "bg-gray-900 bg-opacity-50 hover:bg-gray-700"
                                        }`}
                                        aria-label={
                                            favoriteState.is_favorite
                                                ? "Remove from favorites"
                                                : "Add to favorites"
                                        }
                                    >
                                        <Heart
                                            size={18}
                                            className={
                                                favoriteState.is_favorite
                                                    ? "text-white fill-white"
                                                    : "text-gray-300"
                                            }
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 md:p-8">
                                <div className="flex flex-wrap gap-2 items-center mb-4">
                                    <div className="flex items-center">
                                        {renderStars(offer.rating)}
                                        <span className="text-gray-400 text-sm ml-2">
                                            ({offer.rating || 0}/5)
                                        </span>
                                    </div>
                                    {offer.discount_type && (
                                        <span className="px-3 py-1 bg-amber-600 bg-opacity-20 text-amber-300 rounded-full text-xs">
                                            {offer.discount_type}
                                        </span>
                                    )}
                                    {offer.is_featured && (
                                        <span className="px-3 py-1 bg-purple-600 bg-opacity-20 text-purple-400 rounded-full text-xs">
                                            Featured
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-4">
                                    About This Offer
                                </h2>
                                <div className="prose prose-lg prose-invert">
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-line mb-6">
                                        {offer.description ||
                                            "No description available."}
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold mb-4 text-amber-300">
                                        Pricing Details
                                    </h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                                        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 flex-1">
                                            <div className="text-gray-400 text-sm mb-1">
                                                Price per Person
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                {offer.discount_price ? (
                                                    <>
                                                        <span className="text-2xl font-bold text-amber-300">
                                                            $
                                                            {formatPrice(
                                                                offer.discount_price
                                                            )}
                                                        </span>
                                                        <span className="text-sm line-through text-red-500">
                                                            $
                                                            {formatPrice(
                                                                offer.price
                                                            )}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-2xl font-bold text-amber-300">
                                                        $
                                                        {formatPrice(
                                                            offer.price
                                                        )}
                                                    </span>
                                                )}
                                                <span className="text-sm text-gray-400">
                                                    / person
                                                </span>
                                            </div>
                                        </div>
                                        {calculateDiscount(
                                            offer.price,
                                            offer.discount_price
                                        ) && (
                                            <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 flex-1">
                                                <div className="text-red-400 text-sm mb-1">
                                                    You Save
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-amber-300">
                                                        $
                                                        {formatPrice(
                                                            parseFloat(
                                                                offer.price
                                                            ) -
                                                                parseFloat(
                                                                    offer.discount_price
                                                                )
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-gray-400">
                                                        (
                                                        {calculateDiscount(
                                                            offer.price,
                                                            offer.discount_price
                                                        )}
                                                        % OFF)
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 mb-6">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-400">
                                                Service Fee
                                            </span>
                                            <span className="text-gray-300">
                                                ${formatPrice(serviceFee)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-400">
                                                Booking Fee
                                            </span>
                                            <span className="text-gray-300">
                                                ${formatPrice(bookingFee)}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                                            <span className="font-semibold">
                                                Total
                                            </span>
                                            <span className="font-bold text-lg">
                                                ${formatPrice(totalPrice)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        Price includes all taxes and fees.
                                    </div>
                                </div>

                                {(offer.discount_type ||
                                    offer.max_guests ||
                                    offer.start_date ||
                                    offer.end_date) && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-semibold mb-4 text-amber-300">
                                            Additional Details
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {offer.discount_type && (
                                                <div className="flex items-center gap-2">
                                                    <Tag
                                                        size={18}
                                                        className="text-amber-300"
                                                    />
                                                    <span className="text-gray-300">
                                                        Type:{" "}
                                                        {offer.discount_type}
                                                    </span>
                                                </div>
                                            )}
                                            {offer.max_guests && (
                                                <div className="flex items-center gap-2">
                                                    <Users
                                                        size={18}
                                                        className="text-amber-300"
                                                    />
                                                    <span className="text-gray-300">
                                                        Max Guests:{" "}
                                                        {offer.max_guests}
                                                    </span>
                                                </div>
                                            )}
                                            {offer.start_date && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar
                                                        size={18}
                                                        className="text-amber-300"
                                                    />
                                                    <span className="text-gray-300">
                                                        Start Date:{" "}
                                                        {formatDate(
                                                            offer.start_date
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            {offer.end_date && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar
                                                        size={18}
                                                        className="text-amber-300"
                                                    />
                                                    <span className="text-gray-300">
                                                        End Date:{" "}
                                                        {formatDate(
                                                            offer.end_date
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {offer.location && (
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                variants={fadeIn}
                                className="mt-8 bg-gray-800 bg-opacity-70 rounded-xl p-6 md:p-8 shadow-xl border border-gray-700"
                            >
                                <h3 className="text-xl font-semibold mb-4 text-amber-300">
                                    Location Information
                                </h3>
                                <p className="text-gray-300 mb-4">
                                    <MapPin
                                        className="inline-block mr-2 mb-1"
                                        size={18}
                                    />
                                    {offer.location}
                                </p>
                                <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
                                    <p className="text-gray-400">
                                        This offer is available in{" "}
                                        {offer.location}. Full details will be
                                        provided after booking.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            variants={fadeIn}
                            className="mt-8 bg-gray-800 bg-opacity-70 rounded-xl p-6 md:p-8 shadow-xl border border-gray-700"
                        >
                            <h3 className="text-xl font-semibold mb-4 text-amber-300">
                                Offer Availability
                            </h3>
                            <p className="text-gray-300 mb-4">
                                <Calendar
                                    className="inline-block mr-2 mb-1"
                                    size={18}
                                />
                                Valid from {formatDate(offer.start_date)} to{" "}
                                {formatDate(offer.end_date)}
                            </p>
                            {getDaysLeft(offer.end_date) !== null && (
                                <p className="text-yellow-400 mb-4">
                                    {getDaysLeft(offer.end_date) <= 3
                                        ? `Hurry! Only ${getDaysLeft(
                                              offer.end_date
                                          )} day${
                                              getDaysLeft(offer.end_date) !== 1
                                                  ? "s"
                                                  : ""
                                          } left!`
                                        : `${getDaysLeft(
                                              offer.end_date
                                          )} days remaining`}
                                </p>
                            )}
                            <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
                                <p className="text-gray-400">
                                    This is a limited-time offer. Book now to
                                    secure these special rates.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        variants={fadeIn}
                        className="space-y-6"
                    >
                        <div className="bg-gray-800 bg-opacity-70 rounded-xl p-6 shadow-xl border border-gray-700 sticky top-24 z-10">
                            <h3 className="text-xl font-semibold mb-4">
                                Book This Offer
                            </h3>
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-400">
                                        Price per Person
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        {offer.discount_price ? (
                                            <>
                                                <span className="text-lg font-bold text-amber-300">
                                                    $
                                                    {formatPrice(
                                                        offer.discount_price
                                                    )}
                                                </span>
                                                <span className="text-sm line-through text-red-500">
                                                    ${formatPrice(offer.price)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-lg font-bold text-amber-300">
                                                ${formatPrice(offer.price)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-400">
                                        Service Fee
                                    </span>
                                    <span className="text-gray-300">
                                        ${formatPrice(serviceFee)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-400">
                                        Booking Fee
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
                                    href={`/book?offer_id=${offer.id}`}
                                    className="block w-full bg-amber-600 hover:bg-amber-500 text-white text-center py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Book Now
                                </Link>
                                <button
                                    onClick={toggleFavorite}
                                    className={`block w-full py-3 rounded-lg text-center transition-all duration-300 ${
                                        favoriteState.is_favorite
                                            ? "bg-red-500 hover:bg-red-600 text-white"
                                            : "bg-transparent border border-amber-500 text-amber-300 hover:bg-amber-900 hover:bg-opacity-20"
                                    }`}
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
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    className="text-center bg-amber-900 bg-opacity-40 rounded-xl p-8 shadow-xl max-w-4xl mx-auto mt-16 border border-amber-800"
                >
                    <h2 className="text-2xl font-bold mb-4">
                        Ready to Grab This{" "}
                        <span className="text-amber-300">Special Offer</span>?
                    </h2>
                    <p className="text-gray-300 mb-6">
                        Book now to secure this limited-time deal and enjoy
                        incredible savings.
                    </p>
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={`/book?offer_id=${offer.id}`}
                        className="inline-block bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg transition-all duration-300"
                    >
                        Book Now
                    </motion.a>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}
