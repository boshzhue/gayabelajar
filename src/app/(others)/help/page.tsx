"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
    const handleOpenPdf = () => {
        const pdfUrl = "/pdf/bantuan.pdf"; // file ini ditaruh di folder public/files
        window.open(pdfUrl, "_blank"); // buka tab baru
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Bantuan</CardTitle>
                    <CardDescription>Halaman bantuan untuk mendukung pengguna</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700">Panduan Penggunaan</h3>
                    <p className="text-gray-500 text-center">Klik tombol di bawah ini untuk melihat file bantuan dalam bentuk PDF.</p>
                    <Button onClick={handleOpenPdf}>Lihat File Bantuan (PDF)</Button>
                </CardContent>
            </Card>
        </div>
    );
}
