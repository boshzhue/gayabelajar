"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOutIcon, HelpCircleIcon, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";

interface TeacherData {
    full_name: string;
    email: string;
    nip: string;
    school: string;
    education_level: string;
    gender: string;
    role: string;
}

export default function TeacherNavbar() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    // Fetch teacher data for navbar
    const {
        data: teacher,
        isLoading,
        error,
    } = useQuery<TeacherData>({
        queryKey: ["teacherNavbarData"],
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
        retry: 1,
    });

    const handleLogout = async () => {
        await api.post("/auth/logout", {}, { withCredentials: true });
        queryClient.clear();
        window.location.href = "/login";
        setIsOpen(false);
    };

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

    if (isLoading || !teacher) {
        return (
            <nav className="w-full h-16 bg-white flex items-center sticky top-0 z-20 shadow-sm">
                <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <Skeleton className="h-10 w-32 rounded-md bg-[#E6F0FA]" />
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Skeleton className="h-10 w-10 rounded-full bg-[#E6F0FA]" />
                        <Skeleton className="h-4 w-20 rounded bg-[#E6F0FA] hidden sm:block" />
                    </div>
                </div>
            </nav>
        );
    }

    if (error || teacher.role !== "teacher") {
        router.push("/");
        return null;
    }

    const avatarSrc = teacher.gender.toLowerCase() === "laki-laki" ? "/avatar-man.webp" : "/avatar-women.webp";

    return (
        <nav className="w-full h-20 bg-white flex items-center sticky top-0 z-20 shadow-sm">
            <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <div className="min-w-[160px] h-12 flex items-center pl-2 sm:pl-6 lg:pl-10">
                    <Link href="/teacher" className="group relative flex items-center gap-2 z-10">
                        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                            <Image src="/icon-edu.webp" alt="EduSmart Logo" width={0} height={0} sizes="100vw" className="h-8 md:h-10 lg:h-12 w-auto object-contain" priority />
                        </motion.div>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 h-10 px-2 py-1 transition-colors hover:bg-gray-100">
                                <Avatar className="h-12 w-12 bg-[#0F67A6]">
                                    <AvatarImage src={avatarSrc} alt="Teacher" />
                                    <AvatarFallback className="text-white">{getInitials(teacher.full_name)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-black hidden sm:block">{teacher.full_name.split(" ")[0]}</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="min-w-[240px] max-w-xs bg-white border border-gray-200 shadow-lg rounded-lg p-2">
                            <div className="flex gap-3 px-3 py-2">
                                <Avatar className="h-12 w-12 bg-[#0F67A6]">
                                    <AvatarImage src={avatarSrc} alt="Teacher" />
                                    <AvatarFallback className="text-white">{getInitials(teacher.full_name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col overflow-hidden">
                                    <p className="text-sm font-medium text-black break-words">{teacher.full_name}</p>
                                    <p className="text-xs text-gray-500 break-words whitespace-normal">{teacher.email}</p>
                                    <p className="text-xs text-gray-500 mt-1 break-words">
                                        {teacher.nip} • {teacher.school}
                                    </p>
                                </div>
                            </div>

                            <DropdownMenuGroup className="py-1">
                                <DropdownMenuItem
                                    className={cn("flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors", "hover:bg-[#E6F0FA] hover:text-[#0F67A6] focus:bg-[#E6F0FA] focus:text-[#0F67A6]")}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Link href="/teacher/profile" className="flex items-center w-full gap-2">
                                        <UserIcon className="h-4 w-4 text-black" />
                                        <span>Profil Saya</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-gray-200" />

                                <DropdownMenuItem
                                    className={cn("flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors", "hover:bg-[#E6F0FA] hover:text-[#0F67A6] focus:bg-[#E6F0FA] focus:text-[#0F67A6]")}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Link href="/help" className="flex items-center w-full gap-2">
                                        <HelpCircleIcon className="h-4 w-4 text-black" />
                                        <span>Panduan</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-gray-200" />

                                <DropdownMenuItem
                                    className={cn("flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors", "hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700")}
                                    onClick={handleLogout}
                                >
                                    <LogOutIcon className="h-4 w-4 text-red-600" />
                                    <span>Keluar</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}
