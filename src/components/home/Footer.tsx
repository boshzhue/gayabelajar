import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
    return (
        <footer className="bg-gray-100 text-gray-900 py-8 relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #3B82F6 1px, transparent 1px),
                            linear-gradient(to bottom, #3B82F6 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                    }}
                    animate={{ backgroundPosition: ["0 0", "-1000px 1000px"] }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {/* Branding Column */}
                <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-blue-600">EduScan</h3>
                    <p className="text-sm text-gray-600">Platform analisis gaya belajar berbasis model Felder-Silverman.</p>
                </div>

                {/* Navigation Column */}
                <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-blue-600">Navigasi</h4>
                    <ul className="space-y-2">
                        {[
                            { href: "/", label: "Beranda" },
                            { href: "/login", label: "Mulai Tes" },
                            { href: "/about", label: "Tentang Kami" },
                            { href: "/fslsm", label: "FSLSM" },
                        ].map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="text-gray-600 hover:text-blue-600 transition-colors">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Column */}
                <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-blue-600">Kontak Kami</h4>
                    <address className="not-italic space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                            <p>Jl. Suwarjono, Banyumas, Indonesia</p>
                        </div>
                        <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-blue-600" />
                            <a href="mailto:support@eduscan.id" className="hover:text-blue-600 transition-colors">
                                support@eduscan.id
                            </a>
                        </div>
                        <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-blue-600" />
                            <a href="tel:+622112345678" className="hover:text-blue-600 transition-colors">
                                +62 21 1234 5678
                            </a>
                        </div>
                    </address>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-600">© {new Date().getFullYear()} EduScan. All rights reserved.</p>
            </div>
        </footer>
    );
}
