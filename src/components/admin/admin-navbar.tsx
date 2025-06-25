"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LogOutIcon, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface AdminData {
    nama_lengkap: string;
    jenis_kelamin: string;
}

export default function AdminNavbar({ children }: { children?: React.ReactNode }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [admin, setAdmin] = useState<AdminData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get("/admin/navbar", { withCredentials: true });
                setAdmin(response.data);
                setError(null);
            } catch (err: unknown) {
                console.error("Error fetching admin data:", err);
                setError("Gagal memuat data admin");
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        try {
            await api.post("/auth/logout", {}, { withCredentials: true });
            setAdmin(null);
            toast.success("Logout berhasil!", {
                duration: 2000,
                position: "top-center",
            });
            if ("caches" in window) {
                caches.keys().then((cacheNames) => {
                    cacheNames.forEach((cacheName) => {
                        caches.delete(cacheName);
                    });
                });
            }
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } catch (error) {
            console.error("Error signing out:", error);
            toast.error("Gagal logout. Mengarahkan ke beranda.", {
                duration: 2000,
                position: "top-center",
            });
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

    const getAvatarImage = (gender: string | null | undefined) => {
        if (!gender) return "/default-avatar.webp";
        return gender.toLowerCase() === "laki-laki" ? "/avatar-man.webp" : "/avatar-women.webp";
    };

    if (isLoading) {
        return (
            <nav className="w-full h-16 bg-white flex items-center sticky top-0 z-20 shadow-sm">
                <div className="w-full mx-4 sm:mx-6 lg:mx-8 px-4 flex items-center justify-between">
                    <Skeleton className="h-10 w-32 rounded-md bg-naturalSoft-accent" />
                    <div className="flex items-center gap-3">
                        {children}
                        <Skeleton className="h-10 w-10 rounded-full bg-naturalSoft-accent" />
                        <Skeleton className="h-4 w-20 rounded bg-naturalSoft-accent hidden sm:block" />
                    </div>
                </div>
            </nav>
        );
    }

    if (error || !admin) {
        router.push("/login");
        return null;
    }

    return (
        <nav className="w-full h-20 bg-white flex items-center sticky top-0 z-20 shadow-sm border-b border-gray-200">
            <div className="w-full mx-8 sm:mx-6 lg:mx-8 px-4 flex items-center justify-between">
                {/* Logo and hamburger button (left side) */}
                <div className="flex items-center gap-4">
                    {children && <div className="flex items-center">{children}</div>}
                    <div className="min-w-[180px] h-16 flex items-center">
                        <Link href="/dashboard/admin" className="group relative flex items-center gap-2 z-10">
                            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                                <div className="relative h-12 w-12">
                                    <Image src="/icon-edu.webp" alt="EduScan Logo" fill className="object-contain" priority />
                                </div>
                            </motion.div>
                        </Link>
                    </div>
                </div>

                {/* Profile Dropdown (right side) */}
                <div className="flex items-center gap-3">
                    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 h-10 px-2 py-1 transition-colors">
                                <Avatar className="h-12 w-12 bg-modernVibrant-primary">
                                    <AvatarImage src={getAvatarImage(admin.jenis_kelamin)} alt="Admin Avatar" className="object-cover" />
                                    <AvatarFallback className="text-white">{getInitials(admin.nama_lengkap)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-black hidden sm:block">{admin.nama_lengkap.split(" ")[0]}</span>
                                <ChevronDown className="h-4 w-4 text-gray-600 hidden sm:block" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="min-w-[240px] max-w-xs bg-white border border-naturalSoft-accent shadow-lg rounded-lg p-2">
                            <div className="flex gap-3 px-3 py-2">
                                <Avatar className="h-12 w-12 bg-modernVibrant-primary">
                                    <AvatarImage src={getAvatarImage(admin.jenis_kelamin)} alt="Admin Avatar" className="object-cover" />
                                    <AvatarFallback className="text-white">{getInitials(admin.nama_lengkap)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col overflow-hidden">
                                    <p className="text-sm font-medium text-black break-words">{admin.nama_lengkap}</p>
                                </div>
                            </div>

                            <DropdownMenuGroup className="py-1">
                                <DropdownMenuItem
                                    disabled={isLoggingOut}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer",
                                        "hover:bg-naturalSoft-accent hover:text-primary-800 focus:bg-naturalSoft-accent focus:text-primary-800 transition-colors"
                                    )}
                                    onClick={() => {
                                        handleSignOut();
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    <LogOutIcon className="h-4 w-4 text-red-600" />
                                    <span>{isLoggingOut ? "Logging out..." : "Sign Out"}</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}
