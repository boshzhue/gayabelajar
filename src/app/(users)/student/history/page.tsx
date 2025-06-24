"use client";

import { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { CalendarIcon, BarChart2Icon, BookOpenIcon, Loader2, Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

// Interface for raw API response data
interface TestResponse {
    id: number;
    dibuat_pada: string;
    kategori_pemrosesan?: string;
    skor_pemrosesan?: number;
    kategori_persepsi?: string;
    skor_persepsi?: number;
    kategori_input?: string;
    skor_input?: number;
    kategori_pemahaman?: string;
    skor_pemahaman?: number;
}

// Interface for transformed test data
interface Test {
    id: number;
    completed_at: string;
    result: TestResult[];
}

// Interface for test result per dimension
interface TestResult {
    dimension: string;
    style_type: string;
    score: number;
    description?: string;
}

const dimensions = ["processing", "perception", "input", "understanding"] as const;

const dimensionMaps = {
    processing: { label: "Pemrosesan" },
    perception: { label: "Persepsi" },
    input: { label: "Input" },
    understanding: { label: "Pemahaman" },
};

function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(func: T, wait: number): T & { cancel: () => void } {
    let timeout: NodeJS.Timeout;
    const debounced = ((...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    }) as T & { cancel: () => void };
    debounced.cancel = () => clearTimeout(timeout);
    return debounced;
}

export default function HistoryPage() {
    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "completed_at", direction: "desc" });
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    const {
        data: tests = [],
        isLoading,
        isError,
        error,
    } = useQuery<Test[]>({
        queryKey: ["testHistory", search],
        queryFn: async () => {
            const url = `/soal/rekap-tes${search ? `?search=${encodeURIComponent(search)}` : ""}`;
            const response = await api.get<{ daftar_tes: TestResponse[] }>(url, {
                withCredentials: true,
            });
            const testData = response.data.daftar_tes || [];
            return testData.map((tes: TestResponse) => ({
                id: tes.id,
                completed_at: tes.dibuat_pada,
                result: [
                    { dimension: "processing", style_type: tes.kategori_pemrosesan || "N/A", score: tes.skor_pemrosesan || 0 },
                    { dimension: "perception", style_type: tes.kategori_persepsi || "N/A", score: tes.skor_persepsi || 0 },
                    { dimension: "input", style_type: tes.kategori_input || "N/A", score: tes.skor_input || 0 },
                    { dimension: "understanding", style_type: tes.kategori_pemahaman || "N/A", score: tes.skor_pemahaman || 0 },
                ],
            }));
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    useEffect(() => {
        if (isError) {
            const err = error as AxiosError<{ detail?: string }>;
            if (err.response?.status === 401) {
                toast.warning("Sesi telah berakhir", { description: "Silakan login kembali" });
                router.push("/login");
            } else if (err.response?.status !== 404) {
                toast.error("Gagal memuat riwayat tes", { description: "Silakan coba lagi" });
            }
        }
    }, [isError, error, router]);

    const debouncedSearch = useMemo(() => debounce((query: string) => setSearch(query), 500), []);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize, search]);

    const handleSort = (key: string) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const sortedTests = useMemo(() => {
        const sorted = [...tests];
        sorted.sort((a, b) => {
            const aValue = sortConfig.key === "completed_at" ? new Date(a.completed_at).getTime() : 0;
            const bValue = sortConfig.key === "completed_at" ? new Date(b.completed_at).getTime() : 0;
            return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        });
        return sorted;
    }, [tests, sortConfig]);

    const filteredTests = useMemo(() => {
        if (!search) return sortedTests;
        const lowerSearch = search.toLowerCase();
        return sortedTests.filter((test) => formatDate(test.completed_at).toLowerCase().includes(lowerSearch));
    }, [search, sortedTests]);

    const paginatedTests = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredTests.slice(startIndex, endIndex);
    }, [filteredTests, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredTests.length / pageSize);

    const getStyleByDimension = (results: TestResult[], dimension: string) => results.find((r) => r.dimension === dimension);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const rowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, delay: i * 0.1 },
        }),
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const maxPagesToShow = 5;
        const pages: (number | string)[] = [];
        const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) pages.push("...");
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <TooltipProvider>
            <div className="max-w-7xl mx-auto min-h-screen space-y-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center space-y-4">
                            <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
                            <p className="text-gray-600 text-lg font-medium">Memuat riwayat tes...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <Card className="bg-primary shadow-lg rounded-lg border-none">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="space-y-3">
                                        <h1 className="text-3xl font-bold text-white flex items-center">
                                            <BarChart2Icon className="mr-3 h-8 w-8" />
                                            Lacak Perjalanan Gaya Belajarmu!
                                        </h1>
                                        <p className="text-gray-200 text-lg max-w-2xl">Tinjau riwayat tes gaya belajar Anda untuk menemukan pola yang membawa Anda menuju kesuksesan!</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <StatCard icon={<BookOpenIcon className="h-7 w-7 text-primary" />} label="Total Tes" value={<span className="text-primary">{tests.length.toString()}</span>} />
                            <StatCard icon={<CalendarIcon className="h-7 w-7 text-primary" />} label="Tes Terakhir" value={<span className="text-primary">{tests.length > 0 ? formatDate(tests[0].completed_at) : "-"}</span>} />
                        </div>

                        <Card className="bg-white shadow-lg rounded-lg border border-gray-200">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <CardTitle className="text-lg font-semibold text-primary">Riwayat Tes</CardTitle>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                                        <div className="relative w-full sm:w-64">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            {isLoading && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-primary" />}
                                            <Input
                                                placeholder="Cari berdasarkan tanggal..."
                                                defaultValue={search}
                                                onChange={(e) => debouncedSearch(e.target.value)}
                                                className="pl-10 w-full border-gray-200 focus:ring-primary focus:border-primary rounded-full text-sm"
                                                aria-label="Cari riwayat tes berdasarkan tanggal"
                                            />
                                        </div>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => setPageSize(Number(e.target.value))}
                                            className="w-full sm:w-32 border border-gray-200 text-sm text-primary rounded-full py-2 px-3 focus:ring-2 focus:ring-primary focus:border-primary bg-white hover:bg-white transition-colors"
                                            aria-label="Pilih jumlah entri per halaman"
                                        >
                                            {[5, 10, 25, 50].map((size) => (
                                                <option key={size} value={size}>
                                                    {size} entri
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table aria-label="Riwayat Tes Gaya Belajar">
                                        <TableHeader className="bg-primary ">
                                            <TableRow>
                                                <TableHead className="text-white text-center w-16 text-sm">No</TableHead>
                                                <TableHead className="text-white min-w-[180px] text-sm">
                                                    <Button variant="ghost" className="text-white hover:bg-primary/20 rounded-full text-sm" onClick={() => handleSort("completed_at")} aria-label="Urutkan berdasarkan tanggal">
                                                        Tanggal
                                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </TableHead>
                                                {dimensions.map((dim) => (
                                                    <TableHead key={dim} className="text-white text-center min-w-[120px] text-sm">
                                                        {dimensionMaps[dim].label}
                                                    </TableHead>
                                                ))}
                                                <TableHead className="text-white text-center min-w-[120px] text-sm">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                Array(5)
                                                    .fill(0)
                                                    .map((_, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell colSpan={7} className="py-6">
                                                                <Skeleton className="h-8 w-full rounded-lg" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                            ) : paginatedTests.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-12">
                                                        <EmptyState onStartTest={() => router.push("/student/test")} />
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedTests.map((test, index) => (
                                                    <motion.tr
                                                        key={test.id}
                                                        custom={index}
                                                        variants={rowVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        className="border-b border-gray-200 hover:bg-white cursor-pointer transition-all duration-300 focus:ring-2 focus:ring-primary"
                                                        onClick={() => router.push(`/student/history/${test.id}`)}
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={(e) => e.key === "Enter" && router.push(`/student/history/${test.id}`)}
                                                        aria-label={`Lihat detail tes pada ${formatDate(test.completed_at)}`}
                                                    >
                                                        <TableCell className="text-center text-sm text-gray-700">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                                        <TableCell className="font-medium text-primary text-sm">{formatDate(test.completed_at)}</TableCell>
                                                        {dimensions.map((dim) => {
                                                            const result = getStyleByDimension(test.result, dim);
                                                            return (
                                                                <TableCell key={dim} className="text-center text-sm">
                                                                    {result && result.style_type !== "N/A" ? (
                                                                        <Tooltip>
                                                                            <TooltipTrigger>
                                                                                <Badge className="bg-white text-primary font-medium rounded-full py-1 px-2">{result.style_type}</Badge>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="bg-primary text-white">
                                                                                <p>
                                                                                    {dimensionMaps[dim].label}: {result.description || "Tidak ada deskripsi"}
                                                                                </p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    ) : (
                                                                        <span className="text-gray-400">N/A</span>
                                                                    )}
                                                                </TableCell>
                                                            );
                                                        })}
                                                        <TableCell className="text-center">
                                                            <Button
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.push(`/student/history/${test.id}`);
                                                                }}
                                                                className="bg-primary hover:bg-primary text-white font-medium px-4 py-1.5 rounded-full text-sm"
                                                                aria-label={`Lihat detail tes pada ${formatDate(test.completed_at)}`}
                                                            >
                                                                Lihat
                                                            </Button>
                                                        </TableCell>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                {filteredTests.length > 0 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
                                        <div className="text-sm text-gray-600">
                                            Menampilkan {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredTests.length)} dari {filteredTests.length} entri
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="border-gray-200 rounded-full text-sm px-4 py-2"
                                                aria-label="Halaman sebelumnya"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            {getPageNumbers().map((page, index) => (
                                                <Button
                                                    key={`page-${index}`}
                                                    variant={page === currentPage ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => typeof page === "number" && handlePageChange(page)}
                                                    disabled={typeof page !== "number"}
                                                    className={`text-sm font-semibold ${page === currentPage ? "bg-primary text-white hover:bg-primary" : "border-gray-200 text-gray-600 hover:bg-white"} rounded-full px-4 py-1`}
                                                    aria-label={typeof page === "number" ? `Halaman ${page}` : "Elipsis"}
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="border-gray-200 rounded-full text-sm px-4 py-2"
                                                aria-label="Halaman berikutnya"
                                            >
                                                Berikutnya
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
                <div className="text-center text-gray-500 text-lg mt-8 sm:text-sm">Tes gaya belajar membantu Anda mengoptimalkan proses belajar dengan pendekatan yang sesuai</div>
            </div>
        </TooltipProvider>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="bg-white shadow-lg rounded-lg p-6 hover:bg-white transition-all duration-300">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm">{icon}</div>
                <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase sm:text-sm">{label}</p>
                    <p className="text-lg font-bold text-primary sm:text-2xl">{value}</p>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ onStartTest }: { onStartTest: () => void }) {
    return (
        <motion.div className="flex flex-col items-center gap-3 py-8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <BarChart2Icon className="h-20 w-20 text-gray-200" />
            </motion.div>
            <div className="text-center space-y-3">
                <p className="text-gray-600 text-lg font-medium sm:text-lg">Belum ada riwayat tes</p>
                <p className="text-gray-600 text-sm max-w-xs sm:text-sm">Mulai petualangan belajarmu sekarang untuk memahami cara belajar yang paling efektif!</p>
            </div>
            <Button onClick={onStartTest} className="bg-primary hover:bg-primary text-white font-medium px-6 py-3 rounded-full text-sm">
                Mulai Tes Sekarang
            </Button>
        </motion.div>
    );
}
