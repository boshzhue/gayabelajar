"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
        description: "Kamu sangat dominan pada satu sisi. Gaya belajarmu jelas dan konsisten.",
        color: "bg-green-200",
        textColor: "text-green-800",
        scoreRange: "7-11",
    },
    Sedang: {
        description: "Kamu punya kecenderungan ke satu sisi, tapi masih bisa beradaptasi.",
        color: "bg-yellow-200",
        textColor: "text-yellow-800",
        scoreRange: "4-7",
    },
    Lemah: {
        description: "Kamu tidak memiliki preferensi yang jelas. Bisa fleksibel di kedua sisi dimensi.",
        color: "bg-red-200",
        textColor: "text-red-800",
        scoreRange: "1-3",
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

    // Ambil data dari localStorage dan atur efek loading
    useEffect(() => {
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
    }, []);

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

    // Gaya badge berdasarkan intensitas
    const getBadgeStyle = (styleType: string) => {
        return (
            INTENSITY_LEVELS[styleType as keyof typeof INTENSITY_LEVELS] || {
                color: "bg-gray-100",
                textColor: "text-gray-800",
            }
        );
    };

    if (isLoadingData || isProcessing) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-center min-h-screen p-4">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: "easeOut" }} className="text-center space-y-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Loader2 className="h-12 w-12 mx-auto text-primary" />
                    </motion.div>
                    <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }} className="text-gray-600 text-lg font-medium font-inter">
                        Memproses hasil tes Anda...
                    </motion.p>
                </motion.div>
            </motion.div>
        );
    }

    if (!testResults) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 pt-28 ">
                <Card className="bg-white shadow-lg rounded-xl border border-gray-200">
                    <CardContent className="p-6 text-center">
                        <h1 className="text-2xl font-bold text-primary font-inter">Tidak Ada Hasil Tes</h1>
                        <p className="text-gray-600 text-base font-inter mt-2">Anda belum menyelesaikan tes apa pun.</p>
                        <div className="mt-4 flex gap-4 justify-center">
                            <Button
                                onClick={() => router.push("/student")}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full px-6 py-2 transform hover:scale-105 transition-transform font-inter"
                                aria-label="Kembali ke dashboard"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Kembali ke Dashboard
                            </Button>
                            <Button
                                onClick={() => setIsLoadingData(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full px-6 py-2 transform hover:scale-105 transition-transform font-inter"
                                aria-label="Coba lagi memuat data"
                            >
                                Coba Lagi
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <AnimatePresence>
                <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="max-w-7xl mx-auto space-y-8 min-h-screen sm:px-6 lg:px-8 ">
                    {/* Header Section */}
                    <Card className="bg-primary shadow-xl rounded-xl border-none">
                        <CardContent className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div className="space-y-3">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center font-inter">
                                        <CalendarIcon className="mr-3 h-8 w-8" />
                                        Hasil Tes
                                    </h1>
                                    <p className="text-gray-200 text-base sm:text-lg font-inter">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {testResults.result.map((dimension, index) => {
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
                                                <CardTitle className="text-lg font-semibold text-primary font-inter">{dimensionMaps[dimKey]?.title || dimension.dimension}</CardTitle>
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
                                                            {dimensionMaps[dimKey]?.title || dimension.dimension}: {dimension.style_type}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700 font-inter">Skor: {dimension.score}</div>
                                            </div>
                                            <p className="text-gray-600 text-sm font-inter">{dimension.penjelasan}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Recommendations Card */}
                    <Card className="bg-white shadow-lg rounded-xl border border-gray-200">
                        <CardHeader className="pb-3 border-b border-gray-200 px-6 pt-4">
                            <div className="flex items-center gap-3">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-lg font-semibold text-primary font-inter">Rekomendasi Belajar</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 px-6 pb-6">
                            <ul className="list-disc pl-5 space-y-3 text-base font-inter">
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
                    <Card className="bg-white shadow-lg rounded-xl border border-gray-200">
                        <CardHeader className="pb-3 border-b border-gray-200 px-6 pt-4">
                            <CardTitle className="text-lg font-semibold text-primary font-inter flex items-center">
                                <Gauge className="h-5 w-5 text-blue-600 mr-2" />
                                Tingkat Intensitas Gaya Belajar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-6 pb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {Object.entries(INTENSITY_LEVELS).map(([level, data], index) => (
                                    <Tooltip key={level}>
                                        <TooltipTrigger asChild>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                className={`flex items-start gap-3 p-4 rounded-lg bg-white border border-gray-100 hover:bg-gray-50 hover:shadow-md transform hover:scale-105 transition-all duration-200`}
                                                role="region"
                                                aria-label={`Tingkat intensitas ${level}: ${data.description}`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-sm font-bold ${data.textColor} font-inter`}>{level}</span>
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${data.color} ${data.textColor} bg-opacity-30 font-inter`}>Skor: {data.scoreRange}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 font-inter">{data.description}</p>
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
                    <div className="text-center text-gray-600 text-base mt-8 font-inter">
                        <p className="mb-4">Gunakan hasil tes ini untuk mengoptimalkan strategi belajar Anda</p>
                        <Button
                            onClick={() => router.push("/student")}
                            className="bg-primary hover:bg-blue-700 text-white font-medium rounded-full px-6 py-2 transform hover:scale-105 transition-transform font-inter"
                            aria-label="Kembali ke dashboard"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Kembali ke Dashboard
                        </Button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </TooltipProvider>
    );
}
