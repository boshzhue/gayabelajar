"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3Icon, BookOpenIcon, CalendarIcon, LightbulbIcon, BookmarkIcon, ClipboardListIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import api from "@/lib/axios";
import axios from "axios";

interface StudentInfo {
    name: string;
}

interface TestResult {
    type: string;
    value: number;
    level: string;
}

interface TestData {
    lastTestDate: string;
    totalTests: number;
    testCompleted: boolean;
    results: {
        processing: TestResult;
        perception: TestResult;
        input: TestResult;
        understanding: TestResult;
    };
    recommendations: string[];
}

interface LearningTip {
    title: string;
    icon: string;
    description: string;
    detailedDescription: string;
    link: string;
}

interface DashboardResponse {
    total_tes: number;
    terakhir_tes: string | null;
    gaya_belajar: {
        Pemrosesan: string;
        Persepsi: string;
        Input: string;
        Pemahaman: string;
    };
    rekomendasi: Array<{
        dimensi: string;
        gaya_belajar: string;
        penjelasan: string;
        rekomendasi: string;
    }>;
    skor: {
        Pemrosesan: number;
        Persepsi: number;
        Input: number;
        Pemahaman: number;
    };
}

const dimensionMaps = {
    processing: { title: "Pemrosesan", color: "#E6F0FA" },
    perception: { title: "Persepsi", color: "#E6F0FA" },
    input: { title: "Input", color: "#E6F0FA" },
    understanding: { title: "Pemahaman", color: "#E6F0FA" },
};

export default function StudentDashboard() {
    const [data, setData] = useState<{
        student_info: StudentInfo;
        test_data: TestData | null;
        learning_tips: LearningTip[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTip, setSelectedTip] = useState<LearningTip | null>(null);

    const transformValueToPercentage = (value: number, maxScore: number = 100): number => {
        return Math.min(Math.abs(value), maxScore);
    };

    const getLevelFromScore = (score: number): string => {
        if (score >= 80) return "Kuat";
        if (score >= 50) return "Sedang";
        return "Lemah";
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const response = await api.get<DashboardResponse>("/soal/dashboard-siswa");
                const apiData = response.data;

                const transformedData = {
                    student_info: {
                        name: localStorage.getItem("full_name") || "Siswa",
                    },
                    test_data: apiData.terakhir_tes
                        ? {
                              lastTestDate: new Date(apiData.terakhir_tes).toLocaleDateString("id-ID", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                              }),
                              totalTests: apiData.total_tes,
                              testCompleted: apiData.total_tes > 0,
                              results: {
                                  processing: {
                                      type: apiData.gaya_belajar.Pemrosesan,
                                      value: apiData.skor.Pemrosesan,
                                      level: getLevelFromScore(apiData.skor.Pemrosesan),
                                  },
                                  perception: {
                                      type: apiData.gaya_belajar.Persepsi,
                                      value: apiData.skor.Persepsi,
                                      level: getLevelFromScore(apiData.skor.Persepsi),
                                  },
                                  input: {
                                      type: apiData.gaya_belajar.Input,
                                      value: apiData.skor.Input,
                                      level: getLevelFromScore(apiData.skor.Input),
                                  },
                                  understanding: {
                                      type: apiData.gaya_belajar.Pemahaman,
                                      value: apiData.skor.Pemahaman,
                                      level: getLevelFromScore(apiData.skor.Pemahaman),
                                  },
                              },
                              recommendations: apiData.rekomendasi.map((r) => r.rekomendasi),
                          }
                        : null,
                    learning_tips: [
                        {
                            title: "Teknik Pomodoro",
                            icon: "ClipboardListIcon",
                            description: "Tingkatkan fokus dengan interval waktu belajar terstruktur",
                            detailedDescription:
                                "Teknik Pomodoro adalah metode manajemen waktu yang membantu meningkatkan fokus dan produktivitas. Caranya, bagi waktu belajarmu menjadi interval 25 menit (disebut 'Pomodoro') diikuti dengan istirahat singkat 5 menit. Setelah empat Pomodoro, ambil istirahat panjang selama 15-30 menit...",
                            link: "/tips/pomodoro",
                        },
                        {
                            title: "Mind Mapping",
                            icon: "BookmarkIcon",
                            description: "Organisasi informasi secara visual untuk belajar yang lebih efektif",
                            detailedDescription:
                                "Mind Mapping adalah teknik visual untuk mengorganisasi informasi menggunakan diagram bercabang. Mulailhorn dengan ide utama di tengah, lalu tambahkan cabang untuk subtopik terkait. Gunakan warna, gambar, dan kata kunci untuk membuat peta yang menarik dan mudah diingat...",
                            link: "/tips/mind-mapping",
                        },
                        {
                            title: "Feynman Technique",
                            icon: "LightbulbIcon",
                            description: "Menguasai konsep kompleks dengan mengajarkan orang lain",
                            detailedDescription:
                                "Teknik Feynman adalah metode belajar dengan mengajarkan konsep kompleks dalam bahasa sederhana, seolah-olah menjelaskan kepada anak kecil. Langkahnya: pilih topik, tulis penjelasan sederhana, identifikasi bagian yang sulit dipahami, lalu sederhanakan lagi menggunakan analogi atau contoh...",
                            link: "/tips/feynman",
                        },
                    ],
                };
                setData(transformedData);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    const status = err.response?.status;
                    const errorMessage = status === 404 ? "Belum ada tes yang dilakukan." : "Gagal memuat data dashboard.";
                    setErrorMessage(errorMessage);

                    if (status === 404) {
                        const defaultLearningTips = [
                            {
                                title: "Teknik Pomodoro",
                                icon: "ClipboardListIcon",
                                description: "Tingkatkan fokus dengan interval waktu belajar terstruktur",
                                detailedDescription:
                                    "Teknik Pomodoro adalah metode manajemen waktu yang membantu meningkatkan fokus dan produktivitas. Caranya, bagi waktu belajarmu menjadi interval 25 menit (disebut 'Pomodoro') diikuti dengan istirahat singkat 5 menit. Setelah empat Pomodoro, ambil istirahat panjang selama 15-30 menit...",
                                link: "/tips/pomodoro",
                            },
                            {
                                title: "Mind Mapping",
                                icon: "BookmarkIcon",
                                description: "Organisasi informasi secara visual untuk belajar yang lebih efektif",
                                detailedDescription:
                                    "Mind Mapping adalah teknik visual untuk mengorganisasi informasi menggunakan diagram bercabang. Mulailah dengan ide utama di tengah, lalu tambahkan cabang untuk subtopik terkait. Gunakan warna, gambar, dan kata kunci untuk membuat peta yang menarik dan mudah diingat...",
                                link: "/tips/mind-mapping",
                            },
                            {
                                title: "Feynman Technique",
                                icon: "LightbulbIcon",
                                description: "Menguasai konsep kompleks dengan mengajarkan orang lain",
                                detailedDescription:
                                    "Teknik Feynman adalah metode belajar dengan mengajarkan konsep kompleks dalam bahasa sederhana, seolah-olah menjelaskan kepada anak kecil. Langkahnya: pilih topik, tulis penjelasan sederhana, identifikasi bagian yang sulit dipahami, lalu sederhanakan lagi menggunakan analogi atau contoh...",
                                link: "/tips/feynman",
                            },
                        ];

                        setData({
                            student_info: {
                                name: localStorage.getItem("full_name") || "Siswa",
                            },
                            test_data: null,
                            learning_tips: defaultLearningTips,
                        });
                    }
                } else {
                    setErrorMessage("Terjadi kesalahan tak terduga.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const getBadgeColor = (level: string) => {
        switch (level) {
            case "Kuat":
                return "bg-green-50 text-green-700 border border-green-200";
            case "Sedang":
                return "bg-yellow-50 text-yellow-700 border border-yellow-200";
            case "Lemah":
                return "bg-red-50 text-red-700 border border-red-200";
            default:
                return "bg-gray-50 text-gray-700 border border-gray-200";
        }
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case "ClipboardListIcon":
                return <ClipboardListIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />;
            case "BookmarkIcon":
                return <BookmarkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />;
            case "LightbulbIcon":
                return <LightbulbIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />;
            default:
                return <LightbulbIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />;
        }
    };

    const handleOpenDialog = (tip: LearningTip) => {
        setSelectedTip(tip);
        setIsDialogOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
                <div className="text-center space-y-3 sm:space-y-4">
                    <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 mx-auto animate-spin text-primary" />
                    <p className="text-gray-600 text-sm sm:text-lg font-medium">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    if (errorMessage && !data) {
        return (
            <div className="flex items-center justify-center min-h-screen p-2 sm:p-4 bg-white">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-lg shadow-sm max-w-md w-full">
                    <p className="text-sm sm:text-lg">{errorMessage}</p>
                    <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="mt-2 text-red-700 hover:bg-red-100 rounded-full text-xs sm:text-sm">
                        Coba Lagi
                    </Button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-screen p-2 sm:p-4 bg-white">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-lg shadow-sm max-w-md w-full">
                    <p className="text-sm sm:text-lg">Tidak ada data untuk ditampilkan.</p>
                </div>
            </div>
        );
    }

    const { test_data, learning_tips } = data;

    return (
        <TooltipProvider>
            <div className="max-w-7xl mx-auto sm:p-4 space-y-6 sm:space-y-8">
                {/* Header Section */}
                <Card className="bg-primary shadow-lg rounded-lg border-none">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                            <div className="space-y-2 sm:space-y-3">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center">
                                    <CalendarIcon className="mr-2 h-6 w-6 sm:h-8 sm:w-8" />
                                    Dashboard Siswa
                                </h1>
                                <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl min-w-0">Halo👋! Lihat perkembangan gaya belajarmu untuk belajar lebih efektif.</p>
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

                {test_data ? (
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                        {/* Status Tes Terakhir */}
                        <Card className="bg-white shadow-lg rounded-lg border border-gray-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 border-b border-gray-200">
                                <CardTitle className="text-base sm:text-lg font-semibold text-primary">Status Tes Terakhir</CardTitle>
                                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </CardHeader>
                            <CardContent className="pt-3 sm:pt-4">
                                <p className="text-lg sm:text-2xl font-bold text-primary">{test_data.lastTestDate}</p>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">Terakhir mengikuti tes</p>
                                <div className="mt-3 sm:mt-4 flex items-center">
                                    <Badge
                                        className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm ${
                                            test_data.testCompleted ? "bg-white text-primary border border-primary/50" : "bg-gray-50 text-gray-600 border border-gray-200"
                                        }`}
                                    >
                                        {test_data.testCompleted ? "Selesai" : "Belum Selesai"}
                                    </Badge>
                                    <span className="ml-2 text-xs sm:text-sm text-gray-600">{test_data.totalTests} tes dilakukan</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Gaya Belajar */}
                        <Card className="bg-white shadow-lg rounded-lg border border-gray-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 border-b border-gray-200">
                                <CardTitle className="text-base sm:text-lg font-semibold text-primary">Gaya Belajar</CardTitle>
                                <BookOpenIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </CardHeader>
                            <CardContent className="pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                                {Object.entries(test_data.results).map(([dimension, { type, level }]) => (
                                    <div key={dimension} className="flex justify-between items-center">
                                        <span className="text-xs sm:text-sm text-gray-700 min-w-0">{type}</span>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm ${getBadgeColor(level)}`}>{level}</Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs sm:text-sm">
                                                    Gaya {dimensionMaps[dimension as keyof typeof dimensionMaps]?.title}: {level}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Rekomendasi Belajar */}
                        <Card className="bg-white shadow-lg rounded-lg border border-gray-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 border-b border-gray-200">
                                <CardTitle className="text-base sm:text-lg font-semibold text-primary">Rekomendasi Belajar</CardTitle>
                                <LightbulbIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </CardHeader>
                            <CardContent className="pt-3 sm:pt-4">
                                <ul className="space-y-2 sm:space-y-3">
                                    {test_data.recommendations.slice(0, 3).map((rec, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="mr-2 text-primary">•</span>
                                            <span className="text-xs sm:text-sm text-gray-700 min-w-0">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Detail Gaya Belajar */}
                        <Card className="bg-white shadow-lg rounded-lg border border-gray-200 lg:col-span-3">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 border-b border-gray-200">
                                <CardTitle className="text-base sm:text-lg font-semibold text-primary">Detail Gaya Belajar</CardTitle>
                                <BarChart3Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </CardHeader>
                            <CardContent className="pt-3 sm:pt-4">
                                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-4">
                                    {Object.entries(test_data.results).map(([dimension, { type, value, level }]) => {
                                        const percentageValue = transformValueToPercentage(value);
                                        return (
                                            <div key={dimension} className="space-y-2 sm:space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize min-w-0">{dimensionMaps[dimension as keyof typeof dimensionMaps]?.title}</span>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Badge className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm ${getBadgeColor(level)}`}>{level}</Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-xs sm:text-sm">
                                                                Gaya {dimensionMaps[dimension as keyof typeof dimensionMaps]?.title}: {level}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Progress
                                                    value={percentageValue}
                                                    className="h-1.5 sm:h-2 bg-gray-100 [&>div]:bg-primary"
                                                    style={{ backgroundColor: dimensionMaps[dimension as keyof typeof dimensionMaps]?.color }}
                                                    aria-valuenow={percentageValue}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-label={`Progres gaya belajar ${dimensionMaps[dimension as keyof typeof dimensionMaps]?.title}: ${percentageValue}%`}
                                                />
                                                <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                                                    <span className="min-w-0">{type}</span>
                                                    <span>{percentageValue.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Teknik Belajar */}
                        <Card className="bg-white shadow-lg rounded-lg border border-gray-200 lg:col-span-3">
                            <CardHeader className="pb-2 sm:pb-3 border-b border-gray-200">
                                <CardTitle className="text-base sm:text-lg font-semibold text-primary">Teknik Belajar untuk Kamu</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-3 sm:pt-4">
                                <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
                                    {learning_tips.map((tip, index) => (
                                        <div key={index} className="rounded-lg bg-white p-3 sm:p-4 hover:bg-gray-50 transition-all duration-300">
                                            <div className="mb-2 sm:mb-3 flex items-center">
                                                {getIcon(tip.icon)}
                                                <h3 className="ml-2 text-sm sm:text-base font-medium text-primary">{tip.title}</h3>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-700 min-w-0">{tip.description}</p>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleOpenDialog(tip)}
                                                className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-primary hover:bg-primary/20 rounded-full px-3 sm:px-4 py-1 sm:py-2"
                                                aria-label={`Pelajari lebih lanjut tentang ${tip.title}`}
                                            >
                                                Pelajari lebih lanjut →
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        {/* No Data Placeholder */}
                        <Card className="bg-white shadow-lg rounded-lg border border-gray-200">
                            <CardContent className="flex flex-col items-center gap-4 sm:gap-6 py-6 sm:py-8">
                                <BarChart3Icon className="h-16 w-16 sm:h-20 sm:w-20 text-gray-200 animate-pulse" />
                                <div className="text-center space-y-2 sm:space-y-3">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">Belum Ada Tes Gaya Belajar</h2>
                                    <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-md min-w-0">
                                        Mulai tes gaya belajar Anda sekarang untuk menemukan cara belajar yang paling cocok untuk Anda. Tes ini akan membantu Anda memahami kekuatan dan preferensi belajar Anda!
                                    </p>
                                </div>
                                <Button
                                    onClick={() => (window.location.href = "/student/question")}
                                    className="bg-primary hover:bg-primary text-white text-sm sm:text-base md:text-lg font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-full"
                                    aria-label="Mulai tes gaya belajar"
                                >
                                    Mulai Tes Sekarang
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Placeholder for Gaya Belajar */}
                        <Card className="bg-white shadow-lg rounded-lg border border-gray-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 border-b border-gray-200">
                                <CardTitle className="text-base sm:text-lg font-semibold text-primary">Gaya Belajar</CardTitle>
                                <BookOpenIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </CardHeader>
                            <CardContent className="pt-3 sm:pt-4">
                                <p className="text-gray-600 text-sm sm:text-base">Lengkapi tes untuk melihat gaya belajar Anda di sini.</p>
                            </CardContent>
                        </Card>

                        {/* Teknik Belajar */}
                        <Card className="bg-white shadow-lg rounded-lg border border-gray-200">
                            <CardHeader className="pb-2 sm:pb-3 border-b border-gray-200">
                                <CardTitle className="text-base sm:text-lg font-semibold text-primary">Teknik Belajar untuk Kamu</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-3 sm:pt-4">
                                <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
                                    {learning_tips.map((tip, index) => (
                                        <div key={index} className="rounded-lg bg-white p-3 sm:p-4 hover:bg-gray-50 transition-all duration-300">
                                            <div className="mb-2 sm:mb-3 flex items-center">
                                                {getIcon(tip.icon)}
                                                <h3 className="ml-2 text-sm sm:text-base font-medium text-primary">{tip.title}</h3>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-700 min-w-0">{tip.description}</p>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleOpenDialog(tip)}
                                                className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-primary hover:bg-primary/20 rounded-full px-3 sm:px-4 py-1 sm:py-2"
                                                aria-label={`Pelajari lebih lanjut tentang ${tip.title}`}
                                            >
                                                Pelajari lebih lanjut →
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Dialog Detail Teknik Belajar */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="bg-white rounded-lg p-4 sm:p-6 max-w-sm sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg font-semibold text-primary">{selectedTip?.title || "Detail Teknik Belajar"}</DialogTitle>
                            <DialogDescription id="dialog-description" className="text-xs sm:text-sm text-gray-700">
                                {selectedTip?.detailedDescription || "Tidak ada penjelasan detail tersedia."}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogClose asChild>
                            <Button className="mt-3 sm:mt-4 bg-primary hover:bg-primary text-white text-xs sm:text-sm font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-full" aria-label="Tutup dialog teknik belajar">
                                Tutup
                            </Button>
                        </DialogClose>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}
