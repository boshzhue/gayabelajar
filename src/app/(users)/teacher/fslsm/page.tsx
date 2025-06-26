"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, BarChart2, Layout, Brain, ChevronRight, ClipboardCheck, ArrowUp } from "lucide-react";

function FSLSMArticle() {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen text-gray-800">
            <Head>
                <title>Panduan Gaya Belajar FSLSM untuk Guru</title>
                <meta name="description" content="Panduan praktis FSLSM untuk membantu guru memahami dan mengakomodasi gaya belajar siswa dengan mudah." />
            </Head>

            <div className="max-w-7xl mx-auto py-2">
                {/* Header */}
                <header className="mb-10 text-center bg-secondary text-white p-8 rounded-xl shadow-lg">
                    <h1 className="text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center gap-2">
                        <BookOpen size={32} />
                        Panduan Gaya Belajar FSLSM untuk Guru
                    </h1>
                    <p className="text-base md:text-lg opacity-90">Cara mudah memahami dan mendukung gaya belajar siswa di kelas</p>
                </header>

                {/* Pengantar */}
                <section className="mb-6 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                        <BookOpen className="text-blue-600" size={24} />
                        Apa Itu FSLSM?
                    </h2>
                    <p className="mb-4 text-sm">
                        Felder-Silverman Learning Style Model (FSLSM) adalah alat untuk memahami cara siswa belajar. Setiap siswa memiliki preferensi gaya belajar yang bisa <strong>kuat</strong>, <strong>sedang</strong>, atau{" "}
                        <strong>lemah</strong> dalam empat dimensi: Proses, Persepsi, Input, dan Pemahaman.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg border-blue-500">
                        <h3 className="font-bold text-blue-700 mb-2">Mengapa Penting?</h3>
                        <p className="text-sm">Menyesuaikan pengajaran dengan gaya belajar siswa dapat meningkatkan keterlibatan dan hasil belajar. FSLSM membantu guru merancang aktivitas yang cocok untuk setiap siswa.</p>
                    </div>
                </section>

                {/* Preferensi Kuat, Sedang, Lemah */}
                <section className="mb-6 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-2">
                        <ClipboardCheck className="text-blue-600" size={24} />
                        Memahami Preferensi Gaya Belajar
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <h3 className="font-bold text-red-700 mb-2">Kuat</h3>
                            <p className="text-sm">Siswa sangat menyukai satu gaya belajar dan mungkin kesulitan dengan gaya berlawanan.</p>
                            <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                                <li>Fokus pada aktivitas yang sesuai.</li>
                                <li>Perkenalkan gaya lain secara bertahap.</li>
                            </ul>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <h3 className="font-bold text-yellow-700 mb-2">Sedang</h3>
                            <p className="text-sm">Siswa cenderung ke satu gaya tetapi masih bisa beradaptasi dengan gaya lain.</p>
                            <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                                <li>Gunakan kombinasi aktivitas.</li>
                                <li>Kembangkan kedua gaya seimbang.</li>
                            </ul>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h3 className="font-bold text-green-700 mb-2">Lemah</h3>
                            <p className="text-sm">Siswa tidak memiliki preferensi kuat dan mudah beradaptasi dengan berbagai gaya.</p>
                            <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                                <li>Berikan berbagai aktivitas.</li>
                                <li>Bantu temukan gaya efektif.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Empat Dimensi */}
                <section className="mb-6 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-2">
                        <Users className="text-blue-600" size={24} />
                        Empat Dimensi Gaya Belajar
                    </h2>
                    <div className="space-y-6">
                        {/* Dimensi 1: Proses */}
                        <div className="border rounded-lg p-5 bg-blue-50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <Users className="text-blue-600" size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-blue-700">Proses: Aktif vs Reflektif</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-blue-600 mb-2">Aktif</h4>
                                    <p className="text-sm mb-2">
                                        <strong>Definisi:</strong> Gaya belajar yang melibatkan aktivitas langsung, seperti diskusi atau praktik, untuk memproses informasi.
                                    </p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>
                                            <strong>Mengenali:</strong> Suka kerja kelompok, berbicara di kelas.
                                        </li>
                                        <li>
                                            <strong>Aktivitas:</strong> Diskusi kelompok, simulasi, role-play.
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-blue-600 mb-2">Reflektif</h4>
                                    <p className="text-sm mb-2">
                                        <strong>Definisi:</strong> Gaya belajar yang mengandalkan pemikiran dan analisis mandiri untuk memahami informasi.
                                    </p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>
                                            <strong>Mengenali:</strong> Lebih pendiam, suka menulis ide.
                                        </li>
                                        <li>
                                            <strong>Aktivitas:</strong> Jurnal refleksi, analisis kasus, tugas individu.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Dimensi 2: Persepsi */}
                        <div className="border rounded-lg p-5 bg-green-50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-green-100 p-2 rounded-full">
                                    <BarChart2 className="text-green-600" size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-green-700">Persepsi: Sensorik vs Intuitif</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-green-600 mb-2">Sensorik</h4>
                                    <p className="text-sm mb-2">
                                        <strong>Definisi:</strong> Gaya belajar yang berfokus pada fakta konkret, data, dan aplikasi praktis.
                                    </p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>
                                            <strong>Mengenali:</strong> Ingin tahu "bagaimana" dan "apa".
                                        </li>
                                        <li>
                                            <strong>Aktivitas:</strong> Eksperimen, studi kasus, demonstrasi.
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-green-600 mb-2">Intuitif</h4>
                                    <p className="text-sm mb-2">
                                        <strong>Definisi:</strong> Gaya belajar yang menyukai konsep abstrak, teori, dan ide-ide kreatif.
                                    </p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>
                                            <strong>Mengenali:</strong> Suka bertanya "mengapa", kreatif.
                                        </li>
                                        <li>
                                            <strong>Aktivitas:</strong> Pemecahan masalah, proyek kreatif, diskusi konseptual.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Dimensi 3: Input */}
                        <div className="border rounded-lg p-5 bg-amber-50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-amber-100 p-2 rounded-full">
                                    <Layout className="text-amber-600" size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-amber-700">Input: Visual vs Verbal</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-amber-600 mb-2">Visual</h4>
                                    <p className="text-sm mb-2">
                                        <strong>Definisi:</strong> Gaya belajar yang mengandalkan penglihatan, seperti gambar, diagram, dan video, untuk memahami informasi.
                                    </p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>
                                            <strong>Mengenali:</strong> Suka melihat grafik, peta.
                                        </li>
                                        <li>
                                            <strong>Aktivitas:</strong> Infografis, diagram alur, video pembelajaran.
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-amber-600 mb-2">Verbal</h4>
                                    <p className="text-sm mb-2">
                                        <strong>Definisi:</strong> Gaya belajar yang mengandalkan kata-kata lisan atau tertulis untuk memproses informasi.
                                    </p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>
                                            <strong>Mengenali:</strong> Suka mendengar, menulis catatan.
                                        </li>
                                        <li>
                                            <strong>Aktivitas:</strong> Ceramah, diskusi, tugas menulis.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Dimensi 4: Pemahaman */}
                        <div className="border rounded-lg p-5 bg-purple-50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-purple-100 p-2 rounded-full">
                                    <Brain className="text-purple-600" size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-purple-700">Pemahaman: Sequensial vs Global</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-purple-600 mb-2">Sequensial</h4>
                                    <p className="text-sm mb-2">
                                        <strong>Definisi:</strong> Gaya belajar yang memahami informasi secara bertahap, mengikuti langkah-langkah logis.
                                    </p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>
                                            <strong>Mengenali:</strong> Suka urutan jelas, petunjuk langkah.
                                        </li>
                                        <li>
                                            <strong>Aktivitas:</strong> Modul bertahap, latihan berurutan, panduan langkah.
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-purple-600 mb-2">Global</h4>
                                    <p className="text-sm mb-2">
                                        <strong>Definisi:</strong> Gaya belajar yang memahami informasi secara holistik, melihat gambaran besar dan hubungan antar konsep.
                                    </p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>
                                            <strong>Mengenali:</strong> Suka hubungan antar konsep, ide besar.
                                        </li>
                                        <li>
                                            <strong>Aktivitas:</strong> Peta konsep, proyek tematik, studi kasus.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Strategi Pengajaran */}
                <section className="mb-12 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-2">
                        <ClipboardCheck className="text-blue-600" size={24} />
                        Strategi Pengajaran Berdiferensiasi
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                            <h3 className="font-bold text-blue-700 mb-2">Tips untuk Guru</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="text-blue-600 mt-1 flex-shrink-0" size={16} />
                                    <span>Amati siswa saat belajar untuk mengenali preferensi mereka (contoh: apakah mereka lebih suka diskusi atau menulis).</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="text-blue-600 mt-1 flex-shrink-0" size={16} />
                                    <span>Kombinasikan berbagai aktivitas dalam satu pelajaran untuk menjangkau semua gaya belajar.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="text-blue-600 mt-1 flex-shrink-0" size={16} />
                                    <span>Berikan pilihan tugas (misalnya, presentasi atau laporan tertulis) untuk mendukung preferensi siswa.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Back to Top Button */}
                {showBackToTop && (
                    <Button className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Kembali ke atas">
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    );
}

export default FSLSMArticle;
