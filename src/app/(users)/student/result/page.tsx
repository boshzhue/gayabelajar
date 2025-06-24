"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, CalendarIcon, BookOpen, BrainCog, ArrowUpRight, CheckCircle2, Gauge, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TestResult {
    id: number;
    completed_at: string;
    result: {
        dimension: string;
        style_type: string;
        score: number;
        penjelasan: string;
        description: string;
    }[];
    recommendations: {
        id: number;
        content: string;
        priority: number;
    }[];
}

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

const dimensionMaps = {
    Pemrosesan: {
        icon: <BrainCog className="h-6 w-6" />,
        color: "#0F67A6",
        title: "Pemrosesan",
    },
    Persepsi: {
        icon: <BookOpen className="h-6 w-6" />,
        color: "#0F67A6",
        title: "Persepsi",
    },
    Input: {
        icon: <ArrowUpRight className="h-6 w-6" />,
        color: "#0F67A6",
        title: "Input",
    },
    Pemahaman: {
        icon: <CheckCircle2 className="h-6 w-6" />,
        color: "#0F67A6",
        title: "Pemahaman",
    },
};

export default function ResultPage() {
    const router = useRouter();
    const [testResults, setTestResults] = useState<TestResult | null>(null);
    const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState<boolean>(true);

    // Ambil data dari localStorage, atur efek loading, dan scroll ke atas saat halaman dimuat
    useEffect(() => {
        // Scroll ke posisi paling atas saat halaman dimuat
        window.scrollTo(0, 0);

        const savedResults = localStorage.getItem("quiz_results");
        if (savedResults) {
            setTestResults(JSON.parse(savedResults));
        }
        setIsLoadingData(false);

        // Simulasi pemrosesan hasil selama 1,5 detik
        const processingTimeout = setTimeout(() => {
            setIsProcessing(false);
        }, 1500);

        return () => clearTimeout(processingTimeout);
    }, []); // Dependensi kosong agar hanya dijalankan sekali saat mount

    // Animasi untuk konten halaman
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    const pageTransition = {
        duration: 0.4,
        ease: "easeOut",
    };

    if (isLoadingData || isProcessing) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 min-h-screen">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: "easeOut" }} className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Loader2 className="h-10 w-10 text-primary" />
                    </motion.div>
                    <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }} className="text-sm font-medium text-primary">
                        Memproses hasil tes Anda...
                    </motion.p>
                </motion.div>
            </motion.div>
        );
    }

    if (!testResults) {
        return (
            <div className="max-w-7xl mx-auto min-h-screen">
                <Card className="bg-white shadow-lg rounded-lg border border-gray-200">
                    <CardContent className="p-6 text-center">
                        <h1 className="text-2xl font-bold text-primary">Tidak Ada Hasil Tes</h1>
                        <p className="text-gray-600 text-lg mt-2">Anda belum menyelesaikan tes apa pun.</p>
                        <Button onClick={() => router.push("/student")} className="mt-4 bg-primary hover:bg-primary text-white font-medium rounded-full px-6 py-2" aria-label="Kembali ke dashboard">
                            Kembali ke Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <AnimatePresence>
                <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="max-w-7xl mx-auto space-y-8 min-h-screen">
                    {/* Header Section */}
                    <Card className="bg-primary shadow-lg rounded-lg border-none">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="space-y-3">
                                    <h1 className="text-3xl font-bold text-white flex items-center">
                                        <CalendarIcon className="mr-3 h-8 w-8" />
                                        Hasil Tes
                                    </h1>
                                    <p className="text-gray-200 text-lg">
                                        {new Date(testResults.completed_at).toLocaleDateString("id-ID", {
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
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        {testResults.result.map((dimension, index) => {
                            const badgeStyle = { bg: "#E6F0FA", text: "text-primary" };
                            const dimKey = dimension.dimension as keyof typeof dimensionMaps;

                            return (
                                <motion.div key={dimension.dimension} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                                    <Card className="bg-white shadow-lg rounded-lg border border-gray-200 h-[300px] flex flex-col">
                                        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg">
                                                    <span style={{ color: dimensionMaps[dimKey]?.color }}>{dimensionMaps[dimKey]?.icon}</span>
                                                </div>
                                                <CardTitle className="text-lg font-semibold text-primary">{dimensionMaps[dimKey]?.title || dimension.dimension}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 flex-1 overflow-hidden">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Badge className="capitalize font-medium py-1 px-3 rounded-full" style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}>
                                                            {dimension.style_type}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            {dimensionMaps[dimKey]?.title || dimension.dimension}: {dimension.style_type}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">Skor: {dimension.score}</div>
                                            </div>
                                            <p className="text-gray-600 text-sm line-clamp-5">{dimension.penjelasan}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Recommendations Card */}
                    <Card className="bg-white shadow-lg rounded-lg border border-gray-200">
                        <CardHeader className="pb-3 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg font-semibold text-primary">Rekomendasi Belajar</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <ul className="list-disc pl-5 space-y-3 text-sm">
                                {testResults.recommendations
                                    .sort((a, b) => a.priority - b.priority)
                                    .map((rec) => (
                                        <li key={rec.id} className="text-gray-600">
                                            <span className="text-primary font-medium">Prioritas {rec.priority}:</span> {rec.content}
                                        </li>
                                    ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Intensity Levels */}
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
                        <Button onClick={() => router.push("/student")} className="bg-primary hover:bg-primary text-white font-medium rounded-full px-6 py-2" aria-label="Kembali ke dashboard">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Kembali ke Dashboard
                        </Button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </TooltipProvider>
    );
}
