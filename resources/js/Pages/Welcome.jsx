import React, { useState } from "react";
import { Hotel, InfoIcon, Plane } from "lucide-react"; 

const WelcomePage = () => {
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const backgroundImage = "/images/world.svg";

    return (
        <div className="min-h-screen w-full relative overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${backgroundImage}')` }}
            />

            <div className="absolute inset-0 bg-black opacity-50 z-0" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <nav className="flex justify-between items-center p-6">
                    {/* Logo */}
                    <div className="flex items-center">
                        <img
                            src="/images/logo.png"
                            alt="Triplus+ Logo"
                            className="h-16 object-contain"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => (window.location.href = "/login")}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full transition-colors flex items-center"
                        >
                            Login <Plane className="ml-2 w-5 h-5" />
                        </button>
                    </div>
                </nav>

                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center max-w-3xl">
                        <h1 className="text-6xl font-black mb-6 leading-tight text-white">
                            Welcome to Trip
                            <span className="text-green-500">lus</span>
                        </h1>
                        <p className="text-xl mb-8 leading-relaxed text-gray-300">
                            Plan your next adventure with the best travel deals.
                            Find exclusive offers on hotels, flights, and tours.
                            Book your dream vacation today and travel the world!
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() =>
                                    (window.location.href = "/register")
                                }
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full transition-colors flex items-center"
                            >
                                Start Booking <Plane className="ml-2" />
                            </button>
                            <button
                                onClick={() =>
                                    (window.location.href = "/about-us")
                                }
                                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-full transition-colors flex items-center"
                            >
                                About US <InfoIcon className="ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
