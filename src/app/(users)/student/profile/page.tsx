"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ChevronLeft, User, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

// Konstanta untuk validasi dan konfigurasi
const PHONE_LENGTH = 12;
const MIN_NAME_LENGTH = 2;
const MIN_NISN_LENGTH = 5;
const SUCCESS_MESSAGE_TIMEOUT = 3000;

// Skema validasi form
const formSchema = z.object({
    email: z.string().email({ message: "Alamat email tidak valid" }),
    nisn: z.string().min(MIN_NISN_LENGTH, { message: `NISN harus diisi` }),
    full_name: z.string().min(MIN_NAME_LENGTH, {
        message: `Nama minimal ${MIN_NAME_LENGTH} karakter`,
    }),
    phone: z
        .string()
        .refine(
            (val) => {
                const cleaned = val.replace(/\D/g, "");
                return cleaned.length === PHONE_LENGTH;
            },
            { message: `Nomor telepon harus ${PHONE_LENGTH} digit` }
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
    class_name: z.string().min(1, { message: "Kelas harus diisi" }),
    school: z.string().min(2, { message: "Sekolah harus dipilih" }),
    disability: z.string().optional(),
});

// Interface untuk data sekolah
interface SchoolData {
    nama_sekolah: string;
}

// Interface untuk data profil
interface ProfileData {
    email: string;
    nisn: string;
    full_name: string;
    phone: string;
    birth_date: string;
    gender: "Laki-Laki" | "Perempuan" | "Lainnya";
    class_name: string;
    school: string;
    disability: string;
    nama_lengkap?: string;
    nomor_telepon?: string;
    tanggal_lahir?: string;
    jenis_kelamin?: string;
    kelas?: string;
    nama_sekolah?: string;
    penyandang_disabilitas?: string | null;
}

// Interface untuk navbar dan sidebar
interface NavbarSidebarData {
    nama_lengkap: string;
    kelas: string;
    nama_sekolah: string;
    jenis_kelamin: "Laki-Laki" | "Perempuan" | "Lainnya";
}

// Interface untuk detail error
interface ErrorDetail {
    msg: string;
}

export default function ProfileStudentPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            nisn: "",
            full_name: "",
            phone: "",
            birth_date: "",
            gender: "Laki-Laki",
            class_name: "",
            school: "",
            disability: "",
        },
    });

    // Fetch data profil menggunakan useQuery
    const {
        data: user,
        isLoading: profileLoading,
        error: profileError,
    } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const response = await api.get("/siswa/profil");
            const profileData = response.data;
            const [d, m, y] = profileData.tanggal_lahir.split("-");
            const formattedDate = `${y}-${m}-${d}`;
            return {
                ...profileData,
                birth_date: formattedDate,
                full_name: profileData.nama_lengkap,
                phone: profileData.nomor_telepon,
                class_name: profileData.kelas,
                school: profileData.nama_sekolah,
                disability: profileData.penyandang_disabilitas || "",
                gender: profileData.jenis_kelamin,
            } as ProfileData;
        },
    });

    // Fetch data sekolah menggunakan useQuery
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
        enabled: isEditing,
    });

    // Mutasi untuk update profil
    const updateProfileMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const [y, m, d] = values.birth_date.split("-");
            const formattedBirthDate = `${d}-${m}-${y}`;
            const payload = {
                nama_lengkap: values.full_name,
                nomor_telepon: values.phone.replace(/\D/g, ""),
                tanggal_lahir: formattedBirthDate,
                jenis_kelamin: values.gender,
                kelas: values.class_name,
                nama_sekolah: values.school,
                penyandang_disabilitas: values.disability || null,
            };
            return await api.put("/siswa/profil", payload);
        },
        onSuccess: (_, values) => {
            // Update cache untuk profile
            queryClient.setQueryData(["profile"], (old: ProfileData | undefined) => ({
                ...old,
                nama_lengkap: values.full_name,
                nomor_telepon: values.phone,
                tanggal_lahir: values.birth_date,
                jenis_kelamin: values.gender,
                kelas: values.class_name,
                nama_sekolah: values.school,
                penyandang_disabilitas: values.disability,
                birth_date: values.birth_date,
                full_name: values.full_name,
                phone: values.phone,
                class_name: values.class_name,
                school: values.school,
                disability: values.disability,
                gender: values.gender,
            }));

            // Update cache untuk navbar-data
            queryClient.setQueryData(["navbarData"], (old: NavbarSidebarData | undefined) => ({
                ...old,
                nama_lengkap: values.full_name,
                kelas: values.class_name,
                nama_sekolah: values.school,
                jenis_kelamin: values.gender,
            }));

            // Update cache untuk sidebar-data
            queryClient.setQueryData(["sidebarData"], (old: NavbarSidebarData | undefined) => ({
                ...old,
                nama_lengkap: values.full_name,
                kelas: values.class_name,
                nama_sekolah: values.school,
                jenis_kelamin: values.gender,
            }));

            setIsEditing(false);
            setSuccess("Profil berhasil diperbarui");
        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                if (err.code === "ERR_NETWORK") {
                    form.setError("root", {
                        message: "Gagal terhubung ke server. Pastikan backend aktif.",
                    });
                } else if (err.response) {
                    const errorDetail = err.response.data.detail;
                    form.setError("root", {
                        message: Array.isArray(errorDetail) ? (errorDetail as ErrorDetail[]).map((e) => e.msg).join(", ") : errorDetail || "Gagal memperbarui profil",
                    });
                } else {
                    form.setError("root", {
                        message: "Gagal memperbarui profil: " + err.message,
                    });
                }
            } else {
                form.setError("root", {
                    message: "Terjadi kesalahan yang tidak diketahui",
                });
            }
        },
        onSettled: () => {
            setIsSubmitting(false);
        },
    });

    // Reset form saat data user berubah
    useEffect(() => {
        if (user && !isEditing) {
            form.reset({
                email: user.email,
                nisn: user.nisn,
                full_name: user.full_name,
                phone: user.phone,
                birth_date: user.birth_date,
                gender: user.gender,
                class_name: user.class_name,
                school: user.school,
                disability: user.disability,
            });
        }
    }, [user, isEditing, form]);

    // Auto-hide pesan sukses
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(null);
            }, SUCCESS_MESSAGE_TIMEOUT);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // Tutup dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Handler untuk toggle dropdown
    const handleDropdownToggle = useCallback(() => {
        setScrollPosition(window.scrollY);
        setIsDropdownOpen((prev) => !prev);
    }, []);

    // Handler untuk memilih sekolah
    const handleSchoolSelect = useCallback(
        (school: string) => {
            form.setValue("school", school);
            setIsDropdownOpen(false);
            window.scrollTo(0, scrollPosition);
        },
        [form, scrollPosition]
    );

    // Handler untuk submit form
    const onSubmit = useCallback(
        (values: z.infer<typeof formSchema>) => {
            setIsSubmitting(true);
            updateProfileMutation.mutate(values);
        },
        [updateProfileMutation]
    );

    if (profileLoading) {
        return (
            <div className="mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto animate-spin text-primary" />
                    <p className="text-gray-600 text-base sm:text-lg font-medium">Memuat profil siswa...</p>
                </div>
            </div>
        );
    }

    if (profileError) {
        return (
            <div className="mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm w-full max-w-md">
                    Gagal memuat data profil. Pastikan server backend aktif.
                    <Button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-primary hover:bg-primary/90 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-200 w-full sm:w-auto"
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
                            className="bg-white text-primary border-gray-200 hover:bg-primary/10 hover:text-primary flex items-center transition-colors duration-200 rounded-full px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                            aria-label="Kembali ke halaman sebelumnya"
                        >
                            <ChevronLeft className="mr-1 sm:mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                        <div className="space-y-3">
                            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary flex items-center">
                                <User className="mr-2 h-6 w-6 sm:h-8 sm:w-8" />
                                Profil Siswa
                            </CardTitle>
                            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl">{isEditing ? "Perbarui informasi Anda" : "Lihat informasi pribadi Anda"}</p>
                        </div>
                        {!isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="bg-primary hover:bg-primary/90 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-200 w-full sm:w-auto text-sm"
                                aria-label="Edit profil"
                            >
                                Edit Profil
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    {form.formState.errors.root && (
                        <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg shadow-sm mb-6 w-full max-w-2xl">
                            {form.formState.errors.root.message}
                            <Button variant="ghost" size="sm" onClick={() => form.clearErrors("root")} className="mt-2 w-full text-center sm:w-auto" aria-label="Tutup pesan error">
                                Tutup
                            </Button>
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-sm mb-6 w-full max-w-full flex items-center" aria-live="polite">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            {success}
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
                                                <Input {...field} disabled className="border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-100 text-sm" aria-describedby="email-error" />
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
                                name="nisn"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm">NISN</FormLabel>
                                        <FormControl>
                                            {isEditing ? (
                                                <Input {...field} disabled className="border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-100 text-sm" aria-describedby="nisn-error" />
                                            ) : (
                                                <div className="text-gray-800 text-sm sm:text-base">{field.value}</div>
                                            )}
                                        </FormControl>
                                        <FormMessage id="nisn-error" className="text-red-500 text-xs" />
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
                                                    className="border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
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
                                                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, PHONE_LENGTH);
                                                        field.onChange(cleaned);
                                                    }}
                                                    placeholder="081234567890"
                                                    className="border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
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
                                                <Input type="date" {...field} className="border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm" aria-describedby="birth_date-error" />
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
                                                            <RadioGroupItem value="Laki-Laki" className="border-gray-300 text-primary" />
                                                        </FormControl>
                                                        <FormLabel className="text-gray-700 text-xs sm:text-sm">Laki-Laki</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="Perempuan" className="border-gray-300 text-primary" />
                                                        </FormControl>
                                                        <FormLabel className="text-gray-700 text-xs sm:text-sm">Perempuan</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="Lainnya" className="border-gray-300 text-primary" />
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
                                name="class_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm">Kelas</FormLabel>
                                        <FormControl>
                                            {isEditing ? (
                                                <Input {...field} className="border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm" placeholder="Masukkan kelas Anda" aria-describedby="class_name-error" />
                                            ) : (
                                                <div className="text-gray-800 text-sm sm:text-base">{field.value}</div>
                                            )}
                                        </FormControl>
                                        <FormMessage id="class_name-error" className="text-red-500 text-xs" />
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
                                                            <Loader2 className="w-4 h-4 mr-2 inline-block animate-spin text-primary" />
                                                            Memuat daftar sekolah...
                                                        </div>
                                                    ) : schoolsError ? (
                                                        <div className="text-red-500 text-xs sm:text-sm">⚠️ Gagal memuat daftar sekolah</div>
                                                    ) : (
                                                        <div ref={dropdownRef} className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={handleDropdownToggle}
                                                                className="w-full px-3 py-2 text-sm text-left bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary flex justify-between items-center"
                                                                aria-expanded={isDropdownOpen}
                                                                aria-controls="school-dropdown"
                                                            >
                                                                <span className={field.value ? "text-gray-800" : "text-gray-500"}>{field.value || "Pilih sekolah"}</span>
                                                                {isDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                            </button>
                                                            {isDropdownOpen && (
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
                            <FormField
                                control={form.control}
                                name="disability"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm">Penyandang Disabilitas</FormLabel>
                                        <FormControl>
                                            {isEditing ? (
                                                <Input
                                                    {...field}
                                                    placeholder="Jika ada, sebutkan jenis disabilitas"
                                                    className="border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                                    aria-describedby="disability-error"
                                                />
                                            ) : (
                                                <div className="text-gray-800 text-sm sm:text-base">{field.value || "Tidak ada"}</div>
                                            )}
                                        </FormControl>
                                        <FormMessage id="disability-error" className="text-red-500 text-xs" />
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
                                            form.reset();
                                        }}
                                        disabled={isSubmitting}
                                        className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full px-4 sm:px-6 py-2 sm:py-3 transition-all duration-200 w-full sm:w-auto text-sm"
                                        aria-label="Batalkan perubahan"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-primary hover:bg-primary/90 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-200 w-full sm:w-auto text-sm"
                                        aria-label="Simpan perubahan profil"
                                    >
                                        {isSubmitting ? (
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
