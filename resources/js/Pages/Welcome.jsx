import React, { useState } from "react";
import { Hotel, Info, Plane, Sparkles } from "lucide-react";

const WelcomePage = () => {
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] =
        useState(false);
    const backgroundImage = "/images/world.png";

    return (
        <div className="min-h-screen w-full relative overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${backgroundImage}')` }}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 z-0" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <nav className="flex justify-between items-center p-6 md:px-12 lg:px-16">
                    <div className="flex items-center">
                        <img
                            src="/images/logo.png"
                            alt="Triplus+ Logo"
                            className="h-14 md:h-16 object-contain drop-shadow-lg"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => (window.location.href = "/login")}
                            className="group relative bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 py-2.5 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-green-500/50 hover:scale-105 font-semibold"
                        >
                            <span>Login</span>
                            <Plane className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                    </div>
                </nav>

                <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                    <div className="text-center max-w-4xl space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Sparkles className="w-6 h-6 text-green-400 animate-pulse" />
                                <span className="text-green-400 font-semibold text-sm uppercase tracking-wider">
                                    Your Journey Starts Here
                                </span>
                                <Sparkles className="w-6 h-6 text-green-400 animate-pulse" />
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight text-white drop-shadow-2xl">
                                Welcome to Trip
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
                                    lus
                                </span>
                                <span className="text-amber-400">+</span>
                            </h1>

                            <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-200 max-w-2xl mx-auto drop-shadow-lg">
                                Plan your next adventure with the best travel
                                deals. Find exclusive offers on hotels, flights,
                                and tours.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                            <button
                                onClick={() =>
                                    (window.location.href = "/register")
                                }
                                className="group relative w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-10 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-green-500/50 hover:scale-105 font-bold text-lg"
                            >
                                <span>Start Booking</span>
                                <Plane className="w-5 h-5 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform duration-300" />
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>

                            <button
                                onClick={() =>
                                    (window.location.href = "/about-us")
                                }
                                className="group relative w-full sm:w-auto bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/30 hover:border-white/50 text-white px-10 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:scale-105 font-bold text-lg"
                            >
                                <span>About Us</span>
                                <Info className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                                <Plane className="w-10 h-10 text-green-400 mb-3 mx-auto" />
                                <h3 className="text-white font-bold text-lg mb-2">
                                    Best Flights
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    Exclusive deals on flights worldwide
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                                <Hotel className="w-10 h-10 text-green-400 mb-3 mx-auto" />
                                <h3 className="text-white font-bold text-lg mb-2">
                                    Top Hotels
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    Luxury stays at amazing prices
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                                <Sparkles className="w-10 h-10 text-green-400 mb-3 mx-auto" />
                                <h3 className="text-white font-bold text-lg mb-2">
                                    Easy Booking
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    Simple and secure reservations
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-6 text-center text-gray-400 text-sm">
                    <p>© 2024 Triplus+. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default WelcomePage;
