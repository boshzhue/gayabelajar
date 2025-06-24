"use client";

import { ReactNode, useState, useEffect } from "react";
import Navbar from "@/components/admin/admin-navbar";
import Sidebar from "@/components/admin/admin-sidebar";
import { Loader2, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    const [isMobile, setIsMobile] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const role = getCookie("user_role");
            setIsAuthorized(role === "admin");
        };
        checkAuth();
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navbar with hamburger button */}
            <Navbar>
                {isMobile && (
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                        <Menu className="h-6 w-6" />
                    </button>
                )}
            </Navbar>

            <div className="flex-1 flex w-full relative">
                {/* Desktop Sidebar */}
                {!isMobile && (
                    <div className="w-64 flex-shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
                        <Sidebar mobile={false} />
                    </div>
                )}

                {/* Mobile Sidebar (overlay) */}
                {isMobile && sidebarOpen && (
                    <div className="fixed inset-0 z-40">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 w-64 h-full bg-white z-50 shadow-lg">
                            <Sidebar mobile={true} onClose={() => setSidebarOpen(false)} />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className={cn("flex-1 my-6 rounded-lg overflow-auto", !isMobile ? "ml-4 mr-4" : "mx-4")}>
                    <div className="">{children}</div>
                </main>
            </div>
        </div>
    );
}
