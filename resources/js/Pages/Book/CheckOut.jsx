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
    const stars = [];
    const roundedRating = Math.round((rating || 0) * 2) / 2;
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

export default function CheckOut() {
    const { props } = usePage();
    const { auth, destination, package: pkg, offer, flash } = props;
    const user = auth?.user || null;
    const item = destination || pkg || offer || null;

    const [isDarkMode, setIsDarkMode] = useState(true);
    const [totalPrice, setTotalPrice] = useState(0);
    const [days, setDays] = useState(0);

    const { data, setData, post, processing, errors, reset } = useForm({
        destination_id: destination?.id || null,
        package_id: pkg?.id || null,
        offer_id: offer?.id || null,
        check_in: "",
        check_out: "",
        guests: 1,
        notes: "",
    });

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

    if (!item) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-4">
                        No Item Selected
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Please select a destination, package, or offer to book.
                    </p>
                    <Link
                        href="/destinations"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300"
                    >
                        Explore Destinations
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen ${
                isDarkMode
                    ? "bg-gray-900 text-white"
                    : "bg-gray-50 text-gray-900"
            }`}
        >
            <Head>
                <title>Checkout - Triplus</title>
                <meta
                    name="description"
                    content="Finalize your booking with Triplus."
                />
            </Head>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

            <Navbar
                user={user}
                isDarkMode={isDarkMode}
                toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />

            {/* Header */}
            <section className="relative h-48 bg-gradient-to-r from-gray-800 to-gray-900">
                <div className="absolute inset-0 flex items-center justify-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold">
                            Book Your{" "}
                            <span className="text-blue-500">Adventure</span>
                        </h1>
                        <p className="text-sm md:text-base text-gray-300 mt-2">
                            Complete your booking in a few simple steps
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Item Details */}
                        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4">
                                Trip Details
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <img
                                    src={item.image || defaultImage}
                                    alt={item.title}
                                    className="w-full sm:w-48 h-48 object-cover rounded-lg"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = defaultImage;
                                    }}
                                />
                                <div className="flex-1 space-y-3">
                                    <h3 className="text-lg font-semibold">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <MapPin
                                            size={16}
                                            className="text-blue-500"
                                        />
                                        {item.location || "N/A"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {renderStars(item.rating)}
                                        <span className="text-xs text-gray-400 ml-1">
                                            ({item.rating || 0}/5)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <DollarSign
                                            size={16}
                                            className="text-blue-500"
                                        />
                                        {item.discount_price ? (
                                            <>
                                                <span className="text-blue-500">
                                                    $
                                                    {parseFloat(
                                                        item.discount_price
                                                    ).toFixed(2)}
                                                </span>
                                                <span className="line-through text-gray-400 ml-1">
                                                    $
                                                    {parseFloat(
                                                        item.price
                                                    ).toFixed(2)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-blue-500">
                                                $
                                                {parseFloat(item.price).toFixed(
                                                    2
                                                )}
                                            </span>
                                        )}
                                        <span className="text-gray-400">
                                            /person
                                        </span>
                                    </div>
                                    {(pkg || offer) &&
                                        item.start_date &&
                                        item.end_date && (
                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                <Calendar
                                                    size={16}
                                                    className="text-blue-500"
                                                />
                                                {formatDate(item.start_date)} -{" "}
                                                {formatDate(item.end_date)}
                                            </div>
                                        )}
                                    <p className="text-xs text-gray-400 line-clamp-3">
                                        {item.description ||
                                            "No description available."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Booking Summary */}
                        <div className="lg:col-span-1 bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                            <h2 className="text-lg font-semibold mb-4">
                                Booking Summary
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">
                                        Price per Guest
                                    </span>
                                    <span>
                                        $
                                        {parseFloat(
                                            item.discount_price || item.price
                                        ).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">
                                        Guests
                                    </span>
                                    <span>{data.guests}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">
                                        Duration
                                    </span>
                                    <span>
                                        {days} {days === 1 ? "day" : "days"}
                                    </span>
                                </div>
                                <hr className="border-gray-700" />
                                <div className="flex justify-between font-semibold">
                                    <span>Total Price</span>
                                    <span className="text-blue-500">
                                        ${totalPrice}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-4 bg-gray-700 p-3 rounded-lg">
                                    <CreditCard
                                        size={16}
                                        className="text-blue-500"
                                    />
                                    <span className="text-sm text-gray-300">
                                        Cash (Pay at location)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Booking Form */}
                        <div className="lg:col-span-3 bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4">
                                Complete Your Booking
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">
                                            Check-in Date
                                        </label>
                                        <div className="relative">
                                            <Calendar
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                size={16}
                                            />
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
                                                className={`pl-10 pr-3 w-full py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                                                    errors.check_in
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                                required
                                            />
                                        </div>
                                        {errors.check_in && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.check_in}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">
                                            Check-out Date
                                        </label>
                                        <div className="relative">
                                            <Calendar
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                size={16}
                                            />
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
                                                className={`pl-10 pr-3 w-full py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                                                    errors.check_out
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                                required
                                            />
                                        </div>
                                        {errors.check_out && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.check_out}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                        Number of Guests
                                    </label>
                                    <div className="relative">
                                        <Users
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            size={16}
                                        />
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
                                            max="8"
                                            className={`pl-10 pr-3 w-full py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                                                errors.guests
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                            required
                                        />
                                    </div>
                                    {errors.guests && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.guests}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                        Additional Notes
                                    </label>
                                    <div className="relative">
                                        <MessageSquare
                                            className="absolute left-3 top-3 text-gray-400"
                                            size={16}
                                        />
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) =>
                                                setData("notes", e.target.value)
                                            }
                                            className={`pl-10 pr-3 w-full py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resize-y min-h-[80px] ${
                                                errors.notes
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                            placeholder="Any special requests?"
                                            maxLength={500}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {data.notes?.length || 0}/500
                                    </p>
                                    {errors.notes && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <Link
                                        href={
                                            item.destination_id
                                                ? `/destinations/${item.id}`
                                                : "/destinations"
                                        }
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
                                    >
                                        <ArrowLeft size={16} />
                                        Back
                                    </Link>
                                    <motion.button
                                        type="submit"
                                        disabled={processing}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ${
                                            processing
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                    >
                                        <CheckCircle size={16} />
                                        Confirm Booking
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
