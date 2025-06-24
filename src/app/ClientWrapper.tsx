"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    // Inisialisasi QueryClient
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000, // Cache queries selama 5 menit
                        retry: 1, // Retry sekali jika gagal
                    },
                    mutations: {
                        retry: 1, // Retry sekali untuk mutasi
                    },
                },
            })
    );

    // Menangani penghapusan atribut cz-shortcut-listen
    useEffect(() => {
        const body = document.querySelector("body");
        if (body && body.hasAttribute("cz-shortcut-listen")) {
            body.removeAttribute("cz-shortcut-listen");
        }
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "#fff",
                        color: "#333",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        padding: "12px 16px",
                    },
                    success: {
                        style: {
                            backgroundColor: "#10b981", // vibrant green
                            color: "#ffffff", // white text for contrast
                            padding: "1rem",
                            borderRadius: "0.75rem", // rounded-xl
                            fontWeight: 600,
                            boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)", // soft green shadow
                        },
                        iconTheme: {
                            primary: "#ffffff", // icon putih
                            secondary: "#065f46", // hijau gelap untuk bayangan ikon
                        },
                    },

                    error: {
                        style: {
                            backgroundColor: "#ef4444", // vibrant red
                            color: "#ffffff",
                            padding: "1rem",
                            borderRadius: "0.75rem",
                            fontWeight: 600,
                            boxShadow: "0 8px 24px rgba(239, 68, 68, 0.3)", // soft red shadow
                        },
                        iconTheme: {
                            primary: "#ffffff",
                            secondary: "#7f1d1d",
                        },
                    },
                }}
            />
            {children}
        </QueryClientProvider>
    );
}
