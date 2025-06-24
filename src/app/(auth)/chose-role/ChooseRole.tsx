"use client";

import { motion } from "framer-motion";
import { GraduationCap, School } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5, ease: "easeInOut" },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: custom * 0.2, duration: 0.5, ease: "easeInOut" },
    }),
    hover: {
        scale: 1.03,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.2 },
    },
};

export default function ChooseRole() {
    const router = useRouter();

    const handleSelectRole = (role: "student" | "teacher") => {
        router.push(`/register/${role}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:p-6" style={{ backgroundColor: "#F4F4F5", color: "#0F67A6" }}>
            {/* <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3 mb-8 sm:mb-12">
                <div className="min-w-[160px] h-12 flex items-center">
                    <Link href="/dashboard/student" className="group relative flex items-center gap-2 z-10">
                        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                            <Image src="/icon-edu.png" alt="EduScan Logo" width={0} height={0} sizes="100vw" className="h-8 md:h-10 lg:h-12 w-auto object-contain" priority />
                        </motion.div>
                    </Link>
                </div>
            </motion.div> */}

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-2xl w-full px-4 sm:px-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8" style={{ color: "#0F67A6" }}>
                    Pilih Peran Anda
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <motion.div
                        variants={cardVariants}
                        custom={0}
                        whileHover="hover"
                        className="p-4 sm:p-6 rounded-xl shadow-md border transition-all duration-300 cursor-pointer bg-white hover:bg-primary/10"
                        onClick={() => handleSelectRole("student")}
                    >
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#0F67A6" }}>
                                <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-medium" style={{ color: "#0F67A6" }}>
                                Siswa
                            </h3>
                            <p className="text-center text-xs sm:text-sm" style={{ color: "#555" }}>
                                Bergabung sebagai siswa untuk mengikuti tes dan melihat hasil belajar Anda.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={cardVariants}
                        custom={1}
                        whileHover="hover"
                        className="p-4 sm:p-6 rounded-xl shadow-md border transition-all duration-300 cursor-pointer bg-white hover:bg-secondary/10"
                        onClick={() => handleSelectRole("teacher")}
                    >
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#4a48a1" }}>
                                <School className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-medium" style={{ color: "#4a48a1" }}>
                                Guru
                            </h3>
                            <p className="text-center text-xs sm:text-sm" style={{ color: "##6B7280" }}>
                                Bergabung sebagai guru untuk mengelola hasil siswa.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }} className="mt-6 sm:mt-8">
                <Link href="/" className="text-sm sm:text-base hover:underline transition-all duration-200" style={{ color: "#0F67A6" }}>
                    Kembali ke Beranda
                </Link>
            </motion.div>
        </div>
    );
}
