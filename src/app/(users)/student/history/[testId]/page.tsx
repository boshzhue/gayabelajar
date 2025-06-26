"use client";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, BookOpen, BrainCog, CalendarIcon, CheckCircle2, Gauge, ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Interfaces
interface HasilTes {
    id: number;
    dibuat_pada: string;
    skor_pemrosesan: number;
    kategori_pemrosesan: string;
    skor_persepsi: number;
    kategori_persepsi: string;
    skor_input: number;
    kategori_input: string;
    skor_pemahaman: number;
    kategori_pemahaman: string;
    penjelasan: {
        pemrosesan: string;
        persepsi: string;
        input: string;
        pemahaman: string;
    };
    rekomendasi: string;
}

interface RekapTesResponse {
    total_tes: number;
    tanggal_tes_terakhir: string | null;
    daftar_tes: HasilTes[];
}

interface TestDetail {
    id: number;
    completed_at: string;
    result: {
        dimension: string;
        style_type: string;
        score: number;
    }[];
    penjelasan: {
        pemrosesan: string;
        persepsi: string;
        input: string;
        pemahaman: string;
    };
    recommendations: string;
}

const INTENSITY_LEVELS = {
    Kuat: {
        description: "Kamu sangat dominan pada satu sisi. Gaya belajarmu jelas dan konsisten.",
        color: "bg-green-200",
        textColor: "text-green-800",
        icon: <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />,
        scoreRange: "7-11",
    },
    Sedang: {
        description: "Kamu punya kecenderungan ke satu sisi, tapi masih bisa beradaptasi.",
        color: "bg-yellow-200",
        textColor: "text-yellow-800",
        icon: <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />,
        scoreRange: "4-7",
    },
    Lemah: {
        description: "Kamu tidak memiliki preferensi yang jelas. Bisa fleksibel di kedua sisi dimensi.",
        color: "bg-red-200",
        textColor: "text-red-800",
        icon: <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />,
        scoreRange: "4",
    },
};

// Mapping Dimensi
const dimensionMaps = {
    pemrosesan: {
        icon: <BrainCog className="h-6 w-6" />,
        color: "#2563EB",
        title: "Pemrosesan",
    },
    persepsi: {
        icon: <BookOpen className="h-6 w-6" />,
        color: "#2563EB",
        title: "Persepsi",
    },
    input: {
        icon: <ArrowUpRight className="h-6 w-6" />,
        color: "#2563EB",
        title: "Input",
    },
    pemahaman: {
        icon: <CheckCircle2 className="h-6 w-6" />,
        color: "#2563EB",
        title: "Pemahaman",
    },
};

export default function TestDetailPage({ params }: { params: Promise<{ testId: string }> }) {
    const { testId } = use(params);
    const router = useRouter();

    // Query untuk mengambil detail tes
    const {
        data: test,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["testDetail", testId],
        queryFn: async () => {
            const response = await api.get<RekapTesResponse>("/soal/rekap-tes", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const selectedTest = response.data.daftar_tes.find((tes) => tes.id === parseInt(testId));
            if (!selectedTest) throw new Error("Tes tidak ditemukan");

            return {
                id: selectedTest.id,
                completed_at: selectedTest.dibuat_pada,
                result: [
                    { dimension: "pemrosesan", style_type: selectedTest.kategori_pemrosesan, score: selectedTest.skor_pemrosesan },
                    { dimension: "persepsi", style_type: selectedTest.kategori_persepsi, score: selectedTest.skor_persepsi },
                    { dimension: "input", style_type: selectedTest.kategori_input, score: selectedTest.skor_input },
                    { dimension: "pemahaman", style_type: selectedTest.kategori_pemahaman, score: selectedTest.skor_pemahaman },
                ],
                penjelasan: {
                    pemrosesan: selectedTest.penjelasan.pemrosesan || "Penjelasan belum tersedia",
                    persepsi: selectedTest.penjelasan.persepsi || "Penjelasan belum tersedia",
                    input: selectedTest.penjelasan.input || "Penjelasan belum tersedia",
                    pemahaman: selectedTest.penjelasan.pemahaman || "Penjelasan belum tersedia",
                },
                recommendations: selectedTest.rekomendasi || "Rekomendasi belum tersedia",
            } as TestDetail;
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
        enabled: !!testId,
    });

    // Penanganan error
    if (isError) {
        if (error.message.includes("401")) {
            toast.warning("Sesi telah berakhir", { description: "Silakan login kembali" });
            setTimeout(() => router.push("/login"), 3000);
        } else {
            toast.error("Gagal memuat detail tes", { description: error.message });
        }
    }

    // Gaya badge berdasarkan intensitas
    const getBadgeStyle = (styleType: string) => {
        return (
            INTENSITY_LEVELS[styleType as keyof typeof INTENSITY_LEVELS] || {
                color: "bg-gray-100",
                textColor: "text-gray-800",
            }
        );
    };

    // Judul dimensi
    const getDimensionTitle = (dimension: string) => {
        const dimKey = dimension as keyof typeof dimensionMaps;
        return dimensionMaps[dimKey]?.title || dimension.replace("_", " ");
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <motion.div className="text-center space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
                    <p className="text-gray-600 text-lg font-medium font-inter">Memuat detail tes...</p>
                </motion.div>
            </div>
        );
    }

    // Error state
    if (isError || !test) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 pt-28 ">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-sm max-w-md w-full">
                    <p className="font-medium">{error instanceof Error ? error.message : "Data tes tidak ditemukan"}</p>
                    <div className="mt-4 flex gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-full text-red-700 hover:bg-red-100 rounded-full text-sm font-inter" aria-label="Kembali ke halaman sebelumnya">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => refetch()} className="w-full text-blue-700 hover:bg-blue-100 rounded-full text-sm font-inter" aria-label="Coba lagi memuat data">
                            Coba Lagi
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="max-w-7xl mx-auto min-h-screen space-y-8 py-4 lg:px-8">
                {/* Header Section */}
                <Card className="bg-primary shadow-lg rounded-lg border-none">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="space-y-3">
                                <h1 className="text-3xl font-bold text-white flex items-center">
                                    <CalendarIcon className="mr-3 h-8 w-8" />
                                    Detail Hasil Tes
                                </h1>
                                <p className="text-gray-200 text-lg">
                                    {new Date(test.completed_at).toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dimension Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {test.result.map((dimension, index) => {
                        const badgeStyle = getBadgeStyle(dimension.style_type);
                        const dimKey = dimension.dimension as keyof typeof dimensionMaps;

                        return (
                            <motion.div key={dimension.dimension} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                                <Card className="bg-white shadow-lg rounded-xl border border-gray-200 flex flex-col">
                                    <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-gray-200 px-6 pt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <span style={{ color: dimensionMaps[dimKey]?.color }}>{dimensionMaps[dimKey]?.icon}</span>
                                            </div>
                                            <CardTitle className="text-lg font-semibold text-blue-900 font-inter">{getDimensionTitle(dimension.dimension)}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 px-6 pb-6 flex-grow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <div className={`capitalize font-medium py-1 px-3 rounded-full ${badgeStyle.color} ${badgeStyle.textColor} hover:bg-opacity-80 transition-colors`}>{dimension.style_type}</div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        {getDimensionTitle(dimension.dimension)}: {dimension.style_type}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700 font-inter">Skor: {dimension.score}</div>
                                        </div>
                                        <p className="text-gray-600 text-sm font-inter">{test.penjelasan[dimension.dimension as keyof typeof test.penjelasan]}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Rekomendasi Belajar */}
                <Card className="bg-white shadow-lg rounded-xl border border-gray-200">
                    <CardHeader className="pb-3 border-b border-gray-200 px-6 pt-4">
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg font-semibold text-blue-900 font-inter">Rekomendasi Belajar</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 px-6 pb-6">
                        <p className="text-gray-600 text-base font-inter">{test.recommendations}</p>
                    </CardContent>
                </Card>

                {/* Tingkat Intensitas Gaya Belajar */}
                <Card className="bg-white shadow-xl rounded-xl border border-gray-200">
                    <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-200">
                        <CardTitle className="text-lg sm:text-xl font-bold text-blue-900 font-inter flex items-center">
                            <Gauge className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
                            Tingkat Intensitas Gaya Belajar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                            {Object.entries(INTENSITY_LEVELS).map(([level, data], index) => (
                                <Tooltip key={level}>
                                    <TooltipTrigger asChild>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className={`flex items-center gap-3 p-4 sm:p-6 rounded-lg bg-white border border-gray-100 hover:bg-gray-100 active:bg-gray-100 hover:shadow-md transform hover:scale-105 transition-all duration-200`}
                                            role="region"
                                            aria-label={`Tingkat intensitas ${level}: ${data.description}`}
                                        >
                                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${data.color} flex items-center justify-center`}>{data.icon}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                                    <span className={`text-sm sm:text-base font-bold ${data.textColor} font-inter`}>{level}</span>
                                                    <span className={`text-xs sm:text-sm font-medium px-2 py-0.5 sm:py-1 rounded-full ${data.color} ${data.textColor} bg-opacity-30 font-inter`}>Skor: {data.scoreRange}</span>
                                                </div>
                                                <p className="text-sm sm:text-base text-gray-600 font-inter">{data.description}</p>
                                            </div>
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {data.description}: Skor {data.scoreRange}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-gray-600 text-base sm:text-lg mt-8 font-inter">
                    <p className="mb-4">Gunakan hasil tes ini untuk mengoptimalkan strategi belajar Anda</p>
                    <Button
                        onClick={() => router.back()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full px-6 py-2 transform hover:scale-105 transition-transform font-inter"
                        aria-label="Kembali ke halaman sebelumnya"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </div>
            </div>
        </TooltipProvider>
    );
}
