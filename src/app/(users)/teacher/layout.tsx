// File: components/layouts/TeacherLayout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import Navbar from "@/components/teacher/teacher-navbar";
import Sidebar from "@/components/teacher/teacher-sidebar";
// import AuthRedirect from "@/components/AuthRedirect";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper untuk membaca cookie
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

export default function TeacherLayout({ children }: { children: ReactNode }) {
    const [isMobile, setIsMobile] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        // Cek role dari cookie
        const role = getCookie("user_role");
        setIsAuthorized(role === "guru");

        // Cek ukuran layar
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Tampilkan loading spinner
    if (isAuthorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // // Redirect jika tidak authorized
    // if (!isAuthorized) {
    //     return <AuthRedirect />;
    // }

    return (
        <div className="min-h-screen flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50">
            <Navbar />
            </div>

            <div className="flex-1 flex w-full mt-20">
                {/* Desktop Sidebar */}
                {!isMobile && (
                    <div className="w-80 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                        <Sidebar mobile={false} />
                    </div>
                )}

                {/* Main Content */}
                <main className={cn("flex-grow my-6 rounded-lg overflow-auto", !isMobile ? "ml-4 mr-4" : "mx-4 mb-20")}>
                    <div className="h-full">{children}</div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t">
                    <Sidebar mobile={true} />
                </div>
            )}
        </div>
    );
}
