"use client";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Clock, Lightbulb, BrainIcon, ChartBarIcon, GraduationCapIcon, UsersIcon, BookOpenIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

function Home() {
    const steps = [
        { icon: ShieldCheck, title: "Daftar Sekarang", desc: "Buat akun gratis dalam hitungan detik" },
        { icon: Clock, title: "Ikuti Tes", desc: "Jawab 44 pertanyaan singkat (15 menit)" },
        { icon: Lightbulb, title: "Dapatkan Hasil", desc: "Temukan gaya belajar terbaik untukmu" },
    ];

    const benefits = [
        {
            icon: BrainIcon,
            title: "Pembelajaran Personal",
            description: "Strategi belajar personal untuk memaksimalkan potensi unik Anda.",
            color: "bg-primary text-white",
        },
        {
            icon: GraduationCapIcon,
            title: "Hemat Waktu",
            description: "Belajar lebih cerdas, bukan lebih keras. Efisiensi waktu belajar meningkat.",
            color: "bg-primary text-white",
        },
        {
            icon: ChartBarIcon,
            title: "Peningkatan Hasil",
            description: "Pemahaman materi meningkat hingga 25% dengan metode yang sesuai gaya belajar Anda.",
            color: "bg-primary text-white",
        },
        {
            icon: UsersIcon,
            title: "Kolaborasi Efektif",
            description: "Kenali preferensi komunikasi Anda untuk kerja tim yang lebih solid.",
            color: "bg-primary text-white",
        },
    ];

    const whyItWorks = [
        {
            id: "research-based",
            icon: BookOpenIcon,
            title: "Berbasis Penelitian",
            description: "Model Felder-Silverman dikembangkan melalui penelitian mendalam di bidang pendidikan, memastikan pendekatan yang teruji dan terpercaya.",
            color: "bg-white text-primary",
        },
        {
            id: "personalized-learning",
            icon: BrainIcon,
            title: "Personalisasi Efektif",
            description: "Mengidentifikasi 4 dimensi gaya belajar untuk menciptakan strategi yang benar-benar sesuai dengan kebutuhan Anda.",
            color: "bg-white text-primary",
        },
        {
            id: "measurable-results",
            icon: ChartBarIcon,
            title: "Hasil Terukur",
            description: "Pendekatan ini terbukti meningkatkan pemahaman dan retensi materi pelajaran melalui metode yang disesuaikan.",
            color: "bg-white text-primary",
        },
        {
            id: "flexible-for-all",
            icon: UsersIcon,
            title: "Fleksibel untuk Semua",
            description: "Cocok untuk pelajar, profesional, dan tim, mendukung berbagai konteks pembelajaran dan kolaborasi.",
            color: "bg-white text-primary",
        },
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                when: "beforeChildren",
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    const fadeInVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "easeInOut",
            },
        },
    };

    const [heroRef, heroInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const [stepsRef, stepsInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const [benefitsRef, benefitsInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const [whyWorksRef, whyWorksInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <div className="min-h-screen text-gray-900 flex flex-col bg-white">
            <Navbar />

            {/* Hero Section */}
            <motion.section
                ref={heroRef}
                initial="hidden"
                animate={heroInView ? "visible" : "hidden"}
                variants={containerVariants}
                className="pt-32 flex items-center justify-center min-h-[80vh] text-left px-4 py-12 sm:py-16 bg-white font-sans"
            >
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
                    <motion.div variants={itemVariants} className="flex-1">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900">
                            Temukan <span className="text-primary">Gaya Belajarmu</span> yang Optimal
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl max-w-md sm:max-w-lg text-gray-600 mb-8 leading-relaxed">
                            Tes gaya belajar Felder-Silverman yang teruji akan membantu Anda belajar lebih efektif dan efisien. Mulai perjalanan belajar yang dipersonalisasi sekarang!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild size="lg" className="group relative overflow-hidden bg-primary text-white hover:bg-primary rounded-full px-6 py-5 sm:px-8 sm:py-5 text-base sm:text-lg font-semibold transition-all duration-300">
                                <Link href="/chose-role" className="flex items-center justify-center gap-3 sm:gap-4">
                                    Mulai Tes Sekarang
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex-1 flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
                        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md rounded-xl overflow-hidden">
                            <Image src="/illustrasi.jpg" alt="Gaya Belajar Illustration" width={448} height={448} sizes="(max-width: 640px) 320px, (max-width: 768px) 384px, 448px" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* How It Works Section */}
            <motion.section ref={stepsRef} initial="hidden" animate={stepsInView ? "visible" : "hidden"} variants={fadeInVariants} className="py-12 sm:py-16 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={itemVariants} className="text-center mb-10 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">3 Langkah Mudah</h2>
                        <p className="text-gray-600 text-sm sm:text-base">Temukan gaya belajar idealmu dengan cara sederhana</p>
                    </motion.div>
                    <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {steps.map((step, index) => (
                            <motion.div key={index} variants={itemVariants} className="bg-white rounded-lg p-4 sm:p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-gray-600 text-xs sm:text-sm">{step.desc}</p>
                                <div className="mt-4 text-primary font-medium text-sm">Langkah {index + 1}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* Benefits Section */}
            <motion.section ref={benefitsRef} initial="hidden" animate={benefitsInView ? "visible" : "hidden"} variants={fadeInVariants} className="py-16 sm:py-24 px-4 bg-white flex items-center justify-center">
                <div className="max-w-7xl mx-auto">
                    <motion.div variants={itemVariants} className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                            Raih Keunggulan dengan Memahami <span className="text-primary">Gaya Belajar</span>
                        </h2>
                        <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-xl sm:max-w-2xl mx-auto">Temukan berbagai keuntungan yang akan Anda dapatkan dengan mengenali dan menerapkan gaya belajar yang paling sesuai.</p>
                    </motion.div>
                    <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {benefits.map((benefit, index) => (
                            <motion.div key={index} variants={itemVariants} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 flex flex-col h-full">
                                <div className={`rounded-lg p-2 sm:p-3 w-fit mb-4 sm:mb-5 ${benefit.color}`}>
                                    <benefit.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed flex-grow">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* Why It Works Section */}
            <motion.section ref={whyWorksRef} initial="hidden" animate={whyWorksInView ? "visible" : "hidden"} variants={fadeInVariants} className="py-16 sm:py-24 px-4 bg-gray-50 flex items-center justify-center">
                <div className="max-w-5xl mx-auto">
                    <motion.div variants={itemVariants} className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                            Mengapa <span className="text-primary">Ini Berhasil</span>
                        </h2>
                        <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-xl sm:max-w-2xl mx-auto">Model Felder-Silverman dirancang berdasarkan penelitian ilmiah untuk membantu Anda belajar lebih efektif.</p>
                    </motion.div>
                    <motion.div variants={containerVariants} className="space-y-8 sm:space-y-12">
                        {whyItWorks.map((item) => (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                className={`flex flex-col ${whyItWorks.indexOf(item) % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"} items-center gap-6 sm:gap-8 bg-white rounded-xl shadow-md p-6 sm:p-8 hover:shadow-lg transition-shadow`}
                            >
                                <div className={`flex-shrink-0 ${item.color} rounded-full p-4 sm:p-5`}>
                                    <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            <Footer />
        </div>
    );
}

export default memo(Home);
