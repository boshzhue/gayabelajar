"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, ClipboardList, HelpCircle, FileText, User as UserIcon } from "lucide-react";
import api from "@/lib/axios";

interface StudentSidebarProps {
    mobile?: boolean;
}

interface StudentData {
    nama_lengkap: string;
    nisn: string;
    kelas: string;
    nama_sekolah: string;
    jenis_kelamin: string;
}

export default function StudentSidebar({ mobile = false }: StudentSidebarProps) {
    const pathname = usePathname();

    // Fungsi untuk mengambil data sidebar
    const fetchSidebarData = async (): Promise<StudentData> => {
        const response = await api.get("/siswa/sidebar-data");
        return response.data;
    };

    // Menggunakan useQuery untuk fetching dan caching
    const {
        data: studentData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["sidebarData"],
        queryFn: fetchSidebarData,
        retry: 1,
    });

    // Fungsi untuk mendapatkan inisial nama
    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

    const mobileNavItems = [
        { href: "/student", icon: <Home className="h-5 w-5" />, label: "Home" },
        { href: "/student/tests", icon: <FileText className="h-5 w-5" />, label: "Tes" },
        { href: "/student/history", icon: <ClipboardList className="h-5 w-5" />, label: "Riwayat" },
        { href: "/student/profile", icon: <UserIcon className="h-5 w-5" />, label: "Profil" },
    ];

    const desktopNavItems = [
        { href: "/student", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
        { href: "/student/tests", icon: <FileText className="h-5 w-5" />, label: "Tes" },
        { href: "/student/history", icon: <ClipboardList className="h-5 w-5" />, label: "Riwayat" },
    ];

    const helpItems = [{ href: "/help", icon: <HelpCircle className="h-5 w-5" />, label: "Panduan" }];

    // Tampilkan skeleton saat loading
    if (isLoading) {
        return (
            <aside
                className={cn(mobile ? "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg rounded-t-lg" : "fixed top-0 left-0 h-screen w-80 bg-white text-gray-800 z-40 shadow-lg border-r border-gray-200 pt-20")}
            >
                <div className={mobile ? "flex justify-around items-center h-16" : "flex flex-col h-full w-full"}>
                    {mobile ? (
                        mobileNavItems.map((_, i) => <Skeleton key={i} className="h-6 w-6 rounded-full" />)
                    ) : (
                        <>
                            <div className="p-8 flex flex-col items-center text-center gap-3 border-b border-gray-200 bg-[#E6F0FA]">
                                <Skeleton className="h-8 w-32 rounded-lg" />
                                <Skeleton className="h-4 w-24 rounded-lg" />
                            </div>
                            <div className="p-6 border-b border-gray-200 flex flex-col items-center text-center">
                                <Skeleton className="h-20 w-20 rounded-full mb-4" />
                                <Skeleton className="h-6 w-40 mb-2 rounded-lg" />
                                <Skeleton className="h-4 w-32 mb-2 rounded-lg" />
                                <Skeleton className="h-8 w-full mt-3 rounded-lg" />
                            </div>
                            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                ))}
                            </nav>
                            <div className="p-4 border-t border-gray-200 space-y-2">
                                {[...Array(2)].map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </aside>
        );
    }

    // Tangani error dengan toast dan redirect
    if (error) {
        toast.error("Gagal memuat data siswa");
        return <div className="p-4 text-gray-800 text-lg">Data siswa tidak ditemukan</div>;
    }

    // Jika tidak ada data siswa
    if (!studentData) {
        return <div className="p-4 text-gray-800 text-lg">Data siswa tidak ditemukan</div>;
    }

    const avatarSrc = studentData.jenis_kelamin.toLowerCase() === "laki-laki" ? "/avatar-man.webp" : "/avatar-women.webp";

    return (
        <>
            {mobile ? (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg rounded-t-lg">
                    <div className="flex justify-around items-center h-16">
                        {mobileNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    href={item.href}
                                    key={item.href}
                                    className={cn("group flex flex-col items-center justify-center w-full h-full transition-all duration-300", isActive ? "text-[#0F67A6] font-semibold" : "text-gray-600 hover:text-[#1A7CC0]")}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <div className={cn("p-2 transition-all duration-300 transform group-hover:scale-110", isActive ? "text-[#0F67A6]" : "text-gray-600 group-hover:text-[#1A7CC0]")}>{item.icon}</div>
                                    <span className={cn("text-xs mt-1", isActive ? "text-[#0F67A6] font-medium" : "text-gray-600 group-hover:text-[#1A7CC0]")}>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <aside className="fixed top-0 left-0 h-screen w-80 bg-white text-gray-800 z-40 shadow-lg border-r border-gray-200 pt-20">
                    <div className="flex flex-col h-full w-full">
                        <div className="p-8 flex flex-col items-center text-center gap-3 border-b border-gray-200 bg-[#0F67A6]">
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">Portal Siswa</h1>
                                <p className="text-lg text-gray-200">{studentData.nama_sekolah || "Sekolah tidak tersedia"}</p>
                            </div>
                        </div>

                        <div className="p-6 border-b border-gray-200 flex flex-col items-center text-center">
                            <Avatar className="h-20 w-20 mb-4 bg-gray-300">
                                <AvatarImage src={avatarSrc} alt="Student Avatar" />
                                <AvatarFallback className="bg-gray-200 text-gray-800">{studentData.nama_lengkap ? getInitials(studentData.nama_lengkap) : "S"}</AvatarFallback>
                            </Avatar>
                            <h3 className="text-xl font-bold text-[#0F67A6] truncate">{studentData.nama_lengkap || "Nama Siswa"}</h3>
                            <div></div>
                            <div className="flex items-center gap-2 text-lg bg-[#E6F0FA] p-2 w-full mt-3 justify-center rounded-lg">
                                <UserIcon className="h-5 w-5 text-[#0F67A6] flex-shrink-0" />
                                <span className="text-gray-800 truncate">{studentData.kelas || "Kelas tidak tersedia"}</span>
                            </div>
                        </div>

                        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                            <div className="space-y-1">
                                {desktopNavItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            href={item.href}
                                            key={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-6 py-3 text-lg font-medium transition-all rounded-lg",
                                                isActive ? "bg-[#0F67A6] text-white font-bold" : "text-gray-600 hover:bg-[#E6F0FA] hover:text-[#1A7CC0]"
                                            )}
                                            aria-current={isActive ? "page" : undefined}
                                            aria-label="Navigasi ke {item.label}"
                                        >
                                            <span className={cn("transform transition-all duration-300", isActive ? "text-white" : "group-hover:scale-110 group-hover:text-[#1A7CC0]")}>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>

                        <div className="p-4 border-t border-gray-200">
                            <div className="space-y-1">
                                {helpItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            href={item.href}
                                            key={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 text-lg font-medium transition-all duration-300 rounded-lg",
                                                isActive ? "bg-[#0F67A6] text-white font-bold" : "text-gray-600 hover:bg-[#E6F0FA] hover:text-[#1A7CC0"
                                            )}
                                            aria-current={isActive ? "page" : undefined}
                                            aria-label="Navigasi ke {item.label}"
                                        >
                                            <span className={cn("transform transition-all duration-300", isActive ? "text-[#0F67A6]" : "group-hover:scale-110 group-hover:text-[#1A7CC0]")}>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                            <div className="p-4 border-t border-gray-200">
                                <div className="text-center text-sm text-gray-600">
                                    <p>EduSmart v1.0.0</p>
                                    <p className="mt-1">© 2025 All rights reserved</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            )}
        </>
    );
}
