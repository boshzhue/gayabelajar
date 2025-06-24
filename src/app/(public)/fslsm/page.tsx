"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUp } from "lucide-react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { memo } from "react";

function FSLSMArticle() {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const tableOfContents = [
        { id: "history", title: "Sejarah dan Latar Belakang FSLSM" },
        { id: "evolution", title: "Evolusi dan Landasan FSLSM" },
        { id: "dimensions", title: "Empat Dimensi FSLSM" },
        { id: "implementation", title: "Implementasi dan Kontroversi ILS" },
        { id: "technology", title: "FSLSM di Era Teknologi Pendidikan" },
        { id: "challenges", title: "Tantangan dan Perspektif Masa Depan" },
        { id: "conclusion", title: "Kesimpulan" },
    ];

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-white text-gray-800">
                <Head>
                    <title>Felder-Silverman Learning Style Model (FSLSM): Analisis Mendalam | Education Insights</title>
                    <meta name="description" content="Analisis komprehensif Model Gaya Belajar Felder-Silverman dan implementasinya dalam pendidikan modern" />
                    <meta name="keywords" content="FSLSM, gaya belajar, pendidikan, pedagogi, Felder, Silverman, metode pengajaran" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                <Navbar />

                <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 pt-28">
                    {/* Header */}
                    <header className="mb-12 border-b-4 border-primary pb-8">
                        <div className="relative mb-6">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary text-center px-4">Felder-Silverman Learning Style Model (FSLSM)</h1>
                        </div>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center">Analisis mendalam tentang model FSLSM, sejarah, empat dimensinya, implementasi, dan kritik dalam konteks pendidikan modern.</p>
                    </header>

                    {/* Table of Contents */}
                    <aside className="sticky top-20 hidden lg:block w-64 float-left mr-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-xl font-semibold text-primary mb-4">Daftar Isi</h2>
                        <ul className="space-y-2">
                            {tableOfContents.map((item) => (
                                <li key={item.id}>
                                    <a href={`#${item.id}`} className="text-gray-600 hover:text-primary transition-colors" aria-label={`Navigasi ke ${item.title}`}>
                                        {item.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <article className="lg:ml-80">
                        {/* Section 1: Sejarah dan Latar Belakang */}
                        <section id="history" className="mb-16 scroll-mt-20">
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">Sejarah dan Latar Belakang FSLSM</h2>
                            <p className="text-gray-800 leading-relaxed mb-4 text-base sm:text-lg">
                                Model Gaya Belajar Felder-Silverman (FSLSM) lahir dari upaya <strong className="font-semibold">Richard M. Felder</strong>, seorang profesor teknik kimia, dan{" "}
                                <strong className="font-semibold">Linda K. Silverman</strong>, seorang psikolog pendidikan, pada akhir 1980-an. Mereka berkolaborasi untuk mengatasi tantangan dalam pengajaran bidang STEM.
                            </p>
                            <p className="text-gray-800 leading-relaxed mb-4 text-base sm:text-lg">
                                FSLSM mengintegrasikan teori pembelajaran seperti model Kolb dan{" "}
                                <Tooltip>
                                    <TooltipTrigger className="underline decoration-dotted">Myers-Briggs Type Indicator (MBTI)</TooltipTrigger>
                                    <TooltipContent>Alat untuk mengukur preferensi psikologis individu berdasarkan teori Carl Jung.</TooltipContent>
                                </Tooltip>{" "}
                                untuk menciptakan kerangka kerja yang aplikatif.
                            </p>
                            <div className="bg-white p-6 rounded-xl border border-primary/20 my-6">
                                <h3 className="text-lg font-semibold text-primary mb-2">Did You Know?</h3>
                                <p className="text-gray-800">
                                    Pada tahun 1991, Felder dan Barbara A. Soloman mengembangkan <strong>Index of Learning Styles (ILS)</strong>, kuesioner yang kini digunakan di seluruh dunia untuk mengidentifikasi gaya belajar.
                                </p>
                            </div>
                        </section>

                        {/* Section 2: Evolusi dan Landasan */}
                        <section id="evolution" className="mb-16 scroll-mt-20">
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">Evolusi dan Landasan FSLSM</h2>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Latar Belakang Filosofis</h3>
                            <p className="text-gray-800 leading-relaxed mb-4 text-base sm:text-lg">FSLSM dipengaruhi oleh teori seperti:</p>
                            <ul className="list-disc pl-6 mb-6 text-gray-800 leading-relaxed text-base sm:text-lg">
                                <li>
                                    <strong>Experiential Learning Theory</strong> (David Kolb, 1984)
                                </li>
                                <li>
                                    <strong>Myers-Briggs Type Indicator (MBTI)</strong> untuk preferensi kognitif
                                </li>
                                <li>Penelitian neurosains tentang pemrosesan visual vs. verbal</li>
                            </ul>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Pengembangan ILS</h3>
                            <p className="text-gray-800 leading-relaxed text-base sm:text-lg">
                                ILS, dikembangkan pada 1991, terdiri dari 44 pertanyaan yang mengukur preferensi belajar di empat dimensi FSLSM. Validasi pada 2005 menunjukkan reliabilitas yang kuat.
                            </p>
                        </section>

                        {/* Section 3: Empat Dimensi FSLSM */}
                        <section id="dimensions" className="mb-16 scroll-mt-20">
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">Empat Dimensi FSLSM</h2>
                            <Accordion type="single" collapsible className="space-y-4">
                                {[
                                    {
                                        title: "Sensing (S) vs. Intuitive (N)",
                                        description: "Menggambarkan preferensi antara belajar melalui informasi konkret (Sensing) atau teori dan abstraksi (Intuitive).",
                                        table: [
                                            {
                                                characteristic: "Fokus",
                                                sensing: "Fakta, data, aplikasi praktis",
                                                intuitive: "Teori, pola, interpretasi kreatif",
                                            },
                                            {
                                                characteristic: "Cara Belajar",
                                                sensing: "Melalui detail dan contoh nyata",
                                                intuitive: "Melalui konsep, inovasi, dan kemungkinan",
                                            },
                                            {
                                                characteristic: "Tipe Tugas Disukai",
                                                sensing: "Pekerjaan praktis, pemecahan masalah langkah demi langkah",
                                                intuitive: "Proyek inovatif, pemikiran 'out-of-the-box'",
                                            },
                                        ],
                                        implications: ["Sensing: Gunakan studi kasus, demonstrasi praktis, dan latihan langkah demi langkah.", "Intuitive: Dorong brainstorming, diskusi teoretis, dan eksplorasi konsep abstrak."],
                                    },
                                    {
                                        title: "Visual (V) vs. Verbal (R)",
                                        description: "Berfokus pada cara informasi diproses: melalui gambar dan visualisasi (Visual) atau kata-kata (Verbal).",
                                        table: [
                                            {
                                                characteristic: "Cara Informasi Diterima",
                                                sensing: "Grafik, diagram, video, demonstrasi",
                                                intuitive: "Penjelasan tertulis, diskusi, kuliah",
                                            },
                                            {
                                                characteristic: "Preferensi Belajar",
                                                sensing: "Melihat bagaimana sesuatu bekerja",
                                                intuitive: "Mendengarkan atau membaca penjelasan",
                                            },
                                            {
                                                characteristic: "Catatan",
                                                sensing: "Menggunakan gambar, simbol, dan peta konsep",
                                                intuitive: "Menulis catatan detail, mengulang informasi",
                                            },
                                        ],
                                        implications: ["Visual: Gunakan alat bantu visual, infografis, dan presentasi multimedia.", "Verbal: Fasilitasi diskusi kelompok, berikan penjelasan yang jelas, dan sarankan materi bacaan tambahan."],
                                    },
                                    {
                                        title: "Active (A) vs. Reflective (R)",
                                        description: "Menggambarkan preferensi antara belajar dengan mencoba (Active) atau merenungkan informasi (Reflective).",
                                        table: [
                                            {
                                                characteristic: "Cara Memproses Informasi",
                                                sensing: "Melalui diskusi, mencoba langsung, bekerja dalam kelompok",
                                                intuitive: "Melalui pemikiran internal, menulis jurnal, merenungkan ide",
                                            },
                                            {
                                                characteristic: "Preferensi Aktivitas",
                                                sensing: "Diskusi kelompok, studi kasus, simulasi",
                                                intuitive: "Esai reflektif, tugas individual, berpikir sebelum bertindak",
                                            },
                                            {
                                                characteristic: "Pemahaman",
                                                sensing: "Lebih baik saat terlibat aktif",
                                                intuitive: "Lebih baik setelah waktu untuk merenung",
                                            },
                                        ],
                                        implications: ["Active: Libatkan dalam diskusi, aktivitas kelompok, dan proyek langsung.", "Reflective: Berikan waktu untuk refleksi, penugasan esai, dan aktivitas penjurnalan."],
                                    },
                                    {
                                        title: "Sequential (S) vs. Global (G)",
                                        description: "Menjelaskan cara memahami informasi: secara bertahap (Sequential) atau holistik (Global).",
                                        table: [
                                            {
                                                characteristic: "Cara Mempelajari",
                                                sensing: "Langkah demi langkah, mengikuti urutan logis",
                                                intuitive: "Melihat gambaran besar terlebih dahulu, lalu detail",
                                            },
                                            {
                                                characteristic: "Pemahaman Materi",
                                                sensing: "Memahami bagian-bagian sebelum keseluruhan",
                                                intuitive: "Melihat koneksi dan hubungan antar konsep",
                                            },
                                            {
                                                characteristic: "Pendekatan",
                                                sensing: "Terorganisir, sistematis",
                                                intuitive: "Intuitif, melompat antar ide",
                                            },
                                        ],
                                        implications: [
                                            "Sequential: Sajikan materi secara terstruktur, dengan garis besar dan langkah-langkah yang jelas.",
                                            "Global: Mulailah dengan gambaran besar, tunjukkan relevansi, dan bantu mereka membuat koneksi.",
                                        ],
                                    },
                                ].map((dimension, index) => (
                                    <AccordionItem key={index} value={`dimension-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-200">
                                        <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-primary hover:bg-white transition-colors">{dimension.title}</AccordionTrigger>
                                        <AccordionContent className="px-6 py-4 text-gray-800">
                                            <p className="mb-4 text-base sm:text-lg">{dimension.description}</p>
                                            <div className="block md:hidden space-y-4">
                                                {dimension.table.map((row, rowIndex) => (
                                                    <div key={rowIndex} className="p-4 bg-white rounded-lg border border-primary/20">
                                                        <h4 className="font-medium text-gray-800">{row.characteristic}</h4>
                                                        <p className="text-gray-600 mt-1">
                                                            <strong>Sensing:</strong> {row.sensing}
                                                        </p>
                                                        <p className="text-gray-600 mt-1">
                                                            <strong>Intuitive:</strong> {row.intuitive}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="hidden md:block overflow-x-auto mb-4">
                                                <table className="w-full bg-white border border-gray-200 rounded-lg" role="table" aria-label={`Perbandingan ${dimension.title}`}>
                                                    <thead className="bg-white">
                                                        <tr>
                                                            <th className="p-4 text-left font-semibold text-gray-800" scope="col">
                                                                Karakteristik
                                                            </th>
                                                            <th className="p-4 text-left font-semibold text-gray-800" scope="col">
                                                                Sensing
                                                            </th>
                                                            <th className="p-4 text-left font-semibold text-gray-800" scope="col">
                                                                Intuitive
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {dimension.table.map((row, rowIndex) => (
                                                            <tr key={rowIndex} className="border-t hover:bg-white transition-colors">
                                                                <td className="p-4 font-medium text-gray-800">{row.characteristic}</td>
                                                                <td className="p-4 text-gray-800">{row.sensing}</td>
                                                                <td className="p-4 text-gray-800">{row.intuitive}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg border border-primary/20">
                                                <h4 className="font-semibold text-primary mb-2">Implikasi Pedagogis:</h4>
                                                <ul className="list-disc pl-6 text-gray-800 text-base sm:text-lg">
                                                    {dimension.implications.map((item, idx) => (
                                                        <li key={idx}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </section>

                        {/* Section 4: Implementasi dan Kontroversi */}
                        <section id="implementation" className="mb-16 scroll-mt-20">
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">Implementasi dan Kontroversi ILS</h2>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Aplikasi dalam Pendidikan</h3>
                            <ul className="list-disc pl-6 mb-6 text-gray-800 leading-relaxed text-base sm:text-lg">
                                <li>Membentuk kelompok belajar berdasarkan gaya belajar heterogen/homogen.</li>
                                <li>Mengembangkan materi yang mengakomodasi preferensi visual, verbal, aktif, dan reflektif.</li>
                                <li>Memberikan umpan balik kepada siswa tentang strategi belajar yang sesuai.</li>
                            </ul>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Kritik dan Validitas</h3>
                            <p className="text-gray-800 leading-relaxed text-base sm:text-lg">
                                Beberapa penelitian, seperti Pashler et al. (2008), mempertanyakan dampak signifikan penyesuaian pengajaran berdasarkan gaya belajar terhadap kinerja siswa.
                            </p>
                        </section>

                        {/* Section 5: Teknologi Pendidikan */}
                        <section id="technology" className="mb-16 scroll-mt-20">
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">FSLSM di Era Teknologi Pendidikan</h2>
                            <p className="text-gray-800 leading-relaxed mb-4 text-base sm:text-lg">
                                Teknologi seperti AI dan pembelajaran adaptif memungkinkan personalisasi konten berdasarkan preferensi FSLSM, seperti menyediakan infografis untuk pembelajar visual atau forum diskusi untuk pembelajar
                                reflektif.
                            </p>
                            <div className="bg-white p-6 rounded-xl border border-primary/20 my-6">
                                <h3 className="text-lg font-semibold text-primary mb-2">Potensi Masa Depan</h3>
                                <p className="text-gray-800">Analisis big data dari platform pembelajaran dapat mengungkap korelasi antara gaya belajar dan hasil belajar, mendorong pengembangan konten yang lebih efektif.</p>
                            </div>
                        </section>

                        {/* Section 6: Tantangan dan Masa Depan */}
                        <section id="challenges" className="mb-16 scroll-mt-20">
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">Tantangan dan Perspektif Masa Depan</h2>
                            <p className="text-gray-800 leading-relaxed mb-4 text-base sm:text-lg">
                                FSLSM perlu beradaptasi dengan pendekatan yang lebih fleksibel, mengakui gaya belajar sebagai spektrum dan mengintegrasikan faktor seperti motivasi dan konteks belajar.
                            </p>
                        </section>

                        {/* Section 7: Kesimpulan */}
                        <section id="conclusion" className="mb-16 scroll-mt-20">
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">Kesimpulan</h2>
                            <p className="text-gray-800 leading-relaxed text-base sm:text-lg">
                                FSLSM telah meningkatkan kesadaran akan keragaman cara belajar. Dengan teknologi dan pendekatan inklusif, model ini dapat terus relevan dalam menciptakan lingkungan belajar yang personal dan efektif.
                            </p>
                        </section>

                        <footer className="text-sm text-gray-600 border-t border-gray-300 pt-4">
                            <p>
                                <em>
                                    Artikel ini bertujuan untuk memberikan pemahaman mendalam tentang Model Gaya Belajar Felder-Silverman. Pandangan yang disampaikan adalah hasil analisis penulis dan mungkin berbeda dari perspektif lain.
                                </em>
                            </p>
                        </footer>
                    </article>

                    {/* Back to Top Button */}
                    {showBackToTop && (
                        <Button
                            className="fixed bottom-6 right-6 bg-primary hover:bg-primary text-white rounded-full p-3 shadow-md transition-colors"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            aria-label="Kembali ke atas"
                        >
                            <ArrowUp className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                <Footer />
            </div>
        </TooltipProvider>
    );
}

export default memo(FSLSMArticle);
