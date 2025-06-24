"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ChevronLeft, User, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

// Konstanta untuk konfigurasi dan styling
const SUCCESS_TIMEOUT_MS = 3000;
const EDUCATION_LEVELS = [
    { value: "D3", label: "Diploma 3 (D3)" },
    { value: "D4", label: "Diploma 4 (D4)" },
    { value: "S1", label: "Sarjana (S1)" },
    { value: "S2", label: "Magister (S2)" },
    { value: "S3", label: "Doktor (S3)" },
] as const;

// Skema validasi menggunakan Zod
const formSchema = z.object({
    email: z.string().email({ message: "Alamat email tidak valid" }),
    nip: z.string().length(18, { message: "NIP harus 18 digit" }),
    full_name: z.string().min(2, { message: "Nama minimal 2 karakter" }),
    phone: z
        .string()
        .refine(
            (val) => {
                const cleaned = val.replace(/\D/g, "");
                return cleaned.length === 12;
            },
            { message: "Nomor telepon harus 12 digit" }
        )
        .refine(
            (val) => {
                const cleaned = val.replace(/\D/g, "");
                return cleaned.startsWith("08");
            },
            { message: "Nomor telepon harus dimulai dengan 08" }
        ),
    birth_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Format tanggal tidak valid",
    }),
    gender: z.enum(["Laki-Laki", "Perempuan", "Lainnya"], {
        required_error: "Jenis kelamin harus dipilih",
    }),
    education_level: z.enum(["D3", "D4", "S1", "S2", "S3"], {
        required_error: "Tingkat pendidikan harus dipilih",
    }),
    school: z.string().min(2, { message: "Sekolah harus dipilih" }),
});

// Interface untuk data
interface SchoolData {
    nama_sekolah: string;
}

interface TeacherData {
    email: string;
    nip: string;
    full_name: string;
    phone: string;
    birth_date: string;
    gender: "Laki-Laki" | "Perempuan" | "Lainnya";
    education_level: "D3" | "D4" | "S1" | "S2" | "S3";
    school: string;
}

export default function TeacherProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
    const [isEducationDropdownOpen, setIsEducationDropdownOpen] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const schoolDropdownRef = useRef<HTMLDivElement>(null);
    const educationDropdownRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            nip: "",
            full_name: "",
            phone: "",
            birth_date: "",
            gender: "Laki-Laki",
            education_level: undefined,
            school: "",
        },
    });

    // Fetch profile data using TanStack Query
    const {
        data: teacher,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["teacherProfile"],
        queryFn: async () => {
            const response = await api.get("/guru/profil");
            const profileData = response.data;
            const [d, m, y] = profileData.tanggal_lahir.split("-");
            const formattedDate = `${y}-${m}-${d}`; // Convert DD-MM-YYYY to YYYY-MM-DD
            return {
                email: profileData.email,
                nip: profileData.nip,
                full_name: profileData.nama_lengkap,
                phone: profileData.nomor_telepon,
                birth_date: formattedDate,
                gender: profileData.jenis_kelamin,
                education_level: profileData.tingkat_pendidikan,
                school: profileData.nama_sekolah,
            } as TeacherData;
        },
    });

    // Fetch schools data
    const {
        data: schools = [],
        isLoading: schoolsLoading,
        error: schoolsError,
    } = useQuery({
        queryKey: ["schools"],
        queryFn: async () => {
            const response = await api.get("/auth/sekolah");
            return response.data as SchoolData[];
        },
        enabled: isEditing, // Only fetch when editing
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const payload = {
                nama_lengkap: values.full_name,
                nomor_telepon: values.phone.replace(/\D/g, ""),
                tanggal_lahir: values.birth_date,
                jenis_kelamin: values.gender,
                tingkat_pendidikan: values.education_level,
                nama_sekolah: values.school,
            };
            await api.put("/guru/profilupdate", payload);
            return values;
        },
        onSuccess: () => {
            // Update local state
            setIsEditing(false);
            // Invalidate queries to trigger refetch in navbar and sidebar
            queryClient.invalidateQueries({ queryKey: ["teacherProfile"] });
            queryClient.invalidateQueries({ queryKey: ["teacherNavbarData"] });
            queryClient.invalidateQueries({ queryKey: ["teacherSidebarData"] });
            // Set success message
            form.setError("root", { message: "Profil berhasil diperbarui" });
            setTimeout(() => form.clearErrors("root"), SUCCESS_TIMEOUT_MS);
        },
        onError: (err) => {
            let errorMsg = "Gagal memperbarui profil";
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 400) {
                    errorMsg = err.response.data.detail || "Data tidak valid. Silakan periksa input Anda.";
                } else if (err.code === "ERR_NETWORK") {
                    errorMsg = "Gagal terhubung ke server. Pastikan backend aktif di " + process.env.NEXT_PUBLIC_API_URL;
                } else if (err.response) {
                    const errorDetail = err.response.data.detail;
                    errorMsg = Array.isArray(errorDetail) ? errorDetail.map((e: { msg: string }) => e.msg).join(", ") : errorDetail || "Gagal memperbarui profil";
                }
            }
            form.setError("root", { message: errorMsg });
            console.error("Update error:", err);
        },
    });

    // Reset form when teacher data changes
    useEffect(() => {
        if (teacher) {
            form.reset(teacher);
        }
    }, [teacher, form]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target as Node)) {
                setIsSchoolDropdownOpen(false);
            }
            if (educationDropdownRef.current && !educationDropdownRef.current.contains(e.target as Node)) {
                setIsEducationDropdownOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleSchoolDropdownToggle = useCallback(() => {
        setScrollPosition(window.scrollY);
        setIsSchoolDropdownOpen((prev) => !prev);
        setIsEducationDropdownOpen(false);
    }, []);

    const handleEducationDropdownToggle = useCallback(() => {
        setScrollPosition(window.scrollY);
        setIsEducationDropdownOpen((prev) => !prev);
        setIsSchoolDropdownOpen(false);
    }, []);

    const handleSchoolSelect = useCallback(
        (school: string) => {
            form.setValue("school", school);
            setIsSchoolDropdownOpen(false);
            window.scrollTo(0, scrollPosition);
        },
        [form, scrollPosition]
    );

    const handleEducationSelect = useCallback(
        (level: string) => {
            form.setValue("education_level", level as "D3" | "D4" | "S1" | "S2" | "S3");
            setIsEducationDropdownOpen(false);
            window.scrollTo(0, scrollPosition);
        },
        [form, scrollPosition]
    );

    const onSubmit = useCallback(
        (values: z.infer<typeof formSchema>) => {
            updateProfileMutation.mutate(values);
        },
        [updateProfileMutation]
    );

    if (isLoading && !teacher && !error) {
        return (
            <div className="mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto animate-spin text-secondary" />
                    <p className="text-gray-600 text-base sm:text-lg font-medium">Memuat profil guru...</p>
                </div>
            </div>
        );
    }

    if (error && !teacher) {
        return (
            <div className="mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm w-full max-w-md">
                    {axios.isAxiosError(error) && error.response?.status === 404 ? "Profil guru tidak ditemukan" : "Gagal memuat data profil. Pastikan server backend aktif."}
                    <Button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-secondary hover:bg-secondary/90 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-200 w-full sm:w-auto"
                        aria-label="Coba kembali memuat profil"
                    >
                        Coba Lagi
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto space-y-6 sm:p-6 lg:p-8 min-h-screen max-w-7xl" style={{ overflowAnchor: "auto" }}>
            <Card className="bg-white shadow-lg border border-gray-100 rounded-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-4 sm:p-6 lg:p-10 border-b border-gray-100">
                    <div className="flex justify-start mb-4">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="bg-white text-secondary border-gray-200 hover:bg-secondary/10 hover:text-secondary flex items-center transition-colors duration-200 rounded-full px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                            aria-label="Kembali ke halaman sebelumnya"
                        >
                            <ChevronLeft className="mr-1 sm:mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                        <div className="space-y-3">
                            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary flex items-center">
                                <User className="mr-2 h-6 w-6 sm:h-8 sm:w-8" />
                                Profil Guru
                            </CardTitle>
                            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl">{isEditing ? "Perbarui informasi pribadi Anda" : "Lihat informasi pribadi Anda"}</p>
                        </div>
                        {!isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="bg-secondary hover:bg-secondary/90 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-200 w-full sm:w-auto text-sm"
                                aria-label="Edit profil guru"
                            >
                                Edit Profil
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 lg:p-10">
                    {form.formState.errors.root && (
                        <div
                            className={`border-l-4 p-4 rounded-lg shadow-sm mb-6 w-full max-w-2xl flex items-center ${
                                updateProfileMutation.isSuccess ? "bg-green-50 border-green-500 text-green-700" : "bg-red-50 border-red-500 text-red-700"
                            }`}
                            aria-live="polite"
                        >
                            {updateProfileMutation.isSuccess ? <CheckCircle className="h-5 w-5 mr-2" /> : null}
                            {form.formState.errors.root.message}
                            {!updateProfileMutation.isSuccess && (
                                <Button variant="ghost" size="sm" onClick={() => form.clearErrors("root")} className="ml-auto" aria-label="Tutup pesan error">
                                    Tutup
                                </Button>
                            )}
                        </div>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm">Email</FormLabel>
                                        <FormControl>
                                            {isEditing ? (
                                                <Input {...field} disabled className="border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary bg-gray-100 text-sm" aria-describedby="email-error" />
                                            ) : (
                                                <div className="text-gray-800 text-sm sm:text-base">{field.value}</div>
                                            )}
                                        </FormControl>
                                        <FormMessage id="email-error" className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nip"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm">NIP</FormLabel>
                                        <FormControl>
                                            {isEditing ? (
                                                <Input {...field} disabled className="border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary bg-gray-100 text-sm" aria-describedby="nip-error" />
                                            ) : (
                                                <div className="text-gray-800 text-sm sm:text-base">{field.value}</div>
                                            )}
                                        </FormControl>
                                        <FormMessage id="nip-error" className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="full_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm">Nama Lengkap</FormLabel>
                                        <FormControl>
                                            {isEditing ? (
                                                <Input
                                                    {...field}
                                                    className="border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary text-sm"
                                                    placeholder="Masukkan nama lengkap Anda"
                                                    aria-describedby="full_name-error"
                                                />
                                            ) : (
                                                <div className="text-gray-800 text-sm sm:text-base">{field.value}</div>
                                            )}
                                        </FormControl>
                                        <FormMessage id="full_name-error" className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm">Nomor Telepon</FormLabel>
                                        <FormControl>
                                            {isEditing ? (
                                                <Input
                                                    {...field}
                                                    onChange={(e) => {
                                                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 12);
                                                        field.onChange(cleaned);
                                                    }}
                                                    placeholder="081234567890"
                                                    className="border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary text-sm"
                                                    aria-describedby="phone-error"
                                                />
                                            ) : (
                                                <div className="text-gray-800 text-sm sm:text-base">{field.value.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3")}</div>
                                            )}
                                        </FormControl>
                                        <FormMessage id="phone-error" className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="birth_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm">Tanggal Lahir</FormLabel>
                                        <FormControl>
                                            {isEditing ? (
                                                <Input type="date" {...field} className="border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary text-sm" aria-describedby="birth_date-error" />
                                            ) : (
                                                <div className="text-gray-800 text-sm sm:text-base">
                                                    {new Date(field.value).toLocaleDateString("id-ID", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </div>
                                            )}
                                        </FormControl>
                                        <FormMessage id="birth_date-error" className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel id="gender-label" className="text-gray-700 font-medium text-xs sm:text-sm">
                                            Jenis Kelamin
                                        </FormLabel>
                                        <FormControl>
                                            {isEditing ? (
                                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col sm:flex-row gap-2 sm:gap-4" aria-labelledby="gender-label">
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="Laki-Laki" className="border-gray-300 text-secondary" />
                                                        </FormControl>
                                                        <FormLabel className="text-gray-700 text-xs sm:text-sm">Laki-Laki</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="Perempuan" className="border-gray-300 text-secondary" />
                                                        </FormControl>
                                                        <FormLabel className="text-gray-700 text-xs sm:text-sm">Perempuan</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="Lainnya" className="border-gray-300 text-secondary" />
                                                        </FormControl>
                                                        <FormLabel className="text-gray-700 text-xs sm:text-sm">Lainnya</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            ) : (
                                                <div className="text-gray-800 text-sm sm:text-base">{field.value}</div>
                                            )}
                                        </FormControl>
                                        <FormMessage id="gender-error" className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="education_level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm">Tingkat Pendidikan</FormLabel>
                                        <FormControl>
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    <div ref={educationDropdownRef} className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={handleEducationDropdownToggle}
                                                            className="w-full px-3 py-2 text-sm text-left bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary flex justify-between items-center"
                                                            aria-expanded={isEducationDropdownOpen}
                                                            aria-controls="education-dropdown"
                                                        >
                                                            <span className={field.value ? "text-gray-800" : "text-gray-500"}>{EDUCATION_LEVELS.find((l) => l.value === field.value)?.label || "Pilih tingkat pendidikan"}</span>
                                                            {isEducationDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        </button>
                                                        {isEducationDropdownOpen && (
                                                            <ul id="education-dropdown" className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md max-h-60 overflow-y-auto" role="listbox">
                                                                {EDUCATION_LEVELS.map((level) => (
                                                                    <li
                                                                        key={level.value}
                                                                        onClick={() => handleEducationSelect(level.value)}
                                                                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${field.value === level.value ? "bg-gray-100 font-medium" : ""}`}
                                                                        role="option"
                                                                        aria-selected={field.value === level.value}
                                                                    >
                                                                        {level.label}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-gray-800 text-sm sm:text-base">{EDUCATION_LEVELS.find((l) => l.value === field.value)?.label || field.value}</div>
                                            )}
                                        </FormControl>
                                        <FormMessage id="education_level-error" className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="school"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm">Sekolah</FormLabel>
                                        <FormControl>
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    {schoolsLoading ? (
                                                        <div className="text-gray-600 text-sm sm:text-base font-medium">
                                                            <Loader2 className="w-4 h-4 mr-2 inline-block animate-spin text-secondary" />
                                                            Memuat daftar sekolah...
                                                        </div>
                                                    ) : schoolsError ? (
                                                        <div className="text-red-500 text-xs sm:text-sm">⚠️ {schoolsError.message}</div>
                                                    ) : (
                                                        <div ref={schoolDropdownRef} className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={handleSchoolDropdownToggle}
                                                                className="w-full px-3 py-2 text-sm text-left bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary flex justify-between items-center"
                                                                aria-expanded={isSchoolDropdownOpen}
                                                                aria-controls="school-dropdown"
                                                            >
                                                                <span className={field.value ? "text-gray-800" : "text-gray-500"}>{field.value || "Pilih sekolah"}</span>
                                                                {isSchoolDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                            </button>
                                                            {isSchoolDropdownOpen && (
                                                                <ul id="school-dropdown" className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md max-h-60 overflow-y-auto" role="listbox">
                                                                    {schools.map((school) => (
                                                                        <li
                                                                            key={school.nama_sekolah}
                                                                            onClick={() => handleSchoolSelect(school.nama_sekolah)}
                                                                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${field.value === school.nama_sekolah ? "bg-gray-100 font-medium" : ""}`}
                                                                            role="option"
                                                                            aria-selected={field.value === school.nama_sekolah}
                                                                        >
                                                                            {school.nama_sekolah}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-gray-800 text-sm sm:text-base">{field.value}</div>
                                            )}
                                        </FormControl>
                                        <FormMessage id="school-error" className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            {isEditing && (
                                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditing(false);
                                            if (teacher) {
                                                form.reset(teacher);
                                            }
                                        }}
                                        disabled={updateProfileMutation.isPending}
                                        className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full px-4 sm:px-6 py-2 sm:py-3 transition-all duration-200 w-full sm:w-auto text-sm"
                                        aria-label="Batalkan perubahan"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={updateProfileMutation.isPending}
                                        className="bg-secondary hover:bg-secondary/90 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-200 w-full sm:w-auto text-sm"
                                        aria-label="Simpan perubahan profil"
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            "Simpan Perubahan"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
