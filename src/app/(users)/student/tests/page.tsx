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
            <div className="max-w-7xl mx-auto px-4 py-12 pt-28 flex items-center justify-center min-h-screen bg-white">
                <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 mx-auto animate-spin" style={{ color: PRIMARY_COLOR }} />
                    <p className="text-gray-600 text-lg font-medium">Memuat data tes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 pt-28 flex items-center justify-center min-h-screen bg-white">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm w-full max-w-md">
                    <p className="text-lg">{error}</p>
                    <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="mt-2 w-full text-red-700 hover:bg-red-100 rounded-full text-sm" aria-label="Coba lagi memuat data">
                        Coba Lagi
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="max-w-7xl mx-auto space-y-8 min-h-screen ">
                <Card className="bg-white shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 lg:p-10">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold flex items-center" style={{ color: PRIMARY_COLOR }}>
                                    <ClipboardCheck className="mr-3 h-8 w-8" />
                                    Mulai Tes
                                </h2>
                                <p className="text-gray-600 text-lg max-w-2xl">Identifikasi gaya belajar Anda untuk pengalaman belajar yang lebih efektif.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-700">
                                            Tes ini membantu Anda mengidentifikasi gaya belajar berdasarkan{" "}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <strong className="font-semibold hover:underline cursor-help" style={{ color: PRIMARY_COLOR }}>
                                                        FSLSM (Felder-Silverman Learning Style Model)
                                                    </strong>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Model FSLSM mengkategorikan gaya belajar ke dalam 4 dimensi: Pemrosesan, Persepsi, Input, dan Pemahaman.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            . Anda akan menjawab serangkaian pertanyaan untuk menentukan preferensi Anda dalam dimensi tersebut.
                                        </p>
                                        <div className="border border-gray-200 p-4 rounded-lg flex items-center">
                                            <Clock className="h-5 w-5 mr-2" style={{ color: PRIMARY_COLOR }} />
                                            <p className="text-sm font-medium text-gray-800">Durasi: {TEST_DURATION}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="w-full sm:w-auto text-white font-medium px-6 py-3 rounded-full transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
