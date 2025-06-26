"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Clock, ClipboardCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PRIMARY_COLOR = "#0F67A6";
const TEST_DURATION = "5-10 menit";

export default function StartNewTestPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Placeholder untuk panggilan API
        } catch (err) {
            setError("Gagal memuat data pengguna");
            console.error("Fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    if (isLoading) {
        return (
            <div className="max-w-full sm:max-w-3xl md:max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-8 pt-20 sm:pt-28 flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center space-y-3">
                    <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto animate-spin" style={{ color: PRIMARY_COLOR }} />
                    <p className="text-gray-600 text-sm sm:text-base font-medium">Memuat data tes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-full sm:max-w-3xl md:max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-8 pt-20 sm:pt-28 flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-lg shadow-sm w-full max-w-sm sm:max-w-md">
                    <p className="text-sm sm:text-base">{error}</p>
                    <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="mt-2 w-full text-red-700 hover:bg-red-100 rounded-full text-xs sm:text-sm" aria-label="Coba lagi memuat data">
                        Coba Lagi
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="max-w-7xl mx-auto space-y-8 min-h-screen">
                <Card className="bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300" role="region" aria-label="Halaman mulai tes gaya belajar">
                    <CardContent className="p-4 sm:p-6 md:p-8">
                        <div className="space-y-4 sm:space-y-6">
                            <div className="space-y-2 sm:space-y-3">
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center" style={{ color: PRIMARY_COLOR }}>
                                    <ClipboardCheck className="mr-2 h-6 w-6 sm:h-8 sm:w-8" />
                                    Mulai Tes
                                </h2>
                                <p className="text-gray-600 text-sm sm:text-base max-w-2xl min-w-0 break-words">Identifikasi gaya belajar Anda untuk pengalaman belajar yang lebih efektif.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="space-y-3 sm:space-y-4">
                                        <p className="text-xs sm:text-sm text-gray-700 min-w-0 break-words">
                                            Tes ini membantu Anda mengidentifikasi gaya belajar berdasarkan{" "}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <strong className="font-semibold hover:underline cursor-help" style={{ color: PRIMARY_COLOR }}>
                                                        FSLSM (Felder-Silverman Learning Style Model)
                                                    </strong>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs sm:text-sm">Model FSLSM mengkategorikan gaya belajar ke dalam 4 dimensi: Pemrosesan, Persepsi, Input, dan Pemahaman.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            . Anda akan menjawab serangkaian pertanyaan untuk menentukan preferensi Anda dalam dimensi tersebut.
                                        </p>
                                        <div className="border border-gray-200 p-3 sm:p-4 rounded-lg flex items-center">
                                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" style={{ color: PRIMARY_COLOR }} />
                                            <p className="text-xs sm:text-sm font-medium text-gray-800">Durasi: {TEST_DURATION}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-row gap-2 sm:gap-4 justify-center">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="flex-1 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                                            disabled={!!error}
                                            aria-label="Mulai tes gaya belajar sekarang"
                                        >
                                            <Link href="/student/question">Mulai Tes Sekarang</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
}
