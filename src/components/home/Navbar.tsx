"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Home, Info, LogIn, Menu, UserPlus, BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

export default function Navbar() {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [lastScrollTime, setLastScrollTime] = useState(0);
    const pathname = usePathname();

    // Throttled scroll handler
    const handleScroll = useCallback(() => {
        const currentTime = Date.now();
        // Throttle to only process scroll every 100ms
        if (currentTime - lastScrollTime < 100) return;

        const currentScrollY = window.scrollY;
        setIsVisible(currentScrollY <= 50 || currentScrollY < lastScrollY);
        setLastScrollY(currentScrollY);
        setLastScrollTime(currentTime);
    }, [lastScrollY, lastScrollTime]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    const navLinks = [
        { name: "Beranda", href: "/", icon: <Home className="w-5 h-5" /> },
        { name: "Tentang", href: "/about", icon: <Info className="w-5 h-5" /> },
        { name: "FSLSM", href: "/fslsm", icon: <BookOpenCheck className="w-5 h-5" /> },
    ];

    return (
        <header className={`fixed top-0 left-0 w-full z-50 bg-white shadow-sm transition-transform duration-300 ${!isVisible ? "-translate-y-full" : ""}`}>
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo */}
                <div className="min-w-[160px] h-12 flex items-center">
                    <Link href="/dashboard/student" className="flex items-center gap-2">
                        <Image src="/icon-edu.webp" alt="CekGayaBelajar Logo" width={48} height={48} sizes="48px" className="h-8 md:h-10 lg:h-12 w-auto object-contain" loading="eager" priority />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-4">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${pathname === item.href ? "text-[#0F67A6]" : "text-gray-700 hover:text-[#0F67A6]"}`}
                            aria-label={`Navigasi ke ${item.name}`}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                        <Link href="/login" className={`text-sm font-bold transition-colors ${pathname === "/login" ? "text-[#0F67A6]" : "text-gray-700 hover:text-[#0F67A6]"}`} aria-label="Masuk ke akun">
                            Login
                        </Link>
                        <Button size="sm" asChild className="bg-primary text-white hover:bg-primary rounded-full px-4 py-2" aria-label="Daftar akun baru">
                            <Link href="/chose-role" className="flex items-center gap-1.5">
                                Get Started
                            </Link>
                        </Button>
                    </div>
                </nav>

                {/* Mobile Dropdown */}
                <div className="md:hidden flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-[#FF6A3B] hover:bg-gray-100 border border-gray-200 rounded-lg" aria-label="Buka menu navigasi">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-white border border-gray-200 text-gray-700 p-2 shadow-lg" align="end" alignOffset={-10} sideOffset={8}>
                            {navLinks.map((item) => (
                                <DropdownMenuItem key={item.name} asChild className="mb-1">
                                    <Link href={item.href} className={`flex items-center gap-3 px-2 py-1.5 rounded-md ${pathname === item.href ? "text-[#0F67A6] bg-gray-300" : "text-gray-700 hover:bg-gray-300 hover:text-[#0F67A6]"}`}>
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="my-2 bg-gray-200" />
                            <DropdownMenuItem asChild className="mb-1">
                                <Link href="/login" className={`flex items-center gap-3 px-2 py-1.5 ${pathname === "/login" ? "text-[#0F67A6] bg-gray-300" : "text-gray-700 hover:bg-gray-100 hover:text-[#0F67A6]"}`}>
                                    <LogIn className="w-5 h-5" />
                                    Login
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/chose-role" className="flex items-center gap-3 px-2 py-1.5 bg-primary text-white rounded-md hover:bg-primary">
                                    <UserPlus className="w-5 h-5" />
                                    Get Started
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
