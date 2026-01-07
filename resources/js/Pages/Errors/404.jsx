import React, { useEffect, useState } from "react";
import {
    Home,
    Compass,
    Map,
    AlertCircle,
    ChevronsLeft,
    Hotel,
} from "lucide-react";
import { Link } from "@inertiajs/react";

const NotFoundPage = () => {
    const [animationComplete, setAnimationComplete] = useState(false);
    const backgroundImage = "/images/world.png";

    useEffect(() => {
        // Trigger animation after component mount
        const timer = setTimeout(() => {
            setAnimationComplete(true);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen w-full relative overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${backgroundImage}')` }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black opacity-50 z-0" />

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Navbar */}
                <nav className="flex justify-between items-center p-6">
                    <div className="flex items-center">
                        <Hotel className="w-10 h-10 text-green-500 mr-3" />
                        <h1 className="text-3xl font-bold text-white">
                            Trip<span className="text-green-500">lus</span>
                        </h1>
                    </div>
                    <Link
                        href={route("home")}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full transition-colors flex items-center"
                    >
                        Home <Home className="ml-2 w-5 h-5" />
                    </Link>
                </nav>

                {/* 404 Content */}
                <div className="flex-1 flex items-center justify-center p-5">
                    <div className="text-center max-w-3xl">
                        <div
                            className={`mb-8 transition-all duration-700 transform ${
                                animationComplete
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-10 opacity-0"
                            }`}
                        >
                            {/* Animated Icon */}
                            <div className="inline-block relative">
                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                                <div className="relative z-10 bg-gray-800 p-6 rounded-full shadow-lg">
                                    <Compass className="w-20 h-20 text-green-500 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <h1
                            className={`text-6xl font-black mb-6 leading-tight text-white transition-all duration-700 delay-100 transform ${
                                animationComplete
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-10 opacity-0"
                            }`}
                        >
                            4
                            <span className="text-green-500 inline-block animate-bounce">
                                0
                            </span>
                            4
                        </h1>

                        <h2
                            className={`text-3xl font-bold mb-6 text-white transition-all duration-700 delay-200 transform ${
                                animationComplete
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-10 opacity-0"
                            }`}
                        >
                            Not Found
                        </h2>

                        <p
                            className={`text-xl mb-8 leading-relaxed text-gray-300 transition-all duration-700 delay-300 transform ${
                                animationComplete
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-10 opacity-0"
                            }`}
                        >
                            It seems you've ventured off the mapped route. This
                            destination doesn't exist in our travel catalog.
                            Let's get you back on track to continue planning
                            your perfect getaway.
                        </p>

                        {/* Action buttons */}
                        <div
                            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-400 transform ${
                                animationComplete
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-10 opacity-0"
                            }`}
                        >
                            <Link
                                href={route("home")}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full transition-colors flex items-center justify-center"
                            >
                                <Map className="mr-2 w-5 h-5" />
                                Back to Homepage
                            </Link>
                            <button
                                onClick={() => window.history.back()}
                                className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-full transition-colors flex items-center justify-center mt-4 sm:mt-0"
                            >
                                <ChevronsLeft className="mr-2 w-5 h-5" />
                                Return to Previous Page
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
