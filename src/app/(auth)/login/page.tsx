"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import api from "@/lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useMutation } from "@tanstack/react-query";

export default function LoginPage() {
    return <LoginForm />;
}

function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [remainingAttempts, setRemainingAttempts] = useState(3);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email) {
            newErrors.email = "Email wajib diisi";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Format email tidak valid";
        }

        if (!formData.password) {
            newErrors.password = "Kata sandi wajib diisi";
        } else if (formData.password.length < 8) {
            newErrors.password = "Kata sandi minimal 8 karakter";
        }

        return newErrors;
    };

    const loginMutation = useMutation({
        mutationFn: async () => {
            const formBody = new URLSearchParams();
            formBody.append("username", formData.email);
            formBody.append("password", formData.password);

            const response = await api.post("/auth/login", formBody.toString(), {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success("Login berhasil! Mengarahkan ke dashboard...", {
                duration: 2000,
                position: "top-center",
            });

            if (data.peran) {
                Cookies.set("user_role", data.peran, { secure: true, sameSite: "lax" });
            }

            switch (data.peran?.toLowerCase()) {
                case "siswa":
                    router.replace("/student");
                    break;
                case "guru":
                    router.replace("/teacher");
                    break;
                default:
                    router.replace("/admin");
            }
        },
        onError: (error: unknown) => {
            let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";

            const axiosError = error as AxiosError<{ detail?: string }>;

            if (axiosError.response) {
                const { status, data } = axiosError.response;
                const detail = data?.detail?.toLowerCase() || "";

                if (status === 401) {
                    if (detail.includes("akun tidak ditemukan") || detail.includes("user not found")) {
                        errorMessage = "Akun tidak ditemukan. Silakan daftar atau periksa email.";
                    } else if (detail.includes("kata sandi salah")) {
                        errorMessage = "Kata sandi salah. Silakan coba lagi.";
                    } else {
                        errorMessage = "Email atau kata sandi salah. Silakan coba lagi.";
                    }
                    // Show modal for 401 errors
                    setModalMessage(errorMessage);
                    setModalOpen(true);
                } else if (status === 429) {
                    errorMessage = `Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit. (${remainingAttempts - 1} percobaan tersisa)`;
                    toast.error(errorMessage, { duration: 4000, position: "top-center" });
                } else if (status === 500) {
                    errorMessage = "Kesalahan server. Silakan coba lagi nanti.";
                    toast.error(errorMessage, { duration: 4000, position: "top-center" });
                } else if (detail) {
                    errorMessage = detail;
                    toast.error(errorMessage, { duration: 4000, position: "top-center" });
                }
            } else if (axiosError.message) {
                errorMessage = axiosError.message;
                toast.error(errorMessage, { duration: 4000, position: "top-center" });
            }

            setRemainingAttempts((prev) => Math.max(prev - 1, 0));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        loginMutation.mutate();
    };

    return (
        <div className={cn("min-h-screen w-full flex items-center justify-center bg-white", className)} {...props}>
            <div className="w-full h-screen flex">
                <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <Card className="max-w-md mx-auto h-full flex flex-col justify-center bg-white border-0 shadow-none transition-all duration-300">
                        <CardContent className="p-6 sm:p-8">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="flex flex-col items-start">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 flex items-center">Login</h1>
                                    <p className="text-gray-600 text-sm sm:text-base max-w-xl">Masuk ke akun Anda untuk mengakses sistem.</p>
                                    <div className="mt-4 w-12 h-1 bg-primary/30 rounded-full" />
                                </div>

                                <EmailInput value={formData.email} onChange={handleChange} error={errors.email} />

                                <PasswordInput value={formData.password} onChange={handleChange} error={errors.password} isVisible={passwordVisible} onToggleVisibility={() => setPasswordVisible((prev) => !prev)} />

                                <Button
                                    type="submit"
                                    className="w-full h-10 sm:h-12 bg-primary hover:bg-primary/90 text-white font-medium text-sm sm:text-base rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                                    disabled={loginMutation.isPending || remainingAttempts <= 0}
                                >
                                    {loginMutation.isPending ? "Memproses..." : remainingAttempts <= 0 ? "Batas Percobaan Habis" : "Masuk"}
                                </Button>

                                <div className="text-center text-xs sm:text-sm text-gray-600 mt-4">
                                    Tidak Punya Akun?{" "}
                                    <Link href="/chose-role" prefetch={true} className="text-primary font-medium hover:underline hover:text-primary/80" aria-label="Daftar akun baru">
                                        Daftar
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <LoginIllustration />
            </div>

            {/* Modal for specific error messages */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Kesalahan Login</DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">{modalMessage}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setModalOpen(false)} className="bg-primary hover:bg-primary/90 text-white rounded-full">
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function EmailInput({ value, onChange, error }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string }) {
    return (
        <div className="space-y-2">
            <Label className="text-primary font-medium text-sm sm:text-base">Email</Label>
            <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                    id="email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={value}
                    onChange={onChange}
                    className="pl-8 sm:pl-10 h-10 sm:h-12 w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                    aria-label="Masukkan alamat email"
                />
            </div>
            {error && <p className="text-red-600 text-xs sm:text-sm mt-1 flex items-center gap-1">{error}</p>}
        </div>
    );
}

function PasswordInput({ value, onChange, error, isVisible, onToggleVisibility }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string; isVisible: boolean; onToggleVisibility: () => void }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center">
                <Label className="text-primary font-medium text-sm sm:text-base">Kata Sandi</Label>
                <Link href="/reset-password" prefetch={true} className="ml-auto text-xs sm:text-sm text-primary hover:underline hover:text-primary/80" aria-label="Lupa kata sandi">
                    Lupa kata sandi?
                </Link>
            </div>
            <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                    id="password"
                    type={isVisible ? "text" : "password"}
                    placeholder="••••••••"
                    value={value}
                    onChange={onChange}
                    className="pl-8 sm:pl-10 pr-10 h-10 sm:h-12 w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg text-xs sm:text-sm placeholder:text-gray-400 bg-background"
                    aria-label="Masukkan kata sandi"
                />
                <button type="button" aria-label={isVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} className="absolute inset-y-0 right-2.5 text-gray-400 hover:text-primary transition-colors" onClick={onToggleVisibility}>
                    {isVisible ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
            </div>
            {error && <p className="text-red-600 text-xs sm:text-sm mt-1 flex items-center gap-1">{error}</p>}
        </div>
    );
}

function LoginIllustration() {
    return (
        <div className="flex-1 hidden md:block bg-background">
            <div className="relative h-full w-full flex items-center justify-center p-12">
                <Image src="/login.svg" alt="Login Illustration" fill className="object-cover drop-shadow-xl animate-float" priority sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw" />
            </div>
        </div>
    );
}
