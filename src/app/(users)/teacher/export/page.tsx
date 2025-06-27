"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import axios from "axios";

// Konstanta untuk konfigurasi dan styling
const SEARCH_DEBOUNCE_MS = 300;
const DIMENSIONS = [
    { id: "pemrosesan", label: "Pemrosesan" },
    { id: "persepsi", label: "Persepsi" },
    { id: "input", label: "Input" },
    { id: "pemahaman", label: "Pemahaman" },
] as const;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Interface untuk data siswa
interface Student {
    nama_lengkap: string;
    kelas: string;
    sekolah: string;
    kategori_pemrosesan: string;
    kategori_persepsi: string;
    kategori_input: string;
    kategori_pemahaman: string;
}

// Fungsi untuk menentukan kelas warna berdasarkan hasil
const getColorClass = (result: string): string => {
    if (!result) return "text-gray-600 bg-gray-50";

    const level = result.split(" ").pop()?.toLowerCase();
    switch (level) {
        case "kuat":
            return "text-secondary bg-blue-50 hover:bg-blue-100";
        case "sedang":
            return "text-green-700 bg-green-50 hover:bg-green-100";
        case "rendah":
        case "lemah":
            return "text-red-700 bg-red-50 hover:bg-red-100";
        default:
            return "text-gray-600 bg-gray-50 hover:bg-gray-100";
    }
};

// Komponen untuk tombol ekspor CSV
const ExportButton = ({ students }: { students: Student[] }) => {
    const csvData = useMemo(
        () =>
            students.map((student) => ({
                Nama: student.nama_lengkap,
                Kelas: student.kelas,
                Sekolah: student.sekolah,
                Pemrosesan: student.kategori_pemrosesan,
                Persepsi: student.kategori_persepsi,
                Input: student.kategori_input,
                Pemahaman: student.kategori_pemahaman,
            })),
        [students]
    );

    const CSVLink = dynamic(() => import("react-csv").then((mod) => mod.CSVLink), {
        ssr: false,
        loading: () => (
            <Button disabled className="min-h-[36px] sm:min-h-[40px] bg-gray-100 text-gray-400 rounded-full text-xs sm:text-sm">
                Menyiapkan ekspor...
            </Button>
        ),
    });

    return (
        <CSVLink data={csvData} filename={`data-siswa-${new Date().toISOString().slice(0, 10)}.csv`} className="inline-flex">
            <Button variant="default" className="min-h-[36px] sm:min-h-[40px] bg-secondary text-white hover:bg-blue-700 rounded-full transition-all duration-200 active:scale-95 text-xs sm:text-sm">
                Ekspor CSV
            </Button>
        </CSVLink>
    );
};

export default function StudentTablePage() {
    const [search, setSearch] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

    // Fetch data siswa dengan debouncing
    const fetchStudents = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            setError("");

            try {
                const response = await axios.get("/guru/siswa-export-simple", {
                    params: { search },
                    signal,
                    baseURL: process.env.NEXT_PUBLIC_API_URL,
                    withCredentials: true,
                });
                setStudents(response.data || []);
                setCurrentPage(1);
            } catch (err) {
                if (axios.isCancel(err)) return;

                let errorMessage = "Gagal memuat data siswa";
                if (axios.isAxiosError(err)) {
                    errorMessage = err.response?.data?.message || err.message || errorMessage;
                    if (err.response?.status === 401) {
                        window.location.href = "/login";
                        return;
                    }
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                }

                setError(errorMessage);
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        },
        [search]
    );

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(() => fetchStudents(controller.signal), SEARCH_DEBOUNCE_MS);
        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [fetchStudents]);

    // Paginate data siswa
    const totalItems = students.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return students.slice(start, start + pageSize);
    }, [students, currentPage, pageSize]);

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
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Daftar Siswa & Gaya Belajar</h1>
                                    <p className="text-sm sm:text-base text-white max-w-2xl">Tinjau hasil gaya belajar siswa untuk mendukung strategi pengajaran yang lebih efektif.</p>
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
                                onClick={() => fetchStudents()}
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
                                <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-secondary">Data Siswa</CardTitle>
                                <div className="flex flex-row flex-wrap gap-2 sm:gap-3">
                                    <ExportButton students={students} />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="relative mb-4 sm:mb-6 max-w-md flex-1 min-w-[150px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                <Input
                                    placeholder="Cari siswa (nama, kelas)"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-xs sm:text-sm"
                                    aria-label="Cari siswa berdasarkan nama, kelas, atau sekolah"
                                />
                            </div>

                            <div className="w-full max-w-full overflow-x-auto">
                                <Table className="w-full">
                                    <TableHeader className="bg-secondary sticky top-0 z-10">
                                        <TableRow>
                                            <TableHead className="text-white text-center w-12 sm:w-16 font-semibold px-2 py-2 sm:py-3">No</TableHead>
                                            <TableHead className="text-white w-[25%] sm:w-[20%] font-semibold px-2 py-2 sm:py-3">Nama</TableHead>
                                            <TableHead className="text-white w-[20%] sm:w-[15%] font-semibold px-2 py-2 sm:py-3">Kelas</TableHead>
                                            <TableHead className="text-white w-[25%] sm:w-[20%] font-semibold px-2 py-2 sm:py-3">Sekolah</TableHead>
                                            {DIMENSIONS.map((dim) => (
                                                <TableHead key={dim.id} className="text-white text-center font-semibold px-2 py-2 sm:py-3 min-w-[80px]">
                                                    {dim.label}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            Array(5)
                                                .fill(0)
                                                .map((_, i) => (
                                                    <TableRow key={`skeleton-${i}`}>
                                                        <TableCell colSpan={7}>
                                                            <Skeleton className="h-10 sm:h-12 w-full rounded-lg" />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        ) : paginatedStudents.length > 0 ? (
                                            paginatedStudents.map((student, index) => (
                                                <TableRow
                                                    key={student.nama_lengkap}
                                                    className="hover:bg-blue-50/50 transition-all duration-200"
                                                    aria-label={`Data siswa: ${student.nama_lengkap}, kelas ${student.kelas || "-"}, sekolah ${student.sekolah}, Pemrosesan: ${student.kategori_pemrosesan || "-"}, Persepsi: ${
                                                        student.kategori_persepsi || "-"
                                                    }, Input: ${student.kategori_input || "-"}, Pemahaman: ${student.kategori_pemahaman || "-"}`}
                                                >
                                                    <TableCell className="text-center text-xs sm:text-sm px-2 py-2 sm:py-3">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                                    <TableCell className="font-medium text-gray-800 text-xs sm:text-sm px-2 py-2 sm:py-3">{student.nama_lengkap}</TableCell>
                                                    <TableCell className="text-gray-600 text-xs sm:text-sm px-2 py-2 sm:py-3">{student.kelas || "-"}</TableCell>
                                                    <TableCell className="text-gray-600 text-xs sm:text-sm px-2 py-2 sm:py-3">{student.sekolah}</TableCell>
                                                    {DIMENSIONS.map((dim) => (
                                                        <TableCell key={dim.id} className={`text-center px-2 py-2 sm:py-3 rounded text-xs sm:text-sm ${getColorClass(student[`kategori_${dim.id}` as keyof Student])}`}>
                                                            {student[`kategori_${dim.id}` as keyof Student] || "-"}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-6 sm:py-8 text-gray-600 text-sm">
                                                    {search ? "Tidak ada siswa yang cocok" : "Tidak ada data siswa"}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
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
