"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, User, Mail, Phone, Calendar, Lock, ChevronDown, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { AxiosError } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Konstanta untuk konfigurasi
const SCHOOLS_STALE_TIME = 5 * 60 * 1000; // 5 menit

const educationLevels = {
    D3: "D3 (Diploma 3)",
    D4: "D4 (Diploma 4)",
    S1: "S1 (Sarjana)",
    S2: "S2 (Magister)",
    S3: "S3 (Doktor)",
};

type FormData = {
    nip: string;
    full_name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    gender: string;
    education_level: keyof typeof educationLevels;
    school: string;
    birth_date: string;
};

type Errors = Partial<Record<keyof FormData | "submit", string>>;

type PasswordVisibility = {
    password: boolean;
    confirmPassword: boolean;
};

type ApiErrorResponse = {
    detail: string | Array<{ loc: string[]; msg: string; type: string }>;
};

interface SchoolNameResponse {
    nama_sekolah: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        nip: "",
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        gender: "",
        education_level: "S1",
        school: "",
        birth_date: "",
    });

    const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibility>({
        password: false,
        confirmPassword: false,
    });

    const [errors, setErrors] = useState<Errors>({});
    const [remainingAttempts, setRemainingAttempts] = useState(3);
    const [isGenderOpen, setIsGenderOpen] = useState(false);
    const [isEducationLevelOpen, setIsEducationLevelOpen] = useState(false);
    const [isSchoolOpen, setIsSchoolOpen] = useState(false);
    const [schoolSearch, setSchoolSearch] = useState("");

    // Fetch daftar sekolah
    const {
        data: schools = [],
        isLoading: isLoadingSchools,
        error: schoolsError,
    } = useQuery<SchoolNameResponse[]>({
        queryKey: ["schools"],
        queryFn: async () => {
            const response = await api.get("/auth/sekolah", { headers: { "Content-Type": "application/json" } });
            return response.data;
        },
        staleTime: SCHOOLS_STALE_TIME,
    });

    // Filter sekolah berdasarkan pencarian
    const filteredSchools = schools.filter((school) =>
        school.nama_sekolah.toLowerCase().includes(schoolSearch.toLowerCase())
    );

    useEffect(() => {
        if (window.innerWidth >= 768) return;

        const handleFocus = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.closest(".title-section")) return;
            setTimeout(() => {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest",
                });
            }, 300);
        };

        const inputs = document.querySelectorAll("input, button");
        inputs.forEach((input) => input.addEventListener("focus", handleFocus));

        return () => {
            inputs.forEach((input) => input.removeEventListener("focus", handleFocus));
        };
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        let processedValue = value;

        if (id === "phone") {
            processedValue = value.replace(/\D/g, "");
        }

        setFormData((prev) => ({ ...prev, [id]: processedValue }));
    }, []);

    const handleSelectChange = useCallback((field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === "gender") setIsGenderOpen(false);
        if (field === "education_level") setIsEducationLevelOpen(false);
        if (field === "school") {
            setIsSchoolOpen(false);
            setSchoolSearch("");
        }
    }, []);

    const handleSchoolSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSchoolSearch(e.target.value);
    }, []);

    const validateForm = useCallback((): Errors => {
        const newErrors: Errors = {};
        const today = new Date();
        const birthDate = new Date(formData.birth_date);

        if (!formData.nip.trim()) {
            newErrors.nip = "NIP harus diisi";
        } else if (!/^\d{18}$/.test(formData.nip)) {
            newErrors.nip = "NIP harus 18 digit angka";
        }

        if (!formData.full_name.trim()) {
            newErrors.full_name = "Nama lengkap harus diisi";
        } else if (formData.full_name.length < 3) {
            newErrors.full_name = "Nama minimal 3 karakter";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email harus diisi";
        } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
            newErrors.email = "Hanya email @gmail.com yang diterima";
        }

        if (!formData.password) {
            newErrors.password = "Kata sandi harus diisi";
        } else {
            if (formData.password.length < 8) newErrors.password = "Minimal 8 karakter";
            if (!/[A-Z]/.test(formData.password)) newErrors.password = "Harus mengandung huruf besar";
            if (!/\d/.test(formData.password)) newErrors.password = "Harus mengandung angka";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Konfirmasi password tidak cocok";
        }

        if (!formData.phone) {
            newErrors.phone = "Nomor telepon harus diisi";
        } else {
            const cleanedPhone = formData.phone.replace(/\D/g, "");
            if (cleanedPhone.length !== 12) {
                newErrors.phone = "Harus 12 digit (contoh: 081234567890)";
            } else if (!cleanedPhone.startsWith("08")) {
                newErrors.phone = "Harus dimulai dengan 08";
            }
        }

        if (!formData.birth_date) {
            newErrors.birth_date = "Tanggal lahir harus diisi";
        } else if (birthDate > today) {
            newErrors.birth_date = "Tanggal lahir tidak valid";
        }

        if (!formData.gender) {
            newErrors.gender = "Jenis kelamin harus dipilih";
        }

        if (!formData.education_level) {
            newErrors.education_level = "Tingkat pendidikan harus dipilih";
        }

        if (!formData.school) {
            newErrors.school = "Sekolah harus dipilih";
        }

        return newErrors;
    }, [formData]);

    const registerMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                nip: formData.nip,
                nama_lengkap: formData.full_name,
                email: formData.email,
                password: formData.password,
                confirm_password: formData.confirmPassword,
                nomor_telepon: formData.phone,
                jenis_kelamin: formData.gender === "Laki-laki" ? "Laki-Laki" : formData.gender,
                tingkat_pendidikan: formData.education_level,
                nama_sekolah: formData.school,
                tanggal_lahir: formData.birth_date,
            };

            const { data } = await api.post("/guru/register", payload);
            return data;
        },
        onSuccess: (data) => {
            if (data.message === "Registrasi guru berhasil") {
                toast.success("Registrasi berhasil! Mengarahkan ke login...", {
                    duration: 2000,
                    position: "top-center",
                });
                setTimeout(() => router.push("/login"), 2000);
            }
        },
        onError: (error: unknown) => {
            let errorMsg = "Terjadi kesalahan saat registrasi";
            if (error instanceof AxiosError) {
                const axiosError = error as AxiosError<ApiErrorResponse>;
                if (axiosError.response) {
                    const { data, status } = axiosError.response;

                    if (status === 400) {
                        if (typeof data?.detail === "string") {
                            errorMsg = data.detail;
                        } else if (Array.isArray(data?.detail)) {
                            errorMsg = data.detail
                                .map((err) => {
                                    const field = err.loc[err.loc.length - 1];
                                    return `${field}: ${err.msg}`;
                                })
                                .join("\n");
                        }
                    } else if (status === 429) {
                        errorMsg = `Terlalu banyak percobaan. Silakan coba lagi nanti. (${remainingAttempts - 1} percobaan tersisa)`;
                    } else if (status === 409) {
                        errorMsg = "Data sudah terdaftar (NIP/Email)";
                    } else if (status >= 500) {
                        errorMsg = "Server sedang mengalami gangguan";
                    }
                }
            }

            setRemainingAttempts((prev) => Math.max(prev - 1, 0));
            toast.error(errorMsg, {
                duration: 4000,
                position: "top-center",
            });
        },
    });

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const formErrors = validateForm();

            if (Object.keys(formErrors).length > 0) {
                setErrors(formErrors);
                return;
            }

            setErrors({});
            registerMutation.mutate();
        },
        [validateForm, registerMutation]
    );

    return (
        <div className={cn("h-screen w-full flex bg-white overflow-y-auto")}>
            <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <Card className="w-full max-w-2xl mx-auto max-h-[calc(100vh-2rem)] flex flex-col bg-white border-0 shadow-none">
                    <CardContent className="p-4 sm:p-6 flex-1 overflow-y-auto">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col items-start title-section relative z-10">
                                <div className="pt-2 sm:pt-4">
                                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-secondary mb-1 flex items-center">Daftar Akun Guru</h1>
                                    <p className="text-gray-600 text-xs sm:text-sm max-w-xl">Cari tahu gaya belajarmu.</p>
                                    <div className="mt-2 w-10 h-1 bg-secondary/30 rounded-full" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="pb-1 border-b border-secondary/20">
                                    <h2 className="text-base sm:text-lg font-semibold text-secondary">Informasi Pribadi</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="nip" className="text-secondary font-medium text-xs sm:text-sm">
                                            NIP
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                id="nip"
                                                type="text"
                                                value={formData.nip}
                                                onChange={handleChange}
                                                placeholder="18 digit angka NIP"
                                                className="pl-7 sm:pl-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-secondary focus:border-secondary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Masukkan NIP"
                                            />
                                        </div>
                                        {errors.nip && <p className="text-red-600 text-xs mt-0.5">{errors.nip}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="full_name" className="text-secondary font-medium text-xs sm:text-sm">
                                            Nama Lengkap
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                id="full_name"
                                                type="text"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                placeholder="Nama sesuai ijazah"
                                                className="pl-7 sm:pl-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-secondary focus:border-secondary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Masukkan nama lengkap"
                                            />
                                        </div>
                                        {errors.full_name && <p className="text-red-600 text-xs mt-0.5">{errors.full_name}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="birth_date" className="text-secondary font-medium text-xs sm:text-sm">
                                            Tanggal Lahir
                                        </Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                id="birth_date"
                                                type="date"
                                                value={formData.birth_date}
                                                onChange={handleChange}
                                                className="pl-7 sm:pl-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-secondary focus:border-secondary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Pilih tanggal lahir"
                                            />
                                        </div>
                                        {errors.birth_date && <p className="text-red-600 text-xs mt-0.5">{errors.birth_date}</p>}
                                    </div>

                                    <div className="space-y-1 relative">
                                        <Label className="text-secondary font-medium text-xs sm:text-sm">Jenis Kelamin</Label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsGenderOpen(!isGenderOpen)}
                                                className={`flex items-center justify-between w-full h-9 sm:h-10 pl-3 pr-2 border rounded-lg text-left text-xs sm:text-sm bg-background ${
                                                    errors.gender ? "border-red-500" : "border-gray-200"
                                                } focus:ring-2 focus:ring-secondary focus:border-secondary`}
                                            >
                                                {formData.gender || "Pilih jenis kelamin"}
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isGenderOpen ? "transform rotate-180" : ""}`} />
                                            </button>
                                            {isGenderOpen && (
                                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                                    <button type="button" onClick={() => handleSelectChange("gender", "Laki-Laki")} className="block w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-secondary/10">
                                                        Laki-Laki
                                                    </button>
                                                    <button type="button" onClick={() => handleSelectChange("gender", "Perempuan")} className="block w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-secondary/10">
                                                        Perempuan
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {errors.gender && <p className="text-red-600 text-xs mt-0.5">{errors.gender}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="phone" className="text-secondary font-medium text-xs sm:text-sm">
                                            Nomor Telepon
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                id="phone"
                                                type="text"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="085787654676"
                                                className="pl-7 sm:pl-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-secondary focus:border-secondary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Masukkan nomor telepon"
                                            />
                                        </div>
                                        {errors.phone && <p className="text-red-600 text-xs mt-0.5">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="pb-1 border-b border-secondary/20">
                                    <h2 className="text-base sm:text-lg font-semibold text-secondary">Informasi Akun</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="email" className="text-secondary font-medium text-xs sm:text-sm">
                                            Email
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="contoh@gmail.com"
                                                className="pl-7 sm:pl-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-secondary focus:border-secondary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Masukkan alamat email"
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-600 text-xs mt-0.5">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="password" className="text-secondary font-medium text-xs sm:text-sm">
                                            Kata Sandi
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                id="password"
                                                type={passwordVisibility.password ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="pl-7 sm:pl-9 pr-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-secondary focus:border-secondary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Masukkan kata sandi"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPasswordVisibility((prev) => ({ ...prev, password: !prev.password }))}
                                                className="absolute inset-y-0 right-2 text-gray-400 hover:text-secondary transition-colors"
                                                aria-label={passwordVisibility.password ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                                            >
                                                {passwordVisibility.password ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-600 text-xs mt-0.5">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="confirmPassword" className="text-secondary font-medium text-xs sm:text-sm">
                                            Konfirmasi Kata Sandi
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                id="confirmPassword"
                                                type={passwordVisibility.confirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="pl-7 sm:pl-9 pr-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-secondary focus:border-secondary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Konfirmasi kata sandi"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPasswordVisibility((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                                                className="absolute inset-y-0 right-2 text-gray-400 hover:text-secondary transition-colors"
                                                aria-label={passwordVisibility.confirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
                                            >
                                                {passwordVisibility.confirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-600 text-xs mt-0.5">{errors.confirmPassword}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="pb-1 border-b border-secondary/20">
                                    <h2 className="text-base sm:text-lg font-semibold text-secondary">Informasi Profesi</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
                                    <div className="space-y-1 relative">
                                        <Label className="text-secondary font-medium text-xs sm:text-sm">Tingkat Pendidikan</Label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsEducationLevelOpen(!isEducationLevelOpen)}
                                                className={`flex items-center justify-between w-full h-9 sm:h-10 pl-3 pr-2 border rounded-lg text-left text-xs sm:text-sm bg-background ${
                                                    errors.education_level ? "border-red-500" : "border-gray-200"
                                                } focus:ring-2 focus:ring-secondary focus:border-secondary`}
                                            >
                                                {educationLevels[formData.education_level] || "Pilih tingkat pendidikan"}
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEducationLevelOpen ? "transform rotate-180" : ""}`} />
                                            </button>
                                            {isEducationLevelOpen && (
                                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                                    {Object.entries(educationLevels).map(([value, label]) => (
                                                        <button key={value} type="button" onClick={() => handleSelectChange("education_level", value)} className="block w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-secondary/10">
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {errors.education_level && <p className="text-red-600 text-xs mt-0.5">{errors.education_level}</p>}
                                    </div>

                                    <div className="space-y-1 relative">
                                        <Label className="text-secondary font-medium text-xs sm:text-sm">Sekolah</Label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsSchoolOpen(!isSchoolOpen)}
                                                disabled={isLoadingSchools}
                                                className={cn(
                                                    "flex items-center justify-between w-full h-9 sm:h-10 pl-3 pr-2 border rounded-lg text-left text-xs sm:text-sm bg-background",
                                                    errors.school ? "border-red-500" : "border-gray-200",
                                                    "focus:ring-2 focus:ring-secondary focus:border-secondary disabled:opacity-50"
                                                )}
                                            >
                                                {isLoadingSchools ? "Memuat data sekolah..." : formData.school || "Pilih sekolah"}
                                                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isSchoolOpen && "transform rotate-180")} />
                                            </button>
                                            {isSchoolOpen && (
                                                <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                                                    <div className="p-2 border-b border-gray-200">
                                                        <div className="relative">
                                                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                            <Input
                                                                type="text"
                                                                value={schoolSearch}
                                                                onChange={handleSchoolSearch}
                                                                placeholder="Cari sekolah..."
                                                                className="pl-8 h-8 w-full border-gray-200 focus:ring-2 focus:ring-secondary focus:border-secondary rounded-lg text-xs"
                                                                aria-label="Cari nama sekolah"
                                                            />
                                                        </div>
                                                    </div>
                                                    {isLoadingSchools ? (
                                                        <div className="px-4 py-2 text-xs sm:text-sm text-gray-500">Memuat data sekolah...</div>
                                                    ) : schoolsError ? (
                                                        <div className="px-4 py-2 text-xs sm:text-sm text-red-600">Gagal memuat data sekolah</div>
                                                    ) : filteredSchools.length === 0 ? (
                                                        <div className="px-4 py-2 text-xs sm:text-sm text-gray-500">Sekolah tidak ditemukan</div>
                                                    ) : (
                                                        filteredSchools.map((school) => (
                                                            <button
                                                                key={school.nama_sekolah}
                                                                type="button"
                                                                onClick={() => handleSelectChange("school", school.nama_sekolah)}
                                                                className="block w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-secondary/10"
                                                            >
                                                                {school.nama_sekolah}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {errors.school && <p className="text-red-600 text-xs mt-0.5">{errors.school}</p>}
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-9 sm:h-10 bg-secondary hover:bg-secondary/90 text-white font-medium text-xs sm:text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                                disabled={registerMutation.isPending || remainingAttempts <= 0}
                            >
                                {registerMutation.isPending ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Memproses...
                                    </div>
                                ) : remainingAttempts <= 0 ? (
                                    "Batas Percobaan Habis"
                                ) : (
                                    "Daftar Sekarang"
                                )}
                            </Button>

                            {errors.submit && <p className="text-red-600 text-xs sm:text-sm text-center">{errors.submit}</p>}

                            <div className="text-center text-xs sm:text-sm text-gray-600 mt-3">
                                Sudah punya akun?{" "}
                                <Link href="/login" prefetch={true} className="text-secondary font-medium hover:underline hover:text-secondary/80" aria-label="Masuk ke akun yang sudah ada">
                                    Masuk
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="flex-1 hidden md:block bg-background overflow-hidden">
                <div className="relative h-full w-full flex items-center justify-center p-12">
                    <Image
                        src="/register_guru.svg"
                        alt="Teacher Registration Illustration"
                        fill
                        className="object-cover drop-shadow-xl animate-float"
                        priority
                        style={{ objectPosition: "center" }}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
                    />
                </div>
            </div>
        </div>
    );
}