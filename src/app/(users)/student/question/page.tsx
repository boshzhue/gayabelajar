"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import api from "@/lib/axios";

interface Question {
    id: number;
    pertanyaan: string;
    pilihan_a: string;
    pilihan_b: string;
}

interface Rekomendasi {
    dimensi: string;
    penjelasan: string;
    rekomendasi: string;
}

interface SubmitResponse {
    kategori_pemrosesan: string;
    skor_pemrosesan: number;
    kategori_persepsi: string;
    skor_persepsi: number;
    kategori_input: string;
    skor_input: number;
    kategori_pemahaman: string;
    skor_pemahaman: number;
}

interface TestResult {
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

const QUESTIONS_PER_PAGE = 11;
const TOTAL_QUESTIONS = 44;
const STORAGE_KEY = "quiz_answers";
const PAGE_STORAGE_KEY = "quiz_page";
const RESULT_STORAGE_KEY = "quiz_results";
const PROCESSING_KEY = "quiz_processing";

export default function TestPage() {
    const router = useRouter();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
    const [answers, setAnswers] = useState<number[]>(() => Array(TOTAL_QUESTIONS).fill(-1));
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [unansweredQuestions, setUnansweredQuestions] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalPages = Math.ceil(TOTAL_QUESTIONS / QUESTIONS_PER_PAGE);

    const currentQuestions = useMemo(() => {
        const start = currentPage * QUESTIONS_PER_PAGE;
        const end = start + QUESTIONS_PER_PAGE;
        return questions.slice(start, end);
    }, [currentPage, questions]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await api.get<Question[]>("/soal");
                setQuestions(response.data);
            } catch (error) {
                console.error("Gagal mengambil soal:", error);
                const errorMessage = "Gagal memuat soal dari server";
                setErrorMessage(errorMessage);

                toast.error(errorMessage, {
                    duration: 5000,
                    style: { background: "#FEE2E2", color: "#B91C1C" },
                    iconTheme: { primary: "#B91C1C", secondary: "#FEE2E2" },
                });

                if (String(error).includes("401")) {
                    setTimeout(() => router.push("/login"), 3000);
                }
            } finally {
                setIsLoadingQuestions(false);
            }
        };

        fetchQuestions();
    }, [router]);

    useEffect(() => {
        const savedAnswers = localStorage.getItem(STORAGE_KEY);
        if (savedAnswers) {
            try {
                setAnswers(JSON.parse(savedAnswers));
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        const savedPage = localStorage.getItem(PAGE_STORAGE_KEY);
        if (savedPage) {
            try {
                const page = parseInt(savedPage, 10);
                if (!isNaN(page) && page >= 0 && page < totalPages) {
                    setCurrentPage(page);
                }
            } catch {
                localStorage.removeItem(PAGE_STORAGE_KEY);
            }
        }
    }, [totalPages]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
        localStorage.setItem(PAGE_STORAGE_KEY, currentPage.toString());
    }, [answers, currentPage]);

    const progress = useMemo(() => {
        const answered = answers.filter((a) => a !== -1).length;
        return Math.floor((answered / TOTAL_QUESTIONS) * 100);
    }, [answers]);

    const handleAnswer = useCallback(
        (questionIndex: number, answerIndex: number) => {
            setAnswers((prev) => {
                const newAnswers = [...prev];
                const absoluteIndex = currentPage * QUESTIONS_PER_PAGE + questionIndex;
                newAnswers[absoluteIndex] = answerIndex;
                return newAnswers;
            });
            setErrorMessage("");
        },
        [currentPage]
    );

    const validateCurrentPage = useCallback(() => {
        const start = currentPage * QUESTIONS_PER_PAGE;
        const end = start + QUESTIONS_PER_PAGE;
        const unanswered = answers
            .slice(start, end)
            .map((answer, index) => (answer === -1 ? start + index + 1 : -1))
            .filter((index) => index !== -1);

        if (unanswered.length > 0) {
            setUnansweredQuestions(unanswered);
            setShowWarningModal(true);
            return false;
        }
        return true;
    }, [currentPage, answers]);

    const goToPage = useCallback(
        (page: number) => {
            if (page < 0 || page >= totalPages) return;
            setCurrentPage(page);
            setErrorMessage("");
            setUnansweredQuestions([]);
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        [totalPages]
    );

    const handleFinish = useCallback(async () => {
        setIsSubmitting(true);
        localStorage.setItem(PROCESSING_KEY, "true");

        try {
            const unanswered = answers.map((answer, index) => (answer === -1 ? index + 1 : -1)).filter((index) => index !== -1);

            if (unanswered.length > 0) {
                setUnansweredQuestions(unanswered);
                setShowWarningModal(true);
                localStorage.removeItem(PROCESSING_KEY);
                setIsSubmitting(false);
                return;
            }

            const jawaban = answers.map((answer, index) => ({
                id_soal: index + 1,
                pilihan: answer === 0 ? "A" : "B",
            }));

            const submitResponse = await api.post<SubmitResponse>("/soal/submit", jawaban);
            const resultData = submitResponse.data;

            const rekomendasiResponse = await api.get<Rekomendasi[]>("/soal/rekomendasi");
            const rekomendasiData = rekomendasiResponse.data;

            const result = [
                {
                    dimension: "Pemrosesan",
                    style_type: resultData.kategori_pemrosesan,
                    score: resultData.skor_pemrosesan,
                    penjelasan: rekomendasiData.find((r) => r.dimensi.toLowerCase() === "pemrosesan")?.penjelasan || "Penjelasan tidak tersedia",
                    description: rekomendasiData.find((r) => r.dimensi.toLowerCase() === "pemrosesan")?.rekomendasi || "Rekomendasi tidak tersedia",
                },
                {
                    dimension: "Persepsi",
                    style_type: resultData.kategori_persepsi,
                    score: resultData.skor_persepsi,
                    penjelasan: rekomendasiData.find((r) => r.dimensi.toLowerCase() === "persepsi")?.penjelasan || "Penjelasan tidak tersedia",
                    description: rekomendasiData.find((r) => r.dimensi.toLowerCase() === "persepsi")?.rekomendasi || "Rekomendasi tidak tersedia",
                },
                {
                    dimension: "Input",
                    style_type: resultData.kategori_input,
                    score: resultData.skor_input,
                    penjelasan: rekomendasiData.find((r) => r.dimensi.toLowerCase() === "input")?.penjelasan || "Penjelasan tidak tersedia",
                    description: rekomendasiData.find((r) => r.dimensi.toLowerCase() === "input")?.rekomendasi || "Rekomendasi tidak tersedia",
                },
                {
                    dimension: "Pemahaman",
                    style_type: resultData.kategori_pemahaman,
                    score: resultData.skor_pemahaman,
                    penjelasan: rekomendasiData.find((r) => r.dimensi.toLowerCase() === "pemahaman")?.penjelasan || "Penjelasan tidak tersedia",
                    description: rekomendasiData.find((r) => r.dimensi.toLowerCase() === "pemahaman")?.rekomendasi || "Rekomendasi tidak tersedia",
                },
            ];

            const recommendations = rekomendasiData.map((r, index) => ({
                id: index,
                content: r.rekomendasi,
                priority: index + 1,
            }));

            const testResults: TestResult = {
                completed_at: new Date().toISOString(),
                result,
                recommendations,
            };

            localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(testResults));
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(PAGE_STORAGE_KEY);

            router.push("/student/result");
        } catch (error) {
            localStorage.removeItem(PROCESSING_KEY);

            let errorMessage = "Terjadi kesalahan saat mengirim jawaban";
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.detail || error.message;
            }

            setErrorMessage(errorMessage);
            toast.error(errorMessage, {
                duration: 5000,
                style: { background: "#FEE2E2", color: "#B91C1C" },
                iconTheme: { primary: "#B91C1C", secondary: "#FEE2E2" },
            });

            if (errorMessage.includes("401")) {
                setTimeout(() => router.push("/login"), 3000);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [answers, router]);

    const scrollToUnanswered = useCallback((questionNumber: number) => {
        const element = document.getElementById(`question-${questionNumber}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("ring-2", "ring-orange-500", "animate-pulse");
            setTimeout(() => {
                element.classList.remove("ring-2", "ring-orange-500", "animate-pulse");
            }, 2000);
        }
        setShowWarningModal(false);
    }, []);

    if (isLoadingQuestions) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-2 sm:px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-primary">Memuat soal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center py-4 sm:py-6">
            <div className="w-full max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl">
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md mb-4 sm:mb-6">
                    <h1 className="text-base sm:text-lg md:text-xl font-bold text-center text-primary">
                        Tes Gaya Belajar (Soal {currentPage * QUESTIONS_PER_PAGE + 1} - {Math.min((currentPage + 1) * QUESTIONS_PER_PAGE, TOTAL_QUESTIONS)})
                    </h1>
                    {errorMessage && <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-red-50 text-red-700 rounded-lg text-xs sm:text-sm">{errorMessage}</div>}
                    <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                        <Progress value={progress} className="h-1.5 sm:h-2 flex-1 bg-gray-200 [&>div]:bg-primary" aria-label={`Progres tes: ${progress}%`} />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">{progress}% Terisi</span>
                    </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                    {currentQuestions.map((question, index) => {
                        const absoluteIndex = currentPage * QUESTIONS_PER_PAGE + index;
                        return (
                            <div key={question.id} id={`question-${absoluteIndex + 1}`} className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200">
                                <h2 className="font-bold text-sm sm:text-base md:text-lg mb-2 sm:mb-3 text-primary">
                                    {absoluteIndex + 1}. {question.pertanyaan}
                                </h2>
                                <div className="space-y-2 sm:space-y-3">
                                    {[question.pilihan_a, question.pilihan_b].map((option, optIndex) => (
                                        <div
                                            key={optIndex}
                                            className={`p-2 sm:p-3 border rounded-lg cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                                                answers[absoluteIndex] === optIndex ? "border-primary bg-primary/20" : "border-gray-200 hover:bg-gray-50"
                                            }`}
                                            onClick={() => handleAnswer(index, optIndex)}
                                            role="button"
                                            aria-label={`Pilih jawaban ${optIndex === 0 ? "A" : "B"}: ${option}`}
                                        >
                                            <div className="flex items-center">
                                                <span
                                                    className={`flex-shrink-0 aspect-square inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 rounded-full ${
                                                        answers[absoluteIndex] === optIndex ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
                                                    }`}
                                                >
                                                    {optIndex === 0 ? "A" : "B"}
                                                </span>
                                                <span className="text-xs sm:text-sm md:text-base text-gray-700 max-w-[calc(100%-2.5rem)] sm:max-w-[calc(100%-3rem)] min-w-0 break-words">{option}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-row justify-between gap-2 mt-4 sm:mt-6 mb-6 sm:mb-8">
                    <Button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0} variant="outline" className="flex-1 border-orange-500 text-orange-500 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] rounded-full">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Sebelumnya
                    </Button>

                    {currentPage === totalPages - 1 ? (
                        <Button onClick={() => setShowConfirmModal(true)} disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] rounded-full">
                            {isSubmitting ? "Mengirim..." : "Selesai"}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                if (validateCurrentPage()) goToPage(currentPage + 1);
                            }}
                            className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] rounded-full"
                        >
                            Berikutnya
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Modal Peringatan */}
            {showWarningModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-all duration-200">
                    <div className="bg-white p-3 sm:p-4 rounded-xl max-w-[85%] sm:max-w-sm w-full mx-2 sm:mx-4 shadow-xl">
                        <h3 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 text-orange-500">Perhatian</h3>
                        <p className="mb-2 sm:mb-3 text-xs sm:text-sm text-gray-700">Anda belum menjawab pertanyaan berikut:</p>
                        <ul className="list-disc pl-4 sm:pl-5 mb-3 sm:mb-4 space-y-1 text-xs sm:text-sm text-gray-700">
                            {unansweredQuestions.map((qIndex) => (
                                <li key={qIndex}>Soal {qIndex}</li>
                            ))}
                        </ul>
                        <div className="flex flex-row justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowWarningModal(false)} className="text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] rounded-full">
                                Tutup
                            </Button>
                            <Button onClick={() => scrollToUnanswered(unansweredQuestions[0])} className="bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] rounded-full">
                                Lihat Soal
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-all duration-200">
                    <div className="bg-white p-3 sm:p-4 rounded-xl max-w-[85%] sm:max-w-sm w-full mx-2 sm:mx-4 shadow-xl">
                        <h3 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 text-primary">Konfirmasi Penyelesaian</h3>
                        <p className="mb-2 sm:mb-3 text-xs sm:text-sm text-gray-700">Apakah Anda yakin ingin menyelesaikan tes? Pastikan semua jawaban telah diisi.</p>
                        <div className="flex flex-row justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] rounded-full">
                                Batal
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    handleFinish();
                                }}
                                className="bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] rounded-full"
                            >
                                Selesai
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
