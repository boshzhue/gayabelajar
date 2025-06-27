"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, ClipboardCheck, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import axios from "axios";

type LearningStyleDistribution = {
    category: string;
    count: number;
    percentage: number;
};

type BackendDashboardResponse = {
    total_siswa: number;
    jumlah_kelas: number;
    siswa_sudah_tes: number;
    pemrosesan: Record<string, number>;
    persepsi: Record<string, number>;
    input: Record<string, number>;
    pemahaman: Record<string, number>;
};

type TransformedDashboardData = {
    totalStudents: number;
    totalClasses: number;
    testedStudents: number;
    learningStyles: {
        processing: LearningStyleDistribution[];
        perception: LearningStyleDistribution[];
        input: LearningStyleDistribution[];
        understanding: LearningStyleDistribution[];
    };
};

const dimensionMaps = {
    processing: { title: "Pemrosesan Informasi", color: "#2563EB" },
    perception: { title: "Persepsi Informasi", color: "#16A34A" },
    input: { title: "Input Informasi", color: "#D97706" },
    understanding: { title: "Pemahaman Informasi", color: "#7C3AED" },
};

const transformData = (data: BackendDashboardResponse): TransformedDashboardData => {
    const transformCategory = (categoryData: Record<string, number>): LearningStyleDistribution[] => {
        const total = Object.values(categoryData).reduce((sum, count) => sum + count, 0);
        return Object.entries(categoryData).map(([category, count]) => ({
            category,
            count,
            percentage: total === 0 ? 0 : Math.min((count / total) * 100, 100),
        }));
    };

    return {
        totalStudents: data.total_siswa,
        totalClasses: data.jumlah_kelas,
        testedStudents: data.siswa_sudah_tes,
        learningStyles: {
            processing: transformCategory(data.pemrosesan),
            perception: transformCategory(data.persepsi),
            input: transformCategory(data.input),
            understanding: transformCategory(data.pemahaman),
        },
    };
};

export default function DashboardGuru() {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<TransformedDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get<BackendDashboardResponse>("/guru/dashboard");
                const transformedData = transformData(response.data);
                setDashboardData(transformedData);
            } catch (error) {
                let errorMessage = "Terjadi kesalahan saat memuat data";
                if (axios.isAxiosError(error)) {
                    errorMessage = error.response?.data?.detail || error.message;
                    if (error.response?.status === 401) {
                        router.push("/login");
                        return;
                    }
                }
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [router]);

    const getBadgeColor = (percentage: number) => {
        if (percentage >= 50) return "bg-blue-50 text-blue-700 border border-blue-200";
        if (percentage >= 25) return "bg-green-50 text-green-700 border border-green-200";
        return "bg-red-50 text-red-700 border border-red-200";
    };

    if (isLoading) {
        return (
            <div className="min-h-screen text-gray-800">
                <div className="max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto px-2 sm:px-4 py-6 sm:py-8 pt-20 sm:pt-28">
                    <div className="flex items-center justify-center py-8 sm:py-12">
                        <div className="text-center space-y-2 sm:space-y-3">
                            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto animate-spin text-secondary" />
                            <p className="text-sm sm:text-base text-gray-600 font-medium">Memuat dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="min-h-screen text-gray-800">
                <div className="max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto px-2 sm:px-4 py-6 sm:py-8 pt-20 sm:pt-28">
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-lg shadow-sm w-full max-w-sm sm:max-w-md">
                        <p className="text-sm sm:text-base">{error || "Gagal memuat data dashboard"}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.reload()}
                            className="mt-2 w-full text-red-700 hover:bg-red-100 rounded-full text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] active:scale-95"
                            aria-label="Coba muat ulang dashboard"
                        >
                            Coba Lagi
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="min-h-screen text-gray-800">
                <div className="max-w-7xl mx-auto">
                    <Card className="bg-secondary shadow-md rounded-xl border-none mb-6 sm:mb-8">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                                <div className="space-y-2 sm:space-y-3">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center">
                                        <BarChart2 className="mr-2 h-6 w-6 sm:h-8 sm:w-8" />
                                        Dashboard Guru
                                    </h1>
                                    <p className="text-gray-300 text-sm sm:text-base max-w-2xl min-w-0 break-words">Analisis gaya belajar siswa dan aktivitas kelas untuk mendukung pengajaran yang lebih efektif.</p>
                                    <p className="text-gray-200 text-xs sm:text-sm">
                                        {new Date().toLocaleDateString("id-ID", {
                                            weekday: "long",
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {[
                            {
                                title: "Jumlah Siswa",
                                value: dashboardData.totalStudents,
                                icon: Users,
                                description: "Total siswa terdaftar",
                                color: "text-secondary",
                                route: "/teacher/student-list",
                            },
                            {
                                title: "Jumlah Kelas",
                                value: dashboardData.totalClasses,
                                icon: BookOpen,
                                description: "Kelas yang aktif",
                                color: "text-secondary",
                                route: "/teacher/student-list",
                            },
                            {
                                title: "Siswa Tes",
                                value: dashboardData.testedStudents,
                                icon: ClipboardCheck,
                                description: "Siswa yang telah tes",
                                color: "text-secondary",
                                route: "/teacher/student-list",
                            },
                        ].map((item, index) => (
                            <Card
                                key={index}
                                className="bg-white border border-gray-200 rounded-xl shadow-md hover:bg-blue-50/50 transition-all duration-300 active:scale-95"
                                role="button"
                                tabIndex={0}
                                onClick={() => router.push(item.route)}
                                onKeyDown={(e) => e.key === "Enter" && router.push(item.route)}
                                aria-label={`Lihat detail ${item.title}: ${item.value} ${item.description}`}
                            >
                                <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 border-b border-gray-200">
                                    <CardTitle className="text-lg sm:text-xl font-bold text-secondary min-w-0 break-words">{item.title}</CardTitle>
                                    <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color}`} />
                                </CardHeader>
                                <CardContent className="pt-2 sm:pt-3">
                                    <p className={`text-xl sm:text-2xl font-bold ${item.color}`}>{item.value}</p>
                                    <p className="text-sm sm:text-base text-gray-600 mt-1 min-w-0 break-words">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {[
                            {
                                title: "Pemrosesan Informasi",
                                data: dashboardData.learningStyles.processing,
                                dimension: "processing",
                            },
                            {
                                title: "Persepsi Informasi",
                                data: dashboardData.learningStyles.perception,
                                dimension: "perception",
                            },
                            {
                                title: "Input Informasi",
                                data: dashboardData.learningStyles.input,
                                dimension: "input",
                            },
                            {
                                title: "Pemahaman Informasi",
                                data: dashboardData.learningStyles.understanding,
                                dimension: "understanding",
                            },
                        ].map((section, index) => (
                            <Card key={index} className="bg-white border border-gray-200 rounded-xl shadow-md hover:bg-blue-50/50 transition-all duration-300">
                                <CardHeader className="pb-2 sm:pb-3 border-b border-gray-200">
                                    <div className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-secondary min-w-0 break-words">{section.title}</CardTitle>
                                        <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-2 sm:pt-3 space-y-2 sm:space-y-3">
                                    {section.data.map((item, i) => (
                                        <div key={i} className="space-y-1 sm:space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="text-sm sm:text-base font-medium text-gray-800 min-w-0 break-words">{item.category}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-primary text-white">
                                                        <p className="text-xs sm:text-sm">Distribusi gaya belajar {item.category}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge
                                                            className={cn(getBadgeColor(item.percentage), "px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full hover:bg-opacity-80 hover:scale-105 transition-all duration-300 cursor-pointer")}
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={(e) => e.key === "Enter" && {}}
                                                            aria-label={`Distribusi ${item.category}: ${item.count} siswa, ${Math.min(item.percentage, 100).toFixed(0)}%`}
                                                        >
                                                            {item.count} ({Math.min(item.percentage, 100).toFixed(0)}%)
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-primary text-white">
                                                        <p className="text-xs sm:text-sm">
                                                            {item.count} siswa ({Math.min(item.percentage, 100).toFixed(0)}%)
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Progress
                                                value={Math.min(item.percentage, 100)}
                                                className={cn(
                                                    `h-1.5 sm:h-2 bg-gray-100 [&>div]:${dimensionMaps[section.dimension as keyof typeof dimensionMaps].color}`,
                                                    "border border-gray-200 rounded-full transition-all duration-300 hover:brightness-110 hover:scale-[1.02]"
                                                )}
                                                aria-valuenow={Math.min(item.percentage, 100)}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-label={`Distribusi ${item.category}: ${Math.min(item.percentage, 100)}%`}
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
