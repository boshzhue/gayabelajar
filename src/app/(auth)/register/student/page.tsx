"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, User, Mail, Phone, Calendar, Lock, Hash, ChevronDown, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/axios";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Konstanta untuk validasi dan konfigurasi
const MIN_NISN_LENGTH = 10;
const MAX_NISN_LENGTH = 20;
const PHONE_LENGTH = 12;
const MIN_PASSWORD_LENGTH = 8;
const MAX_LOGIN_ATTEMPTS = 3;
const TOAST_DURATION = 4000;
const SCHOOLS_STALE_TIME = 5 * 60 * 1000;

// Interface untuk form data, error, dan respons API
interface FormData {
    nisn: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    gender: string;
    isDisabled: boolean;
    disabilityType: string;
    school: string;
    grade: string;
    birthDate: string;
}

interface FormErrors {
    nisn?: string;
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phoneNumber?: string;
    gender?: string;
    school?: string;
    grade?: string;
    birthDate?: string;
    submit?: string;
}

interface PasswordVisibility {
    password: boolean;
    confirmPassword: boolean;
}

interface SchoolNameResponse {
    nama_sekolah: string;
}

export default function RegisterStudentPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        nisn: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        gender: "",
        isDisabled: false,
        disabilityType: "",
        school: "",
        grade: "",
        birthDate: "",
    });
    const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibility>({ password: false, confirmPassword: false });
    const [errors, setErrors] = useState<FormErrors>({});
    const [remainingAttempts, setRemainingAttempts] = useState(MAX_LOGIN_ATTEMPTS);
    const [isGenderOpen, setIsGenderOpen] = useState(false);
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
    const filteredSchools = schools.filter((school) => school.nama_sekolah.toLowerCase().includes(schoolSearch.toLowerCase()));

    // Efek untuk scroll ke input aktif pada layar kecil
    useEffect(() => {
        if (window.innerWidth >= 768) return;

        const handleFocus = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.closest(".title-section")) return;
            setTimeout(() => {
                target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
            }, 300);
        };

        const inputs = document.querySelectorAll("input, button");
        inputs.forEach((input) => input.addEventListener("focus", handleFocus));

        return () => {
            inputs.forEach((input) => input.removeEventListener("focus", handleFocus));
        };
    }, []);

    // Handler untuk perubahan input
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        let processedValue = value;

        if (id === "phoneNumber") {
            processedValue = value.replace(/[^0-9\- ]/g, "");
        }

        setFormData((prev) => ({
            ...prev,
            [id]: id === "grade" ? processedValue.toUpperCase() : processedValue,
        }));
    }, []);

    // Handler untuk perubahan dropdown
    const handleSelectChange = useCallback((field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === "gender") setIsGenderOpen(false);
        if (field === "school") {
            setIsSchoolOpen(false);
            setSchoolSearch("");
        }
    }, []);

    // Handler untuk checkbox disabilitas
    const handleDisabilityChange = useCallback((checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            isDisabled: checked,
            disabilityType: checked ? prev.disabilityType : "",
        }));
    }, []);

    // Handler untuk input pencarian sekolah
    const handleSchoolSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSchoolSearch(e.target.value);
    }, []);

    // Validasi form
    const validateForm = useCallback((): FormErrors => {
        const newErrors: FormErrors = {};

        if (!formData.nisn) newErrors.nisn = "NISN harus diisi";
        else if (!/^\d{10,20}$/.test(formData.nisn)) newErrors.nisn = `NISN harus ${MIN_NISN_LENGTH}-${MAX_NISN_LENGTH} digit angka`;

        if (!formData.name) newErrors.name = "Nama lengkap harus diisi";

        if (!formData.email) newErrors.email = "Email harus diisi";
        else if (!formData.email.endsWith("@gmail.com")) newErrors.email = "Email harus menggunakan domain @gmail.com";

        const pw = formData.password;
        if (!pw) newErrors.password = "Kata sandi harus diisi";
        else if (pw.length < MIN_PASSWORD_LENGTH) newErrors.password = `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter`;
        else if (!/[A-Z]/.test(pw)) newErrors.password = "Kata sandi harus mengandung huruf besar";
        else if (!/\d/.test(pw)) newErrors.password = "Kata sandi harus mengandung angka";

        if (!formData.confirmPassword) newErrors.confirmPassword = "Konfirmasi kata sandi harus diisi";
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Konfirmasi kata sandi tidak cocok";

        if (!formData.birthDate) newErrors.birthDate = "Tanggal lahir harus diisi";

        if (!formData.phoneNumber) newErrors.phoneNumber = "Nomor telepon harus diisi";
        else {
            const cleanedPhone = formData.phoneNumber.replace(/\D/g, "");
            if (cleanedPhone.length !== PHONE_LENGTH) newErrors.phoneNumber = `Harus ${PHONE_LENGTH} digit (contoh: 081234567890)`;
            else if (!cleanedPhone.startsWith("08")) newErrors.phoneNumber = "Harus dimulai dengan 08 (contoh: 081234567890)";
        }

        if (!formData.gender) newErrors.gender = "Jenis kelamin harus dipilih";
        if (!formData.school) newErrors.school = "Nama sekolah harus diisi";
        if (!formData.grade) newErrors.grade = "Kelas harus diisi";

        return newErrors;
    }, [formData]);

    // Mutasi untuk registrasi
    const registerMutation = useMutation({
        mutationFn: async () => {
            const birthDate = new Date(formData.birthDate);
            if (isNaN(birthDate.getTime())) throw new Error("Format tanggal lahir tidak valid");

            const formattedBirthDate = `${String(birthDate.getDate()).padStart(2, "0")}-${String(birthDate.getMonth() + 1).padStart(2, "0")}-${birthDate.getFullYear()}`;

            const requestData = {
                nisn: formData.nisn,
                nama_lengkap: formData.name,
                email: formData.email,
                nomor_telepon: formData.phoneNumber.replace(/^\+/, ""),
                password: formData.password,
                confirm_password: formData.confirmPassword,
                tanggal_lahir: formattedBirthDate,
                jenis_kelamin: formData.gender,
                kelas: formData.grade,
                nama_sekolah: formData.school,
                penyandang_disabilitas: formData.isDisabled ? formData.disabilityType : null,
            };

            const response = await api.post("/siswa/register", requestData, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success("Registrasi berhasil! Mengarahkan ke login...", {
                duration: TOAST_DURATION,
                position: "top-center",
            });
            setTimeout(() => router.push("/login"), 2000);
        },
        onError: (error: unknown) => {
            let errorMessage = "Terjadi kesalahan saat registrasi";

            const axiosError = error as AxiosError<{ detail?: string }>;

            if (axiosError.response) {
                const status = axiosError.response.status;
                const detail = axiosError.response.data?.detail;

                if (status === 429) {
                    errorMessage = `Terlalu banyak percobaan. Silakan coba lagi nanti. (${remainingAttempts - 1} percobaan tersisa)`;
                } else {
                    errorMessage = detail || axiosError.message;
                }
            } else if (axiosError.message) {
                errorMessage = axiosError.message;
            }

            setRemainingAttempts((prev) => Math.max(prev - 1, 0));
            toast.error(errorMessage, { duration: TOAST_DURATION, position: "top-center" });
        },
    });

    // Handler untuk submit form
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
        <div className="min-h-screen w-full flex bg-white">
            <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <Card className="w-full max-w-2xl mx-auto max-h-[calc(100vh-2rem)] flex flex-col bg-white border-0 shadow-none">
                    <CardContent className="p-4 sm:p-6 flex-1 overflow-y-auto">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col items-start title-section relative z-10">
                                <div className="pt-2 sm:pt-4">
                                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-1 flex items-center">Daftar Akun Siswa</h1>
                                    <p className="text-gray-600 text-xs sm:text-sm max-w-xl">Cari tahu gaya belajarmu.</p>
                                    <div className="mt-2 w-10 h-1 bg-primary/30 rounded-full" />
                                </div>
                            </div>

                            {/* Informasi Pribadi */}
                            <div className="space-y-3">
                                <div className="pb-1 border-b border-primary/20">
                                    <h2 className="text-base sm:text-lg font-semibold text-primary">Informasi Pribadi</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="nisn" className="text-primary font-medium text-xs sm:text-sm">
                                            NISN
                                        </Label>
                                        <div className="relative">
                                            <Hash className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                id="nisn"
                                                type="text"
                                                value={formData.nisn}
                                                onChange={handleChange}
                                                placeholder="10-20 digit angka"
                                                className="pl-7 sm:pl-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Masukkan NISN"
                                            />
                                        </div>
                                        {errors.nisn && <p className="text-red-600 text-xs mt-0.5">{errors.nisn}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="name" className="text-primary font-medium text-xs sm:text-sm">
                                            Nama Lengkap
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                id="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Nama sesuai ijazah"
                                                className="pl-7 sm:pl-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Masukkan nama lengkap"
                                            />
                                        </div>
                                        {errors.name && <p className="text-red-600 text-xs mt-0.5">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="birthDate" className="text-primary font-medium text-xs sm:text-sm">
                                            Tanggal Lahir
                                        </Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                id="birthDate"
                                                type="date"
                                                value={formData.birthDate}
                                                onChange={handleChange}
                                                className="pl-7 sm:pl-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Pilih tanggal lahir"
                                            />
                                        </div>
                                        {errors.birthDate && <p className="text-red-600 text-xs mt-0.5">{errors.birthDate}</p>}
                                    </div>

                                    <div className="space-y-1 relative">
                                        <Label className="text-primary font-medium text-xs sm:text-sm">Jenis Kelamin</Label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsGenderOpen(!isGenderOpen)}
                                                className={cn(
                                                    "flex items-center justify-between w-full h-9 sm:h-10 pl-3 pr-2 border rounded-lg text-left text-xs sm:text-sm bg-background",
                                                    errors.gender ? "border-red-500" : "border-gray-200",
                                                    "focus:ring-2 focus:ring-primary focus:border-primary"
                                                )}
                                            >
                                                {formData.gender || "Pilih jenis kelamin"}
                                                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isGenderOpen && "transform rotate-180")} />
                                            </button>
                                            {isGenderOpen && (
                                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                                    <button type="button" onClick={() => handleSelectChange("gender", "Laki-Laki")} className="block w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-primary/10">
                                                        Laki-Laki
                                                    </button>
                                                    <button type="button" onClick={() => handleSelectChange("gender", "Perempuan")} className="block w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-primary/10">
                                                        Perempuan
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {errors.gender && <p className="text-red-600 text-xs mt-0.5">{errors.gender}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="phoneNumber" className="text-primary font-medium text-xs sm:text-sm">
                                            Nomor Telepon
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                id="phoneNumber"
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                placeholder="085787654676"
                                                className="pl-7 sm:pl-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Masukkan nomor telepon"
                                            />
                                        </div>
                                        {errors.phoneNumber && <p className="text-red-600 text-xs mt-0.5">{errors.phoneNumber}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="isDisabled"
                                                checked={formData.isDisabled}
                                                onCheckedChange={handleDisabilityChange}
                                                className="border-2 border-gray-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                aria-label="Penyandang disabilitas"
                                            />
                                            <Label htmlFor="isDisabled" className="text-primary font-medium text-xs sm:text-sm">
                                                Penyandang Disabilitas
                                            </Label>
                                        </div>
                                        {formData.isDisabled && (
                                            <div className="space-y-1 animate-fade-in">
                                                <Label htmlFor="disabilityType" className="text-primary font-medium text-xs sm:text-sm">
                                                    Jenis Disabilitas
                                                </Label>
                                                <div className="relative">
                                                    <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                                    <Input
                                                        id="disabilityType"
                                                        type="text"
                                                        value={formData.disabilityType}
                                                        onChange={handleChange}
                                                        placeholder="Contoh: Tuna Rungu, Low Vision, dll."
                                                        className="pl-7 sm:pl-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                        aria-label="Masukkan jenis disabilitas"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Informasi Akun */}
                            <div className="space-y-3">
                                <div className="pb-1 border-b border-primary/20">
                                    <h2 className="text-base sm:text-lg font-semibold text-primary">Informasi Akun</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="email" className="text-primary font-medium text-xs sm:text-sm">
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
                                                className="pl-7 sm:pl-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Masukkan alamat email"
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-600 text-xs mt-0.5">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="password" className="text-primary font-medium text-xs sm:text-sm">
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
                                                className="pl-7 sm:pl-9 pr-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Masukkan kata sandi"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPasswordVisibility((prev) => ({ ...prev, password: !prev.password }))}
                                                className="absolute inset-y-0 right-2 text-gray-400 hover:text-primary transition-colors"
                                                aria-label={passwordVisibility.password ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                                            >
                                                {passwordVisibility.password ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-600 text-xs mt-0.5">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="confirmPassword" className="text-primary font-medium text-xs sm:text-sm">
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
                                                className="pl-7 sm:pl-9 pr-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                                                aria-label="Konfirmasi kata sandi"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPasswordVisibility((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                                                className="absolute inset-y-0 right-2 text-gray-400 hover:text-primary transition-colors"
                                                aria-label={passwordVisibility.confirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
                                            >
                                                {passwordVisibility.confirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-600 text-xs mt-0.5">{errors.confirmPassword}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Informasi Sekolah */}
                            <div className="space-y-3">
                                <div className="pb-1 border-b border-primary/20">
                                    <h2 className="text-base sm:text-lg font-semibold text-primary">Informasi Sekolah</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
                                    <div className="space-y-1 bg-white relative">
                                        <Label className="text-primary font-medium text-xs sm:text-sm">Sekolah</Label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsSchoolOpen(!isSchoolOpen)}
                                                disabled={isLoadingSchools}
                                                className={cn(
                                                    "flex items-center justify-between w-full h-9 sm:h-10 pl-3 pr-2 border rounded-lg text-left text-xs sm:text-sm bg-background",
                                                    errors.school ? "border-red-500" : "border-gray-200",
                                                    "focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
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
                                                                className="pl-8 h-8 w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg text-xs"
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
                                                                className="block w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-primary/10"
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

                                    <div className="space-y-1">
                                        <Label htmlFor="grade" className="text-primary font-medium text-xs sm:text-sm">
                                            Kelas
                                        </Label>
                                        <div className="relative">
                                            <Hash className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                            <Input
                                                id="grade"
                                                type="text"
                                                value={formData.grade}
                                                onChange={handleChange}
                                                placeholder="Contoh: XII IPA 1"
                                                className="pl-7 sm:pl-9 h-9 sm:h-10 w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg text-xs sm:text-sm bg-background uppercase placeholder:text-gray-400"
                                                aria-label="Masukkan kelas"
                                            />
                                        </div>
                                        {errors.grade && <p className="text-red-600 text-xs mt-0.5">{errors.grade}</p>}
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-9 sm:h-10 bg-primary hover:bg-primary/90 text-white font-medium text-xs sm:text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200"
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
                                <Link href="/login" prefetch={true} className="text-primary font-medium hover:underline hover:text-primary/80" aria-label="Masuk ke akun yang sudah ada">
                                    Masuk
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="flex-1 hidden md:block bg-background overflow-hidden">
                <div className="relative h-full w-full flex items-center justify-center p-12">
                    <Image src="/register_siswa.svg" alt="Student Registration Illustration" fill className="object-cover drop-shadow-xl animate-float" priority sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw" />
                </div>
            </div>
        </div>
    );
}
