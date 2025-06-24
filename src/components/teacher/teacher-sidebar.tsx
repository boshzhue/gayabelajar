"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Book, GraduationCap, HelpCircle, Home, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface TeacherSidebarProps {
    mobile?: boolean;
}

interface TeacherData {
    full_name: string;
    email: string;
    nip: string;
    school: string;
    education_level: string;
    gender: string;
    role: string;
}

export default function TeacherSidebar({ mobile = false }: TeacherSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const {
        data: teacher,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["teacherSidebarData"],
        queryFn: async () => {
            const response = await api.get("/guru/sidebar-data");
            const data = response.data;
            return {
                full_name: data.nama_lengkap,
                email: data.email,
                nip: data.nip,
                school: data.nama_sekolah,
                education_level: data.tingkat_pendidikan,
                gender: data.jenis_kelamin,
                role: "teacher",
            } as TeacherData;
        },
    });

    const handleOpenPdf = () => {
        const pdfUrl = "/pdf/bantuan.pdf";
        fetch(pdfUrl)
            .then((res) => {
                if (res.ok) window.open(pdfUrl, "_blank");
                else throw new Error("File bantuan tidak ditemukan.");
            })
            .catch(() => alert("Terjadi kesalahan saat membuka file bantuan."));
    };

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

    const mobileNavItems = [
        { href: "/teacher", icon: <Home className="h-5 w-5" />, label: "Home" },
        { href: "/teacher/student-list", icon: <Users className="h-5 w-5" />, label: "Siswa" },
        { href: "/teacher/export", icon: <BarChart2 className="h-5 w-5" />, label: "Data" },
        { href: "/teacher/fslsm", icon: <Book className="h-5 w-5" />, label: "Informasi" },
    ];

    const desktopNavItems = [
        { href: "/teacher", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
        { href: "/teacher/student-list", icon: <Users className="h-5 w-5" />, label: "Manajemen Siswa" },
        { href: "/teacher/export", icon: <BarChart2 className="h-5 w-5" />, label: "Export" },
        { href: "/teacher/fslsm", icon: <Book className="h-5 w-5" />, label: "Informasi" },
    ];

    const helpItems = [{ onClick: handleOpenPdf, icon: <HelpCircle className="h-5 w-5" />, label: "Panduan", href: "/help" }];

    if (isLoading || !teacher) {
        if (mobile) {
            return (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg rounded-t-lg">
                    <div className="flex justify-around items-center h-16">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-6 w-6 rounded-full" />
                        ))}
                    </div>
                </div>
            );
        }
        return (
            <aside className="fixed top-0 left-0 h-screen w-80 bg-white text-gray-800 z-40 shadow-lg border-r border-gray-200 pt-20">
                <div className="flex flex-col h-full w-full">
                    <div className="p-8 flex flex-col items-center text-center gap-3 border-b border-gray-200 bg-blue-50">
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
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-lg" />
                        ))}
                    </nav>
                    <div className="p-4 border-t border-gray-200 space-y-2">
                        {[...Array(2)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            </aside>
        );
    }

    if (error || teacher.role !== "teacher") {
        router.push("/");
        return null;
    }

    const teacherData = {
        name: teacher.full_name || "",
        email: teacher.email || "",
        id: teacher.nip || "-",
        school: teacher.school || "Sekolah Tidak Diketahui",
        educationLevel: teacher.education_level || "Tidak Diketahui",
        avatar: teacher.gender.toLowerCase() === "laki-laki" ? "/avatar-man.webp" : "/avatar-women.webp",
    };

    if (mobile) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg rounded-t-lg">
                <div className="flex justify-around items-center h-16">
                    {mobileNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                href={item.href}
                                key={item.href}
                                className={cn("group flex flex-col items-center justify-center w-full h-full transition-all duration-300", isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-800")}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className={cn("p-2 transition-all duration-300 transform group-hover:scale-110", isActive ? "text-blue-600" : "text-gray-600 group-hover:text-blue-800")}>{item.icon}</div>
                                <span className={cn("text-xs mt-1", isActive ? "text-blue-600 font-medium" : "text-gray-600 group-hover:text-blue-800")}>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <aside className="fixed top-0 left-0 h-screen w-80 bg-white text-gray-800 z-40 shadow-lg border-r border-gray-200 pt-20">
            <div className="flex flex-col h-full w-full">
                <div className="p-8 flex flex-col items-center text-center gap-3 border-b border-gray-200 bg-secondary">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Portal Guru</h1>
                        <p className="text-lg text-gray-300">{teacherData.school}</p>
                    </div>
                </div>

                <div className="p-6 border-b border-gray-200 flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 mb-4 bg-gray-300">
                        <AvatarImage src={teacherData.avatar} alt="Teacher Avatar" />
                        <AvatarFallback className="bg-gray-200 text-secondary">{getInitials(teacherData.name)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-secondary truncate">{teacherData.name}</h3>
                    <div className="flex items-center gap-2 text-lg bg-blue-50 p-2 w-full mt-3 justify-center rounded-lg">
                        <GraduationCap className="h-5 w-5 text-secondary flex-shrink-0" />
                        <span className="text-gray-800 truncate">{teacherData.educationLevel}</span>
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
                                        "flex items-center gap-3 px-4 py-3 text-lg font-medium transition-all duration-300 rounded-lg",
                                        isActive ? "bg-secondary text-blue-50 font-bold" : "text-gray-600 hover:bg-blue-50 hover:text-secondary"
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <span className={cn("transform transition-all duration-300", isActive ? "text-blue-50" : "group-hover:scale-110 group-hover:text-blue-800")}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="space-y-1">
                        {helpItems.map((item, index) =>
                            item.onClick ? (
                                <button
                                    key={index}
                                    onClick={item.onClick}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 text-lg font-medium transition-all duration-300 w-full text-left rounded-lg",
                                        pathname === item.href ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-600 hover:bg-blue-50 hover:text-blue-800"
                                    )}
                                    aria-label="Buka dokumen bantuan di tab baru"
                                >
                                    <span className={cn("transform transition-all duration-300", pathname === item.href ? "text-blue-600" : "group-hover:scale-110 group-hover:text-blue-800")}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ) : (
                                <Link
                                    href={item.href || "#"}
                                    key={item.href || "help"}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 text-lg font-medium transition-all duration-300 rounded-lg",
                                        pathname === (item.href || "") ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-600 hover:bg-blue-50 hover:text-blue-800"
                                    )}
                                    aria-current={pathname === (item.href || "") ? "page" : undefined}
                                >
                                    <span className={cn("transform transition-all duration-300", pathname === item.href ? "text-blue-600" : "group-hover:scale-110 group-hover:text-blue-800")}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            )
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <div className="text-center text-sm text-gray-600">
                        <p>EduSmart v1.0.0</p>
                        <p className="mt-1">© 2025 All rights reserved</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
