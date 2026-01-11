import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { motion } from "framer-motion";
import {
    MapPin,
    ArrowLeft,
    Star,
    Heart,
    Calendar,
    Tag,
    Users,
    Check,
    Sparkles,
    BadgeCheck,
    Shield,
    Award,
    CircleDollarSign,
    Share2,
    Clock,
    Zap,
    Percent,
    TrendingUp,
    AlertTriangle,
} from "lucide-react";
import Navbar from "../../Components/Nav";
import Footer from "../../Components/Footer";
import toast, { Toaster } from "react-hot-toast";

export default function Show({ offer = {}, auth }) {
    const [favoriteState, setFavoriteState] = useState({
        is_favorite: offer.is_favorite || false,
        favorite_id: offer.favorite_id || null,
    });
    const [loadingFavorite, setLoadingFavorite] = useState(false);
    const user = auth?.user || null;

    const canGoBack = window.history.length > 2;

    // التحقق من انتهاء العرض
    const isOfferExpired = offer.is_expired || false;

    const handleBack = () => {
        window.history.back();
    };

    const calculateDiscount = (original, discounted) => {
        const orig = parseFloat(original);
        const disc = parseFloat(discounted);
        if (!orig || !disc || orig <= disc) return 0;
        return Math.round(((orig - disc) / orig) * 100);
    };

    const renderStars = (rating = 0) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={18}
                className={
                    i < Math.round(rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-600"
                }
            />
        ));
    };

    const formatPrice = (price) => {
        const parsed = parseFloat(price);
        return isNaN(parsed) ? "0.00" : parsed.toFixed(2);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
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
        if (!user) {
            toast.error("Please log in to add to favorites");
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
                offer_id: offer.id,
            });

            const { success, message, is_favorite, favorite_id } =
                response.data;

            if (success) {
                setFavoriteState({ is_favorite, favorite_id });
                toast.success(message);
            } else {
                toast.error(message);
                setFavoriteState(prevState);
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to toggle favorite.";
            toast.error(errorMessage);
            setFavoriteState(prevState);
        } finally {
            setLoadingFavorite(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: offer.title,
                    text: offer.description,
                    url: window.location.href,
                })
                .then(() => toast.success("Shared successfully!"))
                .catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    const serviceFee = 9.99;
    const bookingFee = 4.99;
    const basePrice = parseFloat(offer.discount_price || offer.price || 0);
    const totalPrice = basePrice + serviceFee + bookingFee;
    const discount = calculateDiscount(offer.price, offer.discount_price);
    const daysLeft = getDaysLeft(offer.end_date);

    const imageSrc =
        offer.image ||
        "https://via.placeholder.com/1200x800?text=Special+Offer";

    // Highlights
    const highlights = [
        {
            icon: Percent,
            label: "Discount",
            value: discount > 0 ? `${discount}% OFF` : "Special Price",
        },
        {
            icon: Users,
            label: "Max Guests",
            value: offer.max_guests || "Unlimited",
        },
        {
            icon: Calendar,
            label: "Valid Until",
            value: formatDate(offer.end_date),
        },
        {
            icon: Tag,
            label: "Type",
            value: offer.discount_type || "Special Offer",
        },
    ];

    const benefits = [
        "Limited-time special pricing",
        "Best value guarantee",
        "Instant confirmation",
        "Free cancellation up to 24h",
        "24/7 customer support",
        "Secure booking process",
    ];

    if (!offer || Object.keys(offer).length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                <p className="text-xl">No offer details available.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Head title={`${offer.title || "Special Offer"} - Triplus`} />
            <Toaster position="top-right" />
            <Navbar user={user} />

            {/* Back Button */}
            {canGoBack && (
                <button
                    onClick={handleBack}
                    className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm text-white rounded-full border border-gray-700 hover:bg-gray-700 hover:border-amber-500 transition-all shadow-lg"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Back</span>
                </button>
            )}

            {/* Hero Section with Image */}
            <section className="relative h-[70vh] overflow-hidden">
                {/* Image Background */}
                <div className="absolute inset-0">
                    <img
                        src={imageSrc}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src =
                                "https://via.placeholder.com/1200x800?text=Special+Offer";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative h-full flex items-end">
                    <div className="max-w-7xl mx-auto px-6 pb-12 w-full">
                        <div className="grid lg:grid-cols-3 gap-8 items-end">
                            {/* Left: Title & Info */}
                            <div className="lg:col-span-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2">
                                        {!isOfferExpired ? (
                                            <>
                                                <span className="px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm text-amber-400 rounded-full text-sm font-semibold flex items-center gap-2">
                                                    <Zap className="w-4 h-4" />
                                                    Special Offer
                                                </span>
                                                {offer.discount_type && (
                                                    <span className="px-4 py-1.5 bg-orange-500/20 border border-orange-500/30 backdrop-blur-sm text-orange-400 rounded-full text-sm font-semibold">
                                                        {offer.discount_type}
                                                    </span>
                                                )}
                                                {discount > 0 && (
                                                    <span className="px-4 py-1.5 bg-red-600 text-white rounded-full text-sm font-bold">
                                                        {discount}% OFF
                                                    </span>
                                                )}
                                                {daysLeft !== null &&
                                                    daysLeft <= 7 && (
                                                        <span className="px-4 py-1.5 bg-red-600 text-white rounded-full text-sm font-bold animate-pulse">
                                                            {daysLeft} Days
                                                            Left!
                                                        </span>
                                                    )}
                                            </>
                                        ) : (
                                            <span className="px-4 py-1.5 bg-red-600/20 border border-red-500/30 backdrop-blur-sm text-red-400 rounded-full text-sm font-semibold flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" />
                                                Offer Expired
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                                        {offer.title || "Special Offer"}
                                    </h1>

                                    {/* Rating & Location */}
                                    <div className="flex flex-wrap items-center gap-6 text-gray-300">
                                        {offer.rating && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {renderStars(offer.rating)}
                                                </div>
                                                <span className="font-semibold">
                                                    {offer.rating}/5
                                                </span>
                                            </div>
                                        )}
                                        {offer.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-amber-400" />
                                                <span>{offer.location}</span>
                                            </div>
                                        )}
                                        {offer.end_date && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-amber-400" />
                                                <span>
                                                    Valid until{" "}
                                                    {formatDate(offer.end_date)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right: Price Card (Desktop only) */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="lg:block hidden"
                            >
                                {!isOfferExpired ? (
                                    <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                                        <div className="text-center mb-4">
                                            <p className="text-sm text-gray-400 mb-2">
                                                Special Price
                                            </p>
                                            <div className="flex items-baseline justify-center gap-2">
                                                <span className="text-4xl font-bold text-amber-400">
                                                    ${formatPrice(basePrice)}
                                                </span>
                                                {offer.discount_price && (
                                                    <span className="text-xl text-gray-500 line-through">
                                                        $
                                                        {formatPrice(
                                                            offer.price
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">
                                                per person
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <Link
                                                href={`/book?offer_id=${offer.id}`}
                                                className="block w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-center py-3 rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20"
                                            >
                                                Grab This Deal
                                            </Link>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={toggleFavorite}
                                                    disabled={loadingFavorite}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                                                        favoriteState.is_favorite
                                                            ? "bg-red-600 border-red-500 text-white"
                                                            : "bg-transparent border-gray-700 text-gray-300 hover:border-amber-500"
                                                    }`}
                                                >
                                                    <Heart
                                                        className={`w-5 h-5 ${
                                                            favoriteState.is_favorite
                                                                ? "fill-white"
                                                                : ""
                                                        }`}
                                                    />
                                                </button>
                                                <button
                                                    onClick={handleShare}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-amber-500 transition-all"
                                                >
                                                    <Share2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-red-900/30 backdrop-blur-sm border border-red-500 rounded-2xl p-6 text-center">
                                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertTriangle className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-red-400 mb-2">
                                            Offer Expired
                                        </h3>
                                        <p className="text-gray-300 text-sm mb-4">
                                            This offer is no longer available
                                            for booking
                                        </p>
                                        <Link
                                            href="/offers"
                                            className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition font-semibold"
                                        >
                                            View Active Offers
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Expired Warning Banner - Mobile & Desktop */}
                        {isOfferExpired && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-900/30 border border-red-500 rounded-2xl p-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-red-400 mb-2">
                                            ⚠️ This Offer Has Expired
                                        </h3>
                                        <p className="text-gray-300 mb-4">
                                            This offer ended on{" "}
                                            {formatDate(offer.end_date)} and is
                                            no longer available for booking.
                                            Check out our other active offers!
                                        </p>
                                        <Link
                                            href="/offers"
                                            className="inline-block px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition font-semibold"
                                        >
                                            Browse Active Offers
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Quick Info Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {highlights.map((item, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 text-center"
                                    >
                                        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                                            <item.icon className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            {item.label}
                                        </p>
                                        <p className="text-sm font-semibold text-white">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Urgency Banner - only if not expired */}
                        {!isOfferExpired &&
                            daysLeft !== null &&
                            daysLeft <= 7 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-500/30 rounded-2xl p-6"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center animate-pulse">
                                            <Zap className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-red-400 mb-2">
                                                ⚡ Limited Time Offer!
                                            </h3>
                                            <p className="text-gray-300">
                                                {daysLeft === 0
                                                    ? "This offer ends today! "
                                                    : `Only ${daysLeft} day${
                                                          daysLeft !== 1
                                                              ? "s"
                                                              : ""
                                                      } left to grab this amazing deal! `}
                                                Don't miss out on these special
                                                savings.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        {/* Description Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                </div>
                                <h2 className="text-2xl font-bold">
                                    About This Offer
                                </h2>
                            </div>
                            <div className="prose prose-lg prose-invert max-w-none">
                                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                    {offer.description ||
                                        "Take advantage of this exclusive special offer! Limited availability - book now to secure your spot at an incredible price."}
                                </p>
                            </div>
                        </motion.div>

                        {/* What's Included */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                                    <BadgeCheck className="w-5 h-5 text-amber-400" />
                                </div>
                                <h2 className="text-2xl font-bold">
                                    What's Included
                                </h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                                {benefits.map((benefit, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-3"
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <span className="text-gray-300">
                                            {benefit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Offer Validity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-amber-400" />
                                </div>
                                <h2 className="text-2xl font-bold">
                                    Offer Validity
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 bg-gray-900/50 rounded-lg p-4">
                                    <Calendar className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-white mb-1">
                                            Valid Period
                                        </p>
                                        <p className="text-gray-300">
                                            {formatDate(offer.start_date)} -{" "}
                                            {formatDate(offer.end_date)}
                                        </p>
                                        {isOfferExpired && (
                                            <p className="text-red-400 text-sm mt-2 font-semibold">
                                                ⚠️ This offer has expired
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {offer.max_guests && (
                                    <div className="flex items-start gap-4 bg-gray-900/50 rounded-lg p-4">
                                        <Users className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="font-semibold text-white mb-1">
                                                Maximum Guests
                                            </p>
                                            <p className="text-gray-300">
                                                Up to {offer.max_guests} people
                                                per booking
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Location (if available) */}
                        {offer.location && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold">
                                        Location
                                    </h2>
                                </div>
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-lg font-semibold text-amber-400 mb-2">
                                            {offer.location}
                                        </p>
                                        <p className="text-gray-300">
                                            This offer is available at this
                                            location. Full details will be
                                            provided after booking.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Booking Card (Sticky) */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="sticky top-24 space-y-6"
                        >
                            {/* Main Booking Card */}
                            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                                {!isOfferExpired ? (
                                    <>
                                        <div className="text-center mb-6">
                                            <p className="text-sm text-gray-400 mb-2">
                                                Special Price
                                            </p>
                                            <div className="flex items-baseline justify-center gap-2">
                                                <span className="text-4xl font-bold text-amber-400">
                                                    ${formatPrice(basePrice)}
                                                </span>
                                                {offer.discount_price && (
                                                    <span className="text-xl text-gray-500 line-through">
                                                        $
                                                        {formatPrice(
                                                            offer.price
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">
                                                per person
                                            </p>
                                            {discount > 0 && (
                                                <p className="text-emerald-400 font-semibold mt-2">
                                                    Save $
                                                    {formatPrice(
                                                        parseFloat(
                                                            offer.price
                                                        ) - basePrice
                                                    )}{" "}
                                                    ({discount}% OFF)
                                                </p>
                                            )}
                                        </div>

                                        {/* Price Breakdown */}
                                        <div className="space-y-3 mb-6 bg-gray-900/50 rounded-xl p-4">
                                            <h4 className="text-sm font-semibold text-gray-400 mb-3">
                                                PRICE BREAKDOWN
                                            </h4>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">
                                                    Base price
                                                </span>
                                                <span className="text-white">
                                                    ${formatPrice(basePrice)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">
                                                    Service fee
                                                </span>
                                                <span className="text-white">
                                                    ${formatPrice(serviceFee)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">
                                                    Booking fee
                                                </span>
                                                <span className="text-white">
                                                    ${formatPrice(bookingFee)}
                                                </span>
                                            </div>
                                            {discount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-amber-400">
                                                        Discount ({discount}%)
                                                    </span>
                                                    <span className="text-amber-400">
                                                        -$
                                                        {formatPrice(
                                                            parseFloat(
                                                                offer.price
                                                            ) - basePrice
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-700 pt-3 flex justify-between font-bold">
                                                <span>Total</span>
                                                <span className="text-amber-400 text-lg">
                                                    ${formatPrice(totalPrice)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3">
                                            <Link
                                                href={`/book?offer_id=${offer.id}`}
                                                className="block w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-center py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20"
                                            >
                                                Grab This Deal
                                            </Link>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={toggleFavorite}
                                                    disabled={loadingFavorite}
                                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                                                        favoriteState.is_favorite
                                                            ? "bg-red-600 border-red-500 text-white"
                                                            : "bg-transparent border-gray-700 text-gray-300 hover:border-amber-500"
                                                    }`}
                                                >
                                                    <Heart
                                                        className={`w-5 h-5 ${
                                                            favoriteState.is_favorite
                                                                ? "fill-white"
                                                                : ""
                                                        }`}
                                                    />
                                                    <span className="text-sm">
                                                        {favoriteState.is_favorite
                                                            ? "Saved"
                                                            : "Save"}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={handleShare}
                                                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-amber-500 transition-all"
                                                >
                                                    <Share2 className="w-5 h-5" />
                                                    <span className="text-sm">
                                                        Share
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-center text-xs text-gray-500 mt-4">
                                            🔒 No payment required to book
                                        </p>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertTriangle className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-red-400 mb-3">
                                            Offer Expired
                                        </h3>
                                        <p className="text-gray-300 text-sm mb-6">
                                            This offer is no longer available
                                            for booking. Check out our other
                                            active offers!
                                        </p>
                                        <Link
                                            href="/offers"
                                            className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl transition font-semibold text-white"
                                        >
                                            View Active Offers
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Trust Badges - only if not expired */}
                            {!isOfferExpired && (
                                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-amber-400" />
                                        Why Book This Offer?
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <TrendingUp className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Best Value
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Exclusive pricing you won't
                                                    find elsewhere
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Limited Time
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Don't miss this special
                                                    opportunity
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Secure Booking
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Your information is
                                                    protected
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
