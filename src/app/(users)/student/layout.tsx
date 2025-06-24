// src/app/student/layout.tsx
"use client";

import { ReactNode, useState, useEffect } from "react";
import Navbar from "@/components/student/student-navbar";
import Sidebar from "@/components/student/student-sidebar";
import { Loader2 } from "lucide-react";
import { cn as classNames } from "@/lib/utils";

// Helper untuk membaca cookie
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
    }
    return null;
}

export default function StudentLayout({ children }: { children: ReactNode }) {
    const [isMobile, setIsMobile] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    // Cek autentikasi dari cookie langsung
    useEffect(() => {
        const checkAuth = () => {
            const role = getCookie("user_role"); // ✅ Baca dari cookie
            if (role === "siswa") {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        };

        checkAuth();
    }, []);

    // Cek ukuran layar
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Loading state awal
    if (isAuthorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center ">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // Jika tidak autorisasi, arahkan ke halaman login
    // if (!isAuthorized) {
    //     return <AuthRedirect />;
    // }

    // Tampilkan layout utama jika autorisasi berhasil
    return (
        <div className="min-h-screen flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>
            <div className="flex-1 flex w-full mt-20">
                {/* Sidebar untuk desktop */}
                {!isMobile && (
                    <div className="w-80 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                        <Sidebar mobile={false} />
                    </div>
                )}

                {/* Konten utama */}
                <main className={classNames("flex-grow  my-6 rounded-lg overflow-auto", !isMobile ? "ml-4 mr-4" : "mx-4 mb-20")}>
                    <div className="h-full">{children}</div>
                </main>
            </div>

            {/* Sidebar untuk mobile */}
            {isMobile && (
                <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t">
                    <Sidebar mobile={true} />
                </div>
            )}
        </div>
    );
}
