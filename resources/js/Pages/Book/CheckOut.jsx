import React, { useState, useEffect, useCallback } from "react";
import { Head, usePage, useForm, Link } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Users,
    DollarSign,
    MapPin,
    Star,
    MessageSquare,
    ArrowLeft,
    CheckCircle,
    CreditCard,
    Shield,
    Clock,
    Tag,
    Sparkles,
    Info,
    AlertCircle,
    Check,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../Components/Nav";
import Footer from "../../Components/Footer";

const defaultImage = "https://via.placeholder.com/640x480?text=No+Image";

const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return "N/A";
    }
};

const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
        <Star
            key={i}
            size={14}
            className={
                i < Math.round(rating || 0)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-600"
            }
        />
    ));
};

export default function CheckOut() {
    const { props } = usePage();
    const { auth, destination, package: pkg, offer, flash } = props;
    const user = auth?.user || null;
    const item = destination || pkg || offer || null;

    const [totalPrice, setTotalPrice] = useState(0);
    const [days, setDays] = useState(0);
    const [currentStep, setCurrentStep] = useState(1);

    const canGoBack = window.history.length > 2;

    const handleBack = () => {
        window.history.back();
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        destination_id: destination?.id || null,
        package_id: pkg?.id || null,
        offer_id: offer?.id || null,
        check_in: "",
        check_out: "",
        guests: 1,
        notes: "",
    });

    // Get item type and color
    const getItemType = () => {
        if (destination) return { type: "Destination", color: "blue" };
        if (pkg) return { type: "Package", color: "emerald" };
        if (offer) return { type: "Offer", color: "amber" };
        return { type: "Item", color: "blue" };
    };

    const itemType = getItemType();

    const calculateTotal = useCallback(() => {
        if (!data.check_in || !data.check_out || !item) return;

        const checkIn = new Date(data.check_in);
        const checkOut = new Date(data.check_out);
        const diffDays = Math.ceil(
            (checkOut - checkIn) / (1000 * 60 * 60 * 24)
        );

        if (diffDays > 0) {
            const pricePerGuest = parseFloat(item.discount_price || item.price);
            const total = pricePerGuest * data.guests * diffDays;
            setTotalPrice(total.toFixed(2));
            setDays(diffDays);
        } else {
            setTotalPrice(0);
            setDays(0);
        }
    }, [data.check_in, data.check_out, data.guests, item]);

    useEffect(() => {
        calculateTotal();
    }, [data.check_in, data.check_out, data.guests, calculateTotal]);

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
            reset();
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash, reset]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("book.store"), {
            data: { ...data, total_price: totalPrice },
            onSuccess: () => {
                toast.success("Booking confirmed!");
            },
            onError: (errors) => {
                toast.error("Please fix the form errors.");
                console.error(errors);
            },
        });
    };

    const steps = [
        { number: 1, title: "Trip Details", icon: MapPin },
        { number: 2, title: "Select Dates", icon: Calendar },
        { number: 3, title: "Confirm", icon: CheckCircle },
    ];

    if (!item) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">
                        No Item Selected
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Please select a destination, package, or offer to book.
                    </p>
                    <Link
                        href="/book-now"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        Explore Adventures
                    </Link>
                </div>
            </div>
        );
    }

    const getColorClasses = (color) => {
        const colors = {
            blue: {
                gradient: "from-blue-600 to-cyan-600",
                text: "text-blue-400",
                bg: "bg-blue-500/20",
                border: "border-blue-500/30",
            },
            emerald: {
                gradient: "from-emerald-600 to-teal-600",
                text: "text-emerald-400",
                bg: "bg-emerald-500/20",
                border: "border-emerald-500/30",
            },
            amber: {
                gradient: "from-amber-600 to-orange-600",
                text: "text-amber-400",
                bg: "bg-amber-500/20",
                border: "border-amber-500/30",
            },
        };
        return colors[color] || colors.blue;
    };

    const colorClasses = getColorClasses(itemType.color);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Head>
                <title>Checkout - Complete Your Booking | Triplus</title>
                <meta
                    name="description"
                    content="Complete your booking in a few simple steps"
                />
            </Head>
            <Toaster position="top-right" />
            <Navbar user={user} />

            {/* Back Button */}
            {canGoBack && (
                <button
                    onClick={handleBack}
                    className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm text-white rounded-full border border-gray-700 hover:bg-gray-700 hover:border-emerald-500 transition-all shadow-lg"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Back</span>
                </button>
            )}

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
                        className="mb-12"
                    >
                        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-semibold text-emerald-400">
                                Almost There!
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                            Complete Your
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                                Booking
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Just a few more details and you're all set!
                        </p>
                    </motion.div>

                    {/* Progress Steps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex-1">
                                    <div className="flex items-center">
                                        {/* Step Circle */}
                                        <div className="relative">
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                                    currentStep >= step.number
                                                        ? `bg-gradient-to-r ${colorClasses.gradient} shadow-lg`
                                                        : "bg-gray-800 border-2 border-gray-700"
                                                }`}
                                            >
                                                {currentStep > step.number ? (
                                                    <Check className="w-6 h-6 text-white" />
                                                ) : (
                                                    <step.icon className="w-6 h-6 text-white" />
                                                )}
                                            </div>
                                            <p
                                                className={`absolute top-14 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap ${
                                                    currentStep >= step.number
                                                        ? colorClasses.text
                                                        : "text-gray-500"
                                                }`}
                                            >
                                                {step.title}
                                            </p>
                                        </div>

                                        {/* Connector Line */}
                                        {index < steps.length - 1 && (
                                            <div
                                                className={`flex-1 h-1 mx-4 transition-all ${
                                                    currentStep > step.number
                                                        ? `bg-gradient-to-r ${colorClasses.gradient}`
                                                        : "bg-gray-800"
                                                }`}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Item Details Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className={`w-10 h-10 ${colorClasses.bg} rounded-xl flex items-center justify-center`}
                                >
                                    <MapPin
                                        className={`w-5 h-5 ${colorClasses.text}`}
                                    />
                                </div>
                                <h2 className="text-2xl font-bold">
                                    Your Selection
                                </h2>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Image */}
                                <div className="relative md:w-64 h-48 rounded-xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.image || defaultImage}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = defaultImage;
                                        }}
                                    />
                                    <span
                                        className={`absolute top-3 left-3 px-3 py-1 ${colorClasses.bg} border ${colorClasses.border} backdrop-blur-sm rounded-full text-xs font-semibold ${colorClasses.text}`}
                                    >
                                        {itemType.type}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-3">
                                    <h3 className="text-xl font-bold">
                                        {item.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-gray-400">
                                        <MapPin
                                            className={`w-4 h-4 ${colorClasses.text}`}
                                        />
                                        <span className="text-sm">
                                            {item.location || "N/A"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {renderStars(item.rating)}
                                        <span className="text-xs text-gray-400">
                                            ({item.rating || 0}/5)
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-2">
                                        {item.discount_price ? (
                                            <>
                                                <span
                                                    className={`text-2xl font-bold ${colorClasses.text}`}
                                                >
                                                    $
                                                    {parseFloat(
                                                        item.discount_price
                                                    ).toFixed(2)}
                                                </span>
                                                <span className="text-sm line-through text-gray-500">
                                                    $
                                                    {parseFloat(
                                                        item.price
                                                    ).toFixed(2)}
                                                </span>
                                            </>
                                        ) : (
                                            <span
                                                className={`text-2xl font-bold ${colorClasses.text}`}
                                            >
                                                $
                                                {parseFloat(item.price).toFixed(
                                                    2
                                                )}
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-400">
                                            per person
                                        </span>
                                    </div>

                                    {item.description && (
                                        <p className="text-sm text-gray-400 line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Booking Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className={`w-10 h-10 ${colorClasses.bg} rounded-xl flex items-center justify-center`}
                                >
                                    <Calendar
                                        className={`w-5 h-5 ${colorClasses.text}`}
                                    />
                                </div>
                                <h2 className="text-2xl font-bold">
                                    Booking Details
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Dates */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Check-in Date
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="date"
                                                value={data.check_in}
                                                onChange={(e) =>
                                                    setData(
                                                        "check_in",
                                                        e.target.value
                                                    )
                                                }
                                                min={
                                                    new Date()
                                                        .toISOString()
                                                        .split("T")[0]
                                                }
                                                className={`pl-10 w-full py-3 rounded-xl bg-gray-900/50 border ${
                                                    errors.check_in
                                                        ? "border-red-500"
                                                        : "border-gray-700"
                                                } text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                                                required
                                            />
                                        </div>
                                        {errors.check_in && (
                                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.check_in}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Check-out Date
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="date"
                                                value={data.check_out}
                                                onChange={(e) =>
                                                    setData(
                                                        "check_out",
                                                        e.target.value
                                                    )
                                                }
                                                min={
                                                    data.check_in ||
                                                    new Date()
                                                        .toISOString()
                                                        .split("T")[0]
                                                }
                                                className={`pl-10 w-full py-3 rounded-xl bg-gray-900/50 border ${
                                                    errors.check_out
                                                        ? "border-red-500"
                                                        : "border-gray-700"
                                                } text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                                                required
                                            />
                                        </div>
                                        {errors.check_out && (
                                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.check_out}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Guests */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Number of Guests
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            value={data.guests}
                                            onChange={(e) =>
                                                setData(
                                                    "guests",
                                                    parseInt(e.target.value) ||
                                                        1
                                                )
                                            }
                                            min="1"
                                            max={item.max_guests || 20}
                                            className={`pl-10 w-full py-3 rounded-xl bg-gray-900/50 border ${
                                                errors.guests
                                                    ? "border-red-500"
                                                    : "border-gray-700"
                                            } text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                                            required
                                        />
                                    </div>
                                    {errors.guests && (
                                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.guests}
                                        </p>
                                    )}
                                    {item.max_guests && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Maximum {item.max_guests} guests
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Special Requests (Optional)
                                    </label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) =>
                                                setData("notes", e.target.value)
                                            }
                                            className={`pl-10 w-full py-3 rounded-xl bg-gray-900/50 border ${
                                                errors.notes
                                                    ? "border-red-500"
                                                    : "border-gray-700"
                                            } text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none`}
                                            rows="4"
                                            placeholder="Any special requests or dietary requirements?"
                                            maxLength={500}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        {errors.notes && (
                                            <p className="text-red-400 text-xs flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.notes}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 ml-auto">
                                            {data.notes?.length || 0}/500
                                        </p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={processing}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full bg-gradient-to-r ${colorClasses.gradient} text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Confirm Booking
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>

                    {/* Right Column - Summary (Sticky) */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="sticky top-24 space-y-6"
                        >
                            {/* Price Summary */}
                            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                                <h3 className="text-lg font-bold mb-6">
                                    Booking Summary
                                </h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">
                                            Price per guest
                                        </span>
                                        <span className="font-medium">
                                            $
                                            {parseFloat(
                                                item.discount_price ||
                                                    item.price
                                            ).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">
                                            Number of guests
                                        </span>
                                        <span className="font-medium">
                                            {data.guests}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">
                                            Duration
                                        </span>
                                        <span className="font-medium">
                                            {days} {days === 1 ? "day" : "days"}
                                        </span>
                                    </div>

                                    {item.discount_price && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-emerald-400">
                                                Discount
                                            </span>
                                            <span className="text-emerald-400 font-medium">
                                                -$
                                                {(
                                                    (parseFloat(item.price) -
                                                        parseFloat(
                                                            item.discount_price
                                                        )) *
                                                    data.guests *
                                                    days
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-700 pt-4 flex justify-between">
                                        <span className="font-bold text-lg">
                                            Total
                                        </span>
                                        <span
                                            className={`font-bold text-2xl ${colorClasses.text}`}
                                        >
                                            ${totalPrice}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="bg-gray-900/50 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Cash Payment
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Pay at location
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-2 text-sm">
                                        <p className="font-semibold text-blue-400">
                                            Booking Information
                                        </p>
                                        <ul className="space-y-2 text-gray-300">
                                            <li className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                                <span>
                                                    Free cancellation up to 24h
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                                <span>
                                                    Instant confirmation
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                                <span>
                                                    24/7 customer support
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Security Badge */}
                            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                                <div className="flex items-center gap-3 text-center">
                                    <Shield className="w-6 h-6 text-emerald-400" />
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">
                                            Secure Booking
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Your information is protected
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
