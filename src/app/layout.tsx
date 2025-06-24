import type { Metadata } from "next";
import { Inter, Poppins, Anton } from "next/font/google";
import "@/app/globals.css";
import ClientWrapper from "@/app/ClientWrapper"; // Komponen baru untuk Toaster

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-poppins",
});
const anton = Anton({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-anton",
});

export const metadata: Metadata = {
    title: "EduScan",
    description: "Deteksi gaya belajar Anda dengan mudah",
    icons: {
        icon: "/icon-edu.webp",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id" className={`${inter.variable} ${poppins.variable} ${anton.variable} scroll-smooth h-full`}>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              if (typeof window !== 'undefined') {
                document.addEventListener('DOMContentLoaded', () => {
                  const body = document.querySelector('body');
                  if (body && body.hasAttribute('cz-shortcut-listen')) {
                    body.removeAttribute('cz-shortcut-listen');
                  }
                });
              }
            `,
                    }}
                />
            </head>
            <body className="h-full flex flex-col font-poppins" suppressHydrationWarning>
                <ClientWrapper>
                    <div className="h-full">{children}</div>
                </ClientWrapper>
            </body>
        </html>
    );
}
