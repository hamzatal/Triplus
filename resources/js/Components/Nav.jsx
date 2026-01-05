import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
} from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import {
    Menu,
    X,
    Search,
    Plane,
    Map,
    BookOpen,
    Bookmark,
    Mail,
    User,
    LogOut,
    LayoutDashboard,
    Building2,
    PackageCheck,
    Home,
    ArrowRight,
} from "lucide-react";

axios.defaults.baseURL = window.location.origin;

const cn = (...classes) => classes.filter(Boolean).join(" ");

const NavV2 = ({ isDarkMode = true, wishlist = [] }) => {
    const { url, props } = usePage();
    const { auth } = props;

    const [scrolled, setScrolled] = useState(false);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState([]);

    const profileRef = useRef(null);
    const searchPanelRef = useRef(null);

    const isActive = useCallback(
        (href) => (href === "/" ? url === "/" : url?.startsWith(href)),
        [url]
    );

    const navItems = useMemo(
        () => [
            { label: "Home", href: "/home", icon: Home, color: "text-sky-400" },
            {
                label: "Packages",
                href: "/packages",
                icon: PackageCheck,
                color: "text-emerald-400",
            },
            {
                label: "Destinations",
                href: "/destinations",
                icon: Map,
                color: "text-indigo-400",
            },
            {
                label: "Offers",
                href: "/offers",
                icon: Bookmark,
                color: "text-amber-400",
            },
            {
                label: "About Us",
                href: "/about-us",
                icon: BookOpen,
                color: "text-violet-400",
            },
            {
                label: "Contact",
                href: "/ContactPage",
                icon: Mail,
                color: "text-rose-400",
            },
        ],
        []
    );

    const userDropdownItems = useMemo(
        () => [
            {
                label: "My Bookings",
                href: "/UserBookings",
                icon: Plane,
                method: "get",
            },
            {
                label: "Profile",
                href: "/UserProfile",
                icon: User,
                method: "get",
            },
            {
                label: "Logout",
                href: route("logout"),
                icon: LogOut,
                method: "post",
            },
        ],
        []
    );

    const companyDropdownItems = useMemo(
        () => [
            {
                label: "Dashboard",
                href: route("company.dashboard"),
                icon: LayoutDashboard,
                method: "get",
            },
            {
                label: "Company Profile",
                href: route("company.profile"),
                icon: Building2,
                method: "get",
            },
            {
                label: "Logout",
                href: route("company.logout"),
                icon: LogOut,
                method: "post",
            },
        ],
        []
    );

    // Detect company-user shape (same idea as your code)
    const isCompanyUser =
        auth?.user && (auth.user.company_name || auth.user.license_number);
    const effectiveUser = isCompanyUser ? null : auth?.user;
    const effectiveCompany = isCompanyUser ? auth?.user : auth?.company;

    const avatarUrl = effectiveUser?.avatar_url || "/images/avatar.webp";

    const closeAllOverlays = useCallback(() => {
        setMobileOpen(false);
        setProfileOpen(false);
        setSearchOpen(false);
    }, []);

    // Scroll effect
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close overlays on route change
    useEffect(() => {
        closeAllOverlays();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    // Click outside
    useEffect(() => {
        const onDown = (e) => {
            if (
                profileOpen &&
                profileRef.current &&
                !profileRef.current.contains(e.target)
            ) {
                setProfileOpen(false);
            }
            if (
                searchOpen &&
                searchPanelRef.current &&
                !searchPanelRef.current.contains(e.target)
            ) {
                setSearchOpen(false);
                setQuery("");
                setResults([]);
            }
        };

        const onKey = (e) => {
            if (e.key === "Escape") {
                setMobileOpen(false);
                setProfileOpen(false);
                setSearchOpen(false);
                setQuery("");
                setResults([]);
            }
        };

        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [profileOpen, searchOpen]);

    // Live search (debounced + abort)
    useEffect(() => {
        const q = query.trim();
        if (!q) {
            setResults([]);
            setSearching(false);
            return;
        }

        const controller = new AbortController();
        setSearching(true);

        const t = setTimeout(async () => {
            try {
                const res = await axios.get("/search/live", {
                    params: { q },
                    signal: controller.signal,
                });
                setResults(res.data?.results || []);
            } catch (err) {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 250);

        return () => {
            clearTimeout(t);
            controller.abort();
        };
    }, [query]);

    const getItemUrl = (item) => {
        switch (item.type) {
            case "destination":
                return `/destinations/${item.id}`;
            case "package":
                return `/packages/${item.id}`;
            case "offer":
                return `/offers/${item.id}`;
            default:
                return "#";
        }
    };

    const onSelectResult = (item) => {
        const href = getItemUrl(item);
        if (href && href !== "#") router.visit(href);
        setSearchOpen(false);
        setQuery("");
        setResults([]);
    };

    const formatPrice = (price, discountPrice) => {
        const p = Number(price || 0);
        const d = discountPrice ? Number(discountPrice) : null;
        if (d && !Number.isNaN(d))
            return `$${d.toFixed(2)} (was $${p.toFixed(2)})`;
        if (!Number.isNaN(p)) return `$${p.toFixed(2)}`;
        return "";
    };

    const NavLinkPill = ({ item, onClick }) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
            <Link
                href={item.href}
                onClick={onClick}
                className={cn(
                    "group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                    active
                        ? "bg-emerald-500/15 text-white ring-1 ring-emerald-400/30"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
            >
                <Icon
                    className={cn(
                        "h-5 w-5 transition",
                        item.color,
                        active && "drop-shadow"
                    )}
                />
                <span className="whitespace-nowrap">{item.label}</span>
                {active && (
                    <span className="absolute inset-x-3 -bottom-[9px] h-[2px] rounded-full bg-gradient-to-r from-emerald-400/0 via-emerald-400/70 to-emerald-400/0" />
                )}
            </Link>
        );
    };

    const ProfileButton = () => {
        if (!auth || (!auth.user && !auth.company)) return null;

        return (
            <div className="relative" ref={profileRef}>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setProfileOpen((v) => !v);
                    }}
                    className={cn(
                        "h-10 w-10 overflow-hidden rounded-full border transition",
                        "border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/15",
                        "focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    )}
                    aria-label="Profile menu"
                >
                    {effectiveUser ? (
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="grid h-full w-full place-items-center">
                            <Building2 className="h-5 w-5 text-emerald-200" />
                        </div>
                    )}
                </button>

                <AnimatePresence>
                    {profileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.18 }}
                            className={cn(
                                "absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border",
                                "border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl"
                            )}
                        >
                            <div className="px-4 py-3 border-b border-white/10">
                                <div className="text-sm text-white/90">
                                    {effectiveUser
                                        ? effectiveUser.name || "User"
                                        : effectiveCompany?.company_name ||
                                          "Company"}
                                </div>
                                <div className="text-xs text-white/50 truncate">
                                    {effectiveUser?.email ||
                                        effectiveCompany?.email ||
                                        ""}
                                </div>
                            </div>

                            {(effectiveUser
                                ? userDropdownItems
                                : companyDropdownItems
                            ).map((it) => {
                                const Icon = it.icon;
                                return (
                                    <Link
                                        key={it.label}
                                        href={it.href}
                                        method={it.method || "get"}
                                        as={it.method ? "button" : "a"}
                                        className={cn(
                                            "w-full text-left flex items-center gap-2 px-4 py-3 text-sm transition",
                                            "text-white/80 hover:text-white hover:bg-white/5"
                                        )}
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        <Icon className="h-4 w-4 text-emerald-300" />
                                        <span>{it.label}</span>
                                        <ArrowRight className="ml-auto h-4 w-4 text-white/30" />
                                    </Link>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50",
                "h-20",
                "border-b border-emerald-400/10",
                scrolled ? "bg-black/70 backdrop-blur-xl" : "bg-transparent"
            )}
        >
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 md:px-8">
                {/* Logo */}
                <Link href="/home" className="flex items-center gap-3">
                    <img
                        src="/images/logo.png"
                        alt="Triplus+ Logo"
                        className="h-14 w-auto object-contain"
                    />
                </Link>

                {/* Center Nav (Desktop) */}
                <nav className="hidden lg:flex items-center">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-2 backdrop-blur">
                        {navItems.map((item) => (
                            <NavLinkPill key={item.href} item={item} />
                        ))}
                    </div>
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    {/* Search button */}
                    <button
                        type="button"
                        onClick={() => setSearchOpen(true)}
                        className={cn(
                            "h-10 w-10 rounded-full border transition",
                            "border-white/10 bg-white/5 hover:bg-white/10",
                            "focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        )}
                        aria-label="Search"
                    >
                        <Search className="mx-auto h-5 w-5 text-emerald-300" />
                    </button>

                    {/* Book now (desktop) */}
                    <Link
                        href="/booking"
                        className={cn(
                            "hidden md:flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition",
                            "bg-amber-500 text-black hover:bg-amber-400"
                        )}
                    >
                        Book Now
                        <Plane className="h-4 w-4" />
                    </Link>

                    {/* Profile */}
                    <ProfileButton />

                    {/* Mobile menu */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className={cn(
                            "lg:hidden h-10 w-10 rounded-full border transition",
                            "border-white/10 bg-white/5 hover:bg-white/10",
                            "focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        )}
                        aria-label="Open menu"
                    >
                        <Menu className="mx-auto h-5 w-5 text-white/80" />
                    </button>
                </div>
            </div>

            {/* Search Overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm"
                    >
                        <motion.div
                            ref={searchPanelRef}
                            initial={{ opacity: 0, y: -16, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -16, scale: 0.98 }}
                            transition={{ duration: 0.18 }}
                            className={cn(
                                "mx-auto mt-20 w-[92%] max-w-2xl overflow-hidden rounded-2xl border",
                                "border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl"
                            )}
                        >
                            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                                <Search className="h-5 w-5 text-emerald-300" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search deals, destinations, offers..."
                                    className="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchOpen(false);
                                        setQuery("");
                                        setResults([]);
                                    }}
                                    className="rounded-lg p-2 hover:bg-white/5"
                                    aria-label="Close search"
                                >
                                    <X className="h-5 w-5 text-white/70" />
                                </button>
                            </div>

                            <div className="max-h-[22rem] overflow-y-auto">
                                {query.trim() ? (
                                    searching ? (
                                        <div className="px-4 py-4 text-sm text-white/60">
                                            Searching...
                                        </div>
                                    ) : results.length ? (
                                        <div className="divide-y divide-white/10">
                                            {results.map((item) => (
                                                <button
                                                    key={`${item.type}-${item.id}`}
                                                    onClick={() =>
                                                        onSelectResult(item)
                                                    }
                                                    className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition"
                                                >
                                                    <img
                                                        src={
                                                            item.image ||
                                                            "https://via.placeholder.com/56x84"
                                                        }
                                                        alt={item.title}
                                                        className="h-16 w-12 rounded-lg object-cover border border-white/10"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="truncate text-sm font-semibold text-white">
                                                                {item.title}
                                                            </div>
                                                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200">
                                                                {String(
                                                                    item.type ||
                                                                        ""
                                                                ).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="truncate text-xs text-white/55">
                                                            {formatPrice(
                                                                item.price,
                                                                item.discount_price
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-white/30" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-4 py-4 text-sm text-white/60">
                                            No results found.
                                        </div>
                                    )
                                ) : (
                                    <div className="px-4 py-4 text-sm text-white/50">
                                        Tip: اكتب اسم وجهة أو باكج أو عرض…
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                    >
                        <motion.aside
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "tween", duration: 0.2 }}
                            className={cn(
                                "ml-auto h-full w-[86%] max-w-sm border-l border-white/10",
                                "bg-black/85 backdrop-blur-xl shadow-2xl"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                                <div className="text-sm font-semibold text-white/90">
                                    Menu
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(false)}
                                    className="rounded-lg p-2 hover:bg-white/5"
                                    aria-label="Close menu"
                                >
                                    <X className="h-5 w-5 text-white/70" />
                                </button>
                            </div>

                            <div className="px-4 py-4 space-y-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 rounded-2xl px-4 py-3 transition",
                                                active
                                                    ? "bg-emerald-500/12 ring-1 ring-emerald-400/20"
                                                    : "hover:bg-white/5"
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    "h-5 w-5",
                                                    item.color
                                                )}
                                            />
                                            <span
                                                className={cn(
                                                    "text-sm font-medium",
                                                    active
                                                        ? "text-white"
                                                        : "text-white/80"
                                                )}
                                            >
                                                {item.label}
                                            </span>
                                        </Link>
                                    );
                                })}

                                {auth?.company && (
                                    <Link
                                        href={route("company.dashboard")}
                                        onClick={() => setMobileOpen(false)}
                                        className="mt-2 flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-white/5 transition"
                                    >
                                        <LayoutDashboard className="h-5 w-5 text-emerald-300" />
                                        <span className="text-sm font-medium text-white/80">
                                            Dashboard
                                        </span>
                                    </Link>
                                )}

                                <Link
                                    href="/booking"
                                    onClick={() => setMobileOpen(false)}
                                    className="mt-4 flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition"
                                >
                                    Book Now <Plane className="h-4 w-4" />
                                </Link>
                            </div>
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default NavV2;
