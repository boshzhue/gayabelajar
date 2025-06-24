"use client";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { RocketIcon, UsersIcon, Lightbulb, BookOpen, GraduationCap, HeartHandshake } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

function AboutPage() {
    const teamMembers = [
        {
            name: "Wiga Baiihaqi",
            role: "Dosen",
            bio: "Ahli dibidang machine learning",
            image: "/pakwiga.jpeg",
        },
        {
            name: "Dwiki Hidayat",
            role: "Mahasiswa",
            bio: "Frontend Dev",
            image: "/dwiki.png",
        },
        {
            name: "Tri Abdul Ghani",
            role: "Mahasiswa",
            bio: "Backend Dev",
            image: "/ghani.jpg",
        },
    ];

    const milestones = [
        { year: "2025", event: "Didirikan oleh tim", icon: BookOpen },
        { year: "2025", event: "Peluncuran platform pertama", icon: RocketIcon },
        { year: "2026", event: "Pengembangan", icon: UsersIcon },
    ];

    const values = [
        {
            title: "Inovasi",
            description: "Terus mengembangkan solusi terbaru dalam dunia pendidikan",
            icon: Lightbulb,
            color: "text-blue-500 bg-blue-50",
        },
        {
            title: "Integritas",
            description: "Menjunjung tinggi kejujuran dan transparansi dalam semua aspek",
            icon: HeartHandshake,
            color: "text-green-500 bg-green-50",
        },
        {
            title: "Kualitas",
            description: "Hanya menyajikan konten dan layanan dengan standar terusji",
            icon: GraduationCap,
            color: "text-purple-500 bg-purple-50",
        },
    ];

    return (
        <div className="min-h-screen text-neutral-700 flex flex-col bg-naturalSoft-accent">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 flex items-center justify-center min-h-[60vh] px-4 py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Mengenal <span className="text-primary">Lebih Dekat</span> Platform Kami
                    </h1>
                    <p className="text-lg sm:text-xl max-w-3xl text-gray-600 mb-8 leading-relaxed">Platform inovatif yang membantu pelajar menemukan gaya belajar optimal mereka melalui pendekatan berbasis penelitian.</p>
                    <Button asChild size="lg" className="bg-primary text-white hover:bg-primary-foreground rounded-full px-6 py-4 text-lg font-semibold">
                        <Link href="/chose-role">Coba Sekarang</Link>
                    </Button>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-16 sm:py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="lg:w-1/2">
                            <Image src="/treman.jpg" alt="Our Story" width={600} height={400} sizes="(max-width: 1024px) 100vw, 600px" className="rounded-xl w-full h-auto" loading="lazy" />
                        </div>
                        <div className="lg:w-1/2">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Cerita Kami</h2>
                            <p className="text-gray-600 mb-4">
                                Berawal dari penelitian akademis tahun 2025 tentang kesulitan belajar siswa, Pak Wiga selaku dosen melakukan penelitian dengan gelombang otak untuk mengetahui preferensi belajar siswa, dalam rangka
                                mengumpulkan data untuk diolah. kami menemukan model Felder-Silverman yang terbukti efektif membantu pelajar memahami cara belajar mereka. Model ini akan menjadi tahapan awal dari peneltian dan platform ini
                                merupakan platform awal untuk meengumpulkan data dari siswa yang akan digunakan untuk penelitian lebih lanjut.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 sm:py-24 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-12">
                        Misi & <span className="text-primary">Visi</span>
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <RocketIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Misi Kami</h3>
                            <p className="text-gray-600">Membantu polajar menemukan preferensi belajar berdasarkan minat sehingga bisa mencerna dengan lebih mudah.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lightbulb className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Visi Kami</h3>
                            <p className="text-gray-600">Menjadi platform yang dapat membantu siswa dalam menemukan gaya belajar mereka.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 sm:py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Nilai-Nilai Kami</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Fondasi yang membangun setiap aspek kerja kami dalam melayani komunitas pendidikan</p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {values.map((value, index) => (
                            <div key={index} className="p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 rounded-full ${value.color} flex items-center justify-center mb-4`}>
                                    <value.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 sm:py-24 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Tim Kami</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Para ahli di balik kesuksesan platform ini</p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-8">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                <div className="h-48 overflow-hidden">
                                    <Image src={member.image} alt={member.name} width={400} height={300} sizes="(max-width: 640px) 100vw, 400px" className="w-full h-full object-cover" loading="lazy" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                                    <p className="text-primary mb-4">{member.role}</p>
                                    <p className="text-gray-600 text-sm">{member.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Milestones Section */}
            <section className="py-16 sm:py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-16">Perjalanan Kami</h2>
                    <div className="relative">
                        <div className="absolute left-1/2 h-full w-0.5 bg-gray-200 transform -translate-x-1/2"></div>
                        {milestones.map((milestone, index) => (
                            <div key={index} className={`mb-8 flex ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"} items-center`}>
                                <div className="w-1/2 px-4 py-2">
                                    <div className={`p-6 rounded-lg shadow-md ${index % 2 === 0 ? "bg-blue-50" : "bg-purple-50"}`}>
                                        <div className={`w-10 h-10 rounded-full ${index % 2 === 0 ? "bg-blue-100" : "bg-purple-100"} flex items-center justify-center mb-3`}>
                                            <milestone.icon className={`w-5 h-5 ${index % 2 === 0 ? "text-blue-600" : "text-purple-600"}`} />
                                        </div>
                                        <h3 className="font-bold text-lg mb-1">{milestone.year}</h3>
                                        <p className="text-gray-600">{milestone.event}</p>
                                    </div>
                                </div>
                                <div className="w-1/2 px-4">
                                    <div className="h-1 bg-gray-200"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}

export default memo(AboutPage);
