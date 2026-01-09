import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    ArrowLeft,
    Star,
    Heart,
    Check,
    X,
    Clock,
    Users,
    Calendar,
    Shield,
    Award,
    Sparkles,
    TrendingUp,
    Building2,
    BadgeCheck,
    CircleDollarSign,
    Share2,
} from "lucide-react";
import Navbar from "../../Components/Nav";
import Footer from "../../Components/Footer";
import toast, { Toaster } from "react-hot-toast";

export default function PackageDetails({ package: pkg, auth }) {
    const [favoriteState, setFavoriteState] = useState({
        is_favorite: pkg.is_favorite || false,
        favorite_id: pkg.favorite_id || null,
    });
    const [loadingFavorite, setLoadingFavorite] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const user = auth?.user || null;



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
                package_id: pkg.id,
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
                    title: pkg.title,
                    text: pkg.description,
                    url: window.location.href,
                })
                .then(() => toast.success("Shared successfully!"))
                .catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    const serviceFee = 50;
    const bookingFee = 100;
    const basePrice = parseFloat(pkg.discount_price || pkg.price || 0);
    const totalPrice = basePrice + serviceFee + bookingFee;
    const discount = calculateDiscount(pkg.price, pkg.discount_price);

    const imageSrc = pkg.image || "/images/placeholder.jpg";

    // Features/highlights
    const highlights = [
        { icon: Clock, label: "Duration", value: pkg.duration || "Flexible" },
        {
            icon: Users,
            label: "Group Size",
            value: pkg.group_size || "Any size",
        },
        { icon: MapPin, label: "Location", value: pkg.location || "TBA" },
        {
            icon: BadgeCheck,
            label: "Rating",
            value: `${pkg.rating || 0}/5`,
        },
    ];

    const benefits = [
        "Best price guarantee",
        "Free cancellation up to 24h",
        "Instant confirmation",
        "24/7 customer support",
        "Secure payment",
        "Expert local guides",
    ];

    if (!pkg || Object.keys(pkg).length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                <p className="text-center">No package details available.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Head title={`${pkg.title || "Package"} - Triplus`} />
            <Toaster position="top-right" />
            <Navbar user={user} />

            {/* Hero Section with Image */}
            <section className="relative h-[70vh] overflow-hidden">
                {/* Image Background */}
                <div className="absolute inset-0">
                    <img
                        src={imageSrc}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = "/images/placeholder.jpg";
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
                                        <span className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm text-emerald-400 rounded-full text-sm font-semibold">
                                            {pkg.category || "Package"}
                                        </span>
                                        {pkg.is_featured && (
                                            <span className="px-4 py-1.5 bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm text-purple-400 rounded-full text-sm font-semibold">
                                                Featured
                                            </span>
                                        )}
                                        {discount > 0 && (
                                            <span className="px-4 py-1.5 bg-red-600 text-white rounded-full text-sm font-bold">
                                                {discount}% OFF
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                                        {pkg.title}
                                    </h1>

                                    {/* Rating & Location */}
                                    <div className="flex flex-wrap items-center gap-6 text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {renderStars(pkg.rating || 0)}
                                            </div>
                                            <span className="font-semibold">
                                                {pkg.rating || 0}/5
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-emerald-400" />
                                            <span>
                                                {pkg.location || "Location TBA"}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right: Price Card (Mobile at bottom) */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="lg:block hidden"
                            >
                                <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                                    <div className="text-center mb-4">
                                        <p className="text-sm text-gray-400 mb-2">
                                            Starting from
                                        </p>
                                        <div className="flex items-baseline justify-center gap-2">
                                            <span className="text-4xl font-bold text-emerald-400">
                                                ${formatPrice(basePrice)}
                                            </span>
                                            {pkg.discount_price && (
                                                <span className="text-xl text-gray-500 line-through">
                                                    ${formatPrice(pkg.price)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">
                                            per person
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Link
                                            href={`/book?package_id=${pkg.id}`}
                                            className="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-center py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            Book Now
                                        </Link>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={toggleFavorite}
                                                disabled={loadingFavorite}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                                                    favoriteState.is_favorite
                                                        ? "bg-red-600 border-red-500 text-white"
                                                        : "bg-transparent border-gray-700 text-gray-300 hover:border-emerald-500"
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
                                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-emerald-500 transition-all"
                                            >
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
                                        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                                            <item.icon className="w-6 h-6 text-emerald-400" />
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

                        {/* Description Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold">
                                    About This Package
                                </h2>
                            </div>
                            <div className="prose prose-lg prose-invert max-w-none">
                                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                    {pkg.description ||
                                        "No description available."}
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
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
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
                                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <span className="text-gray-300">
                                            {benefit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Company Info */}
                        {pkg.company && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-2xl p-8"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                        <Building2 className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">
                                            Operated by
                                        </h3>
                                        <p className="text-emerald-400 font-semibold text-lg mb-2">
                                            {pkg.company.company_name}
                                        </p>
                                        <p className="text-gray-300 text-sm">
                                            This package is operated by a
                                            verified and trusted travel company
                                            with excellent service standards.
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
                                <div className="text-center mb-6">
                                    <p className="text-sm text-gray-400 mb-2">
                                        Starting from
                                    </p>
                                    <div className="flex items-baseline justify-center gap-2">
                                        <span className="text-4xl font-bold text-emerald-400">
                                            ${formatPrice(basePrice)}
                                        </span>
                                        {pkg.discount_price && (
                                            <span className="text-xl text-gray-500 line-through">
                                                ${formatPrice(pkg.price)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">
                                        per person
                                    </p>
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
                                            <span className="text-emerald-400">
                                                Discount ({discount}%)
                                            </span>
                                            <span className="text-emerald-400">
                                                -$
                                                {formatPrice(
                                                    parseFloat(pkg.price) -
                                                        basePrice
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-700 pt-3 flex justify-between font-bold">
                                        <span>Total</span>
                                        <span className="text-emerald-400 text-lg">
                                            ${formatPrice(totalPrice)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <Link
                                        href={`/book?package_id=${pkg.id}`}
                                        className="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-center py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
                                    >
                                        Book Now
                                    </Link>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={toggleFavorite}
                                            disabled={loadingFavorite}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                                                favoriteState.is_favorite
                                                    ? "bg-red-600 border-red-500 text-white"
                                                    : "bg-transparent border-gray-700 text-gray-300 hover:border-emerald-500"
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
                                            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-emerald-500 transition-all"
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
                            </div>

                            {/* Trust Badges */}
                            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                    Why Book With Us?
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Award className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Best Price Guarantee
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Find it cheaper? We'll refund
                                                the difference
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CircleDollarSign className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Free Cancellation
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Cancel up to 24h before for a
                                                full refund
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Secure Payment
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Your payment information is safe
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-500/30 rounded-3xl p-12 text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready for an{" "}
                        <span className="text-emerald-400">
                            Unforgettable Experience
                        </span>
                        ?
                    </h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                        Book now and embark on an incredible journey that you'll
                        remember forever.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={`/book?package_id=${pkg.id}`}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                        >
                            Book This Package
                            <Calendar className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/packages"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-emerald-500 rounded-xl font-semibold hover:bg-emerald-500/10 transition-all"
                        >
                            Explore More Packages
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Mobile Floating Book Button */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 p-4 z-40">
                <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
                    <div>
                        <p className="text-xs text-gray-400">From</p>
                        <p className="text-2xl font-bold text-emerald-400">
                            ${formatPrice(basePrice)}
                        </p>
                    </div>
                    <Link
                        href={`/book?package_id=${pkg.id}`}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center py-3 rounded-xl font-semibold"
                    >
                        Book Now
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    );
}
