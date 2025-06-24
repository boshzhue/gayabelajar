"use client";
import { use } from "react";
import { Badge } from "@/components/ui/badge";
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

// Level Intensitas
const INTENSITY_LEVELS = {
    Kuat: {
        description: "Sangat dominan dalam gaya belajar ini",
        color: "bg-green-50",
        textColor: "text-green-700",
        icon: <Gauge className="h-4 w-4 text-green-600" />,
    },
    Sedang: {
        description: "Cukup menonjol dalam gaya belajar ini",
        color: "bg-yellow-50",
        textColor: "text-yellow-700",
        icon: <Gauge className="h-4 w-4 text-yellow-600" />,
    },
    Lemah: {
        description: "Kurang dominan dalam gaya belajar ini",
        color: "bg-red-50",
        textColor: "text-red-700",
        icon: <Gauge className="h-4 w-4 text-red-600" />,
    },
};

// Mapping Dimensi
const dimensionMaps = {
    pemrosesan: {
        icon: <BrainCog className="h-6 w-6" />,
        color: "#0F67A6",
        title: "Pemrosesan",
    },
    persepsi: {
        icon: <BookOpen className="h-6 w-6" />,
        color: "#0F67A6",
        title: "Persepsi",
    },
    input: {
        icon: <ArrowUpRight className="h-6 w-6" />,
        color: "#0F67A6",
        title: "Input",
    },
    pemahaman: {
        icon: <CheckCircle2 className="h-6 w-6" />,
        color: "#0F67A6",
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

    // Gaya badge
    const getBadgeStyle = () => {
        return { bg: "#E6F0FA", text: "text-primary" };
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
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                    <p className="text-gray-600 text-lg font-medium">Memuat detail tes...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (isError || !test) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 pt-28 bg-white">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm max-w-md w-full">
                    {error instanceof Error ? error.message : "Data tes tidak ditemukan"}
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="mt-2 w-full text-red-700 hover:bg-red-100 rounded-full text-sm" aria-label="Kembali ke halaman sebelumnya">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="max-w-7xl mx-auto min-h-screen space-y-8 px-4 py-4">
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

                {/* Dimension Cards dengan ukuran tetap */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {test.result.map((dimension, index) => {
                        const badgeStyle = getBadgeStyle();
                        const dimKey = dimension.dimension as keyof typeof dimensionMaps;

                        return (
                            <motion.div key={dimension.dimension} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="h-full">
                                <Card className="bg-white shadow-lg rounded-lg border border-gray-200 h-80 flex flex-col justify-between">
                                    <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg">
                                                <span style={{ color: dimensionMaps[dimKey]?.color }}>{dimensionMaps[dimKey]?.icon}</span>
                                            </div>
                                            <CardTitle className="text-lg font-semibold text-primary">{getDimensionTitle(dimension.dimension)}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 flex-grow overflow-y-auto">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Badge className="capitalize font-medium py-1 px-3 rounded-full" style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}>
                                                        {dimension.style_type}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        {getDimensionTitle(dimension.dimension)}: {dimension.style_type}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">Skor: {dimension.score}</div>
                                        </div>
                                        <p className="text-gray-600 text-sm">{test.penjelasan[dimension.dimension as keyof typeof test.penjelasan]}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Rekomendasi Belajar */}
                <Card className="bg-white shadow-lg rounded-lg border border-gray-200">
                    <CardHeader className="pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg font-semibold text-primary">Rekomendasi Belajar</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-gray-600 text-sm">{test.recommendations}</p>
                    </CardContent>
                </Card>

                {/* Tingkat Intensitas */}
                <Card className="bg-white shadow-lg rounded-lg border border-gray-200">
                    <CardHeader className="pb-3 border-b border-gray-200">
                        <CardTitle className="text-lg font-semibold text-primary">Tingkat Intensitas Gaya Belajar</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            {Object.entries(INTENSITY_LEVELS).map(([level, data]) => (
                                <motion.div
                                    key={level}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-start gap-3 p-4 bg-white rounded-lg hover:bg-white transition-all duration-200"
                                >
                                    <div className={`w-5 h-5 rounded-full ${data.color} flex items-center justify-center mt-0.5`}>{data.icon}</div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-sm font-semibold ${data.textColor}`}>{level}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${data.color} bg-opacity-20 ${data.textColor}`}>{level === "Kuat" ? "7-11" : level === "Sedang" ? "4-7" : "4"}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{data.description}</p>
                                        <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded-lg">
                                            {level === "Kuat" && (
                                                <p>
                                                    <span className="font-medium">Contoh:</span> Anda secara alami selalu mencari cara belajar yang sesuai dengan gaya ini
                                                </p>
                                            )}
                                            {level === "Sedang" && (
                                                <p>
                                                    <span className="font-medium">Contoh:</span> Anda cukup nyaman dengan gaya ini tetapi masih fleksibel
                                                </p>
                                            )}
                                            {level === "Lemah" && (
                                                <p>
                                                    <span className="font-medium">Contoh:</span> Anda jarang menggunakan gaya ini tanpa adaptasi khusus
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-gray-600 text-lg mt-8">
                    <p className="mb-4">Gunakan hasil tes ini untuk mengoptimalkan strategi belajar Anda</p>
                    <Button onClick={() => router.back()} className="bg-primary hover:bg-primary text-white font-medium rounded-full px-6 py-2" aria-label="Kembali ke halaman sebelumnya">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </div>
            </div>
        </TooltipProvider>
    );
}
