"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import axios from "axios";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";

// Konstanta untuk konfigurasi dan styling
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DIMENSIONS = ["pemrosesan", "persepsi", "input", "pemahaman"] as const;
const DIMENSION_LABELS: Record<(typeof DIMENSIONS)[number], string> = {
    pemrosesan: "Pemrosesan",
    persepsi: "Persepsi",
    input: "Input",
    pemahaman: "Pemahaman",
};
const CATEGORY_OPTIONS: Record<(typeof DIMENSIONS)[number], string[]> = {
    pemrosesan: ["aktif_kuat", "aktif_sedang", "aktif_lemah", "reflektif_kuat", "reflektif_sedang", "reflektif_lemah"],
    persepsi: ["sensing_kuat", "sensing_sedang", "sensing_lemah", "intuitif_kuat", "intuitif_sedang", "intuitif_lemah"],
    input: ["visual_kuat", "visual_sedang", "visual_lemah", "verbal_kuat", "verbal_sedang", "verbal_lemah"],
    pemahaman: ["sequential_kuat", "sequential_sedang", "sequential_lemah", "global_kuat", "global_sedang", "global_lemah"],
};
const CATEGORY_LABELS: Record<string, string> = {
    aktif_kuat: "Aktif Kuat",
    aktif_sedang: "Aktif Sedang",
    aktif_lemah: "Aktif Lemah",
    reflektif_kuat: "Reflektif Kuat",
    reflektif_sedang: "Reflektif Sedang",
    reflektif_lemah: "Reflektif Lemah",
    sensing_kuat: "Sensing Kuat",
    sensing_sedang: "Sensing Sedang",
    sensing_lemah: "Sensing Lemah",
    intuitif_kuat: "Intuitif Kuat",
    intuitif_sedang: "Intuitif Sedang",
    intuitif_lemah: "Intuitif Lemah",
    visual_kuat: "Visual Kuat",
    visual_sedang: "Visual Sedang",
    visual_lemah: "Visual Lemah",
    verbal_kuat: "Verbal Kuat",
    verbal_sedang: "Verbal Sedang",
    verbal_lemah: "Verbal Lemah",
    sequential_kuat: "Sequential Kuat",
    sequential_sedang: "Sequential Sedang",
    sequential_lemah: "Sequential Lemah",
    global_kuat: "Global Kuat",
    global_sedang: "Global Sedang",
    global_lemah: "Global Lemah",
};

// Interface untuk data siswa
interface StudentData {
    nama_lengkap: string;
    kelas: string;
    tes_terakhir: string;
    kategori: string;
}

// Fungsi untuk menentukan kelas warna berdasarkan kategori
const getLevelColor = (kategori: string): string => {
    if (!kategori) {
        console.warn("Kategori kosong atau tidak valid:", kategori);
        return "text-gray-600 bg-gray-50";
    }

    const normalizedKategori = kategori.toLowerCase();
    console.log("Kategori yang diproses:", kategori, "Normalized:", normalizedKategori);

    if (normalizedKategori.includes("kuat")) {
        return "text-secondary bg-blue-50 hover:bg-blue-100";
    }
    if (normalizedKategori.includes("sedang")) {
        return "text-green-700 bg-green-50 hover:bg-green-100";
    }
    if (normalizedKategori.includes("rendah")) {
        return "text-red-700 bg-red-50 hover:bg-red-100";
    }

    console.warn("Kategori tidak dikenali:", kategori);
    return "text-gray-600 bg-gray-50 hover:bg-gray-100";
};

// Fungsi untuk memformat tanggal
const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default function StudentTablePage() {
    const [filter, setFilter] = useState({ kelas: "", pencarian: "", kategori: "" });
    const [activeDimension, setActiveDimension] = useState<(typeof DIMENSIONS)[number]>("pemrosesan");
    const [studentsData, setStudentsData] = useState<StudentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

    // Fetch data siswa dengan debouncing
    const fetchDataSiswa = useCallback(
        async (signal?: AbortSignal) => {
            setIsLoading(true);
            setError(null);

            try {
                const params: {
                    kategori: string;
                    kelas?: string;
                    search?: string;
                    filter_kategori?: string;
                } = { kategori: activeDimension };

                if (filter.kelas) params.kelas = filter.kelas;
                if (filter.pencarian) params.search = filter.pencarian;
                if (filter.kategori && filter.kategori !== "all") params.filter_kategori = filter.kategori;

                const response = await api.get("/guru/siswa", {
                    params,
                    signal,
                });
                setStudentsData(response.data || []);
            } catch (err) {
                if (axios.isCancel(err)) return;

                let errorMessage = "Gagal memuat data siswa";
                if (axios.isAxiosError(err)) {
                    const status = err.response?.status;
                    if (status === 400) errorMessage = "Kategori tidak valid";
                    else if (status === 404) errorMessage = "Guru tidak ditemukan";
                    else errorMessage = err.response?.data?.detail || err.message || errorMessage;
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                }

                setError(errorMessage);
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        },
        [activeDimension, filter.kelas, filter.pencarian, filter.kategori]
    );

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            fetchDataSiswa(controller.signal);
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [fetchDataSiswa]);

    // Handler untuk perubahan filter
    const handleFilterChange = useCallback((key: keyof typeof filter, value: string) => {
        setFilter((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    }, []);

    // Paginate data siswa
    const totalItems = studentsData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return studentsData.slice(start, start + pageSize);
    }, [studentsData, currentPage, pageSize]);

    // Handler untuk navigasi halaman
    const goToPage = useCallback(
        (page: number) => {
            const validPage = Math.max(1, Math.min(page, totalPages));
            setCurrentPage(validPage);
        },
        [totalPages]
    );

    // Mendapatkan halaman yang terlihat untuk pagination
    const getVisiblePages = useCallback(() => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);

        if (currentPage <= 3) end = 4;
        else if (currentPage >= totalPages - 2) start = totalPages - 3;

        const pages = [1];
        if (start > 2) pages.push(-1);

        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push(-1);

        pages.push(totalPages);
        return pages;
    }, [totalPages, currentPage]);

    return (
        <TooltipProvider>
            <div className="min-h-screen text-gray-800">
                <div className="max-w-7xl mx-auto">
                    <Card className="bg-secondary shadow-md rounded-xl border-none mb-6 sm:mb-8">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                                <div className="space-y-2 sm:space-y-3">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Manajemen Siswa & Gaya Belajar</h1>
                                    <p className="text-sm sm:text-base text-gray-300 max-w-2xl min-w-0 break-words">Tinjau hasil gaya belajar siswa untuk mendukung strategi pengajaran yang lebih efektif.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-lg mb-6 sm:mb-8">
                            <p className="text-sm sm:text-base">{error}</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchDataSiswa()}
                                className="mt-2 w-full text-red-700 hover:bg-red-100 rounded-full text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] active:scale-95"
                                aria-label="Coba lagi memuat data"
                            >
                                Coba Lagi
                            </Button>
                        </div>
                    )}

                    <Card className="border-none bg-white shadow-md rounded-xl">
                        <CardHeader className="pb-3 sm:pb-4">
                            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-secondary min-w-0 break-words">Data Siswa</CardTitle>
                                <div className="flex flex-row flex-wrap gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0">
                                    {DIMENSIONS.map((dimension) => (
                                        <Button
                                            key={dimension}
                                            variant={activeDimension === dimension ? "default" : "outline"}
                                            onClick={() => {
                                                setActiveDimension(dimension);
                                                setFilter((prev) => ({ ...prev, kategori: "" }));
                                            }}
                                            className={`whitespace-nowrap rounded-full px-3 py-2 min-h-[36px] sm:min-h-[40px] text-xs sm:text-sm ${
                                                activeDimension === dimension ? "bg-secondary text-white hover:bg-blue-700" : "border-blue-200 text-secondary hover:bg-blue-50 hover:text-blue-800"
                                            } transition-all duration-200 active:scale-95`}
                                            aria-label={`Pilih dimensi ${DIMENSION_LABELS[dimension]}`}
                                        >
                                            {DIMENSION_LABELS[dimension]}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="flex flex-row flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
                                <div className="relative max-w-md flex-1 min-w-[150px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                    <Input
                                        placeholder="Cari siswa (nama, kelas)..."
                                        value={filter.pencarian}
                                        onChange={(e) => handleFilterChange("pencarian", e.target.value)}
                                        className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-xs sm:text-sm"
                                        aria-label="Cari siswa berdasarkan nama atau kelas"
                                    />
                                </div>
                                <select
                                    value={filter.kategori}
                                    onChange={(e) => handleFilterChange("kategori", e.target.value)}
                                    className="min-w-[150px] flex-1 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-2 bg-white text-gray-800 outline outline-1 outline-gray-400 outline-offset-0 text-xs sm:text-sm"
                                    aria-label="Pilih kategori gaya belajar"
                                >
                                    <option value="all" className="break-words">
                                        Semua Kategori
                                    </option>
                                    {CATEGORY_OPTIONS[activeDimension].map((kategori) => (
                                        <option key={kategori} value={kategori} className="text-gray-800 break-words">
                                            {CATEGORY_LABELS[kategori]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="border-none overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table className="min-w-[600px] table-fixed">
                                        <TableHeader className="bg-secondary">
                                            <TableRow>
                                                <TableHead className="text-white w-12 text-center font-semibold">No</TableHead>
                                                <TableHead className="text-white w-[30%] font-semibold">Nama</TableHead>
                                                <TableHead className="text-white w-[20%] font-semibold">Kelas</TableHead>
                                                <TableHead className="text-white text-center w-[25%] font-semibold">Tes Terakhir</TableHead>
                                                <TableHead className="text-white text-center w-[25%] font-semibold">Kategori</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                Array(5)
                                                    .fill(0)
                                                    .map((_, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell colSpan={5}>
                                                                <Skeleton className="h-10 sm:h-12 w-full rounded-lg" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                            ) : paginatedStudents.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-6 sm:py-8 text-gray-600 text-sm sm:text-base">
                                                        {filter.pencarian || filter.kelas || filter.kategori ? "Tidak ada siswa yang cocok dengan pencarian" : "Tidak ada data siswa yang tersedia"}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedStudents.map((siswa, index) => (
                                                    <TableRow key={`${siswa.nama_lengkap}-${index}`} className="hover:bg-blue-50/50 transition-all duration-200">
                                                        <TableCell className="text-center text-xs sm:text-sm">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                                        <TableCell className="font-medium text-gray-800 text-xs sm:text-sm min-w-0 break-words">{siswa.nama_lengkap}</TableCell>
                                                        <TableCell className="text-gray-600 text-xs sm:text-sm min-w-0 break-words">{siswa.kelas}</TableCell>
                                                        <TableCell className="text-center text-gray-600 text-xs sm:text-sm">{formatDate(siswa.tes_terakhir)}</TableCell>
                                                        <TableCell className={`text-center px-2 py-1 rounded text-xs sm:text-sm min-w-0 break-words ${getLevelColor(siswa.kategori)}`}>
                                                            {CATEGORY_LABELS[siswa.kategori] || siswa.kategori || "-"}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {totalItems > 0 && (
                                <div className="flex flex-row flex-wrap items-center justify-between gap-2 sm:gap-4 mt-4 sm:mt-6">
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                        <span>Baris per halaman:</span>
                                        <select
                                            value={pageSize.toString()}
                                            onChange={(e) => {
                                                setPageSize(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="w-16 sm:w-20 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-2 bg-white text-gray-800 outline outline-1 outline-gray-400 outline-offset-0 text-xs sm:text-sm"
                                            aria-label="Pilih jumlah baris per halaman"
                                        >
                                            {PAGE_SIZE_OPTIONS.map((size) => (
                                                <option key={size} value={size} className="text-gray-800">
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="h-8 w-8 sm:h-10 sm:w-10 p-0 border-gray-300 text-secondary hover:bg-blue-50 hover:text-blue-800 disabled:text-gray-400 disabled:bg-gray-50 rounded-full active:scale-95"
                                            aria-label="Halaman sebelumnya"
                                        >
                                            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </Button>

                                        <div className="flex gap-1">
                                            {getVisiblePages().map((page, i) =>
                                                page === -1 ? (
                                                    <Button key={`ellipsis-${i}`} variant="ghost" className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-gray-400" disabled>
                                                        ...
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        onClick={() => goToPage(page)}
                                                        className={`h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full text-xs sm:text-sm ${
                                                            currentPage === page ? "bg-secondary text-white hover:bg-blue-700" : "border-gray-300 text-secondary hover:bg-blue-50 hover:text-blue-800"
                                                        } active:scale-95`}
                                                        aria-label={`Halaman ${page}`}
                                                    >
                                                        {page}
                                                    </Button>
                                                )
                                            )}
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="h-8 w-8 sm:h-10 sm:w-10 p-0 border-gray-300 text-secondary hover:bg-blue-50 hover:text-blue-800 disabled:text-gray-400 disabled:bg-gray-50 rounded-full active:scale-95"
                                            aria-label="Halaman berikutnya"
                                        >
                                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </Button>
                                    </div>

                                    <div className="text-xs sm:text-sm text-gray-600">{`${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalItems)} dari ${totalItems}`}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TooltipProvider>
    );
}
