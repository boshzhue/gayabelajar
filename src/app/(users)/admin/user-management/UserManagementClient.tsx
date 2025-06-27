"use client";
import { useState, useEffect, useCallback } from "react"; // Add useCallback import
import { Plus, Trash2, Search, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";

// Interface User berdasarkan schema backend
interface User {
    id: string;
    full_name: string;
    email: string;
    role: "student" | "teacher" | "admin";
    gender: string;
    school_name?: string;
    phone?: string;
}

// Interface untuk response API
interface UserResponse {
    id: number;
    nama_lengkap: string;
    email: string;
    jenis_kelamin: string;
    nama_sekolah?: string;
    nomor_telepon?: string;
}

interface ApiResponse {
    data: UserResponse[];
    total: number;
}

// Interface untuk error response
interface ApiError {
    response?: {
        data?: {
            detail?: string;
        };
    };
}

// Schema form untuk registrasi admin
const userSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter").optional(),
    full_name: z.string().min(2, "Nama minimal 2 karakter"),
    phone: z.string().optional(),
    gender: z.enum(["Laki-laki", "Perempuan"]),
    role: z.literal("admin"),
});
type UserFormData = z.infer<typeof userSchema>;

export default function UserManagementClient() {
    // State
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"student" | "teacher" | "admin">("student");
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const rowsPerPageOptions = [5, 10, 20, 50];

    // Form setup
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
    });

    // Fetch users dari backend
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            let endpoint = "";
            switch (activeTab) {
                case "student":
                    endpoint = "/admin/siswa";
                    break;
                case "teacher":
                    endpoint = "/admin/guru";
                    break;
                case "admin":
                    endpoint = "/admin/admin";
                    break;
            }

            const response = await api.get<ApiResponse>(endpoint, {
                params: {
                    search: searchQuery || undefined,
                    page: currentPage,
                    limit: rowsPerPage,
                },
            });

            const data = response.data.data.map((item: UserResponse) => ({
                id: item.id.toString(),
                full_name: item.nama_lengkap,
                email: item.email,
                role: activeTab,
                gender: item.jenis_kelamin,
                school_name: item.nama_sekolah || undefined,
                phone: item.nomor_telepon || undefined,
            }));

            setUsers(data);
            setTotalPages(Math.ceil(response.data.total / rowsPerPage));
        } catch (err: unknown) {
            let errorMessage = "Gagal memuat data pengguna";

            // Jika error adalah AxiosError
            if (typeof err === "object" && err !== null && "isAxiosError" in err) {
                const axiosError = err as {
                    response?: { data?: { detail?: string } };
                };
                if (axiosError.response?.data?.detail) {
                    errorMessage = axiosError.response.data.detail;
                }
            }

            setAlert({ type: "error", message: errorMessage });
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, searchQuery, currentPage, rowsPerPage]); // Dependencies for useCallback

    // Update useEffect to include fetchUsers
    useEffect(() => {
        fetchUsers();
    }, [activeTab, searchQuery, currentPage, rowsPerPage, fetchUsers]); // Add fetchUsers to dependency array

    // Form submission untuk tambah admin
    const onSubmit = async (data: UserFormData) => {
        setIsLoading(true);
        try {
            const payload = {
                email: data.email,
                kata_sandi: data.password || "default123",
                nama_lengkap: data.full_name,
                nomor_telepon: data.phone || "",
                jenis_kelamin: data.gender,
            };

            await api.post("/admin/register", payload);
            setOpenSuccessDialog(true);
            setTimeout(() => setOpenSuccessDialog(false), 3000);
            setOpenFormDialog(false);
            reset();
            fetchUsers();
        } catch (error: unknown) {
            const apiError = error as ApiError;
            setAlert({
                type: "error",
                message: apiError.response?.data?.detail || "Gagal menambahkan admin",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete user
    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setOpenDeleteDialog(true);
    };

    // Confirm delete user
    const confirmDeleteUser = async () => {
        if (userToDelete) {
            setIsLoading(true);
            try {
                let endpoint = "";
                switch (activeTab) {
                    case "student":
                        endpoint = `/admin/siswa/${userToDelete.id}`;
                        break;
                    case "teacher":
                        endpoint = `/admin/guru/${userToDelete.id}`;
                        break;
                    case "admin":
                        endpoint = `/admin/hapus-admin/${userToDelete.id}`;
                        break;
                }

                await api.delete(endpoint);
                setAlert({ type: "success", message: "Pengguna berhasil dihapus" });
                fetchUsers();
            } catch (error: unknown) {
                const apiError = error as ApiError;
                setAlert({
                    type: "error",
                    message: apiError.response?.data?.detail || "Gagal menghapus pengguna",
                });
            } finally {
                setIsLoading(false);
                setOpenDeleteDialog(false);
            }
        }
    };

    // Menghapus notifikasi setelah 3 detik
    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                setAlert(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    return (
        <div className="min-h-screen text-foreground">
            {alert && (
                <Alert variant={alert.type === "success" ? "default" : "destructive"}>
                    <AlertTitle>{alert.type === "success" ? "Berhasil" : "Error"}</AlertTitle>
                    <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
            )}
            <Card className="bg-white shadow-sm">
                <CardHeader className="border-b p-3 sm:p-4">
                    <CardTitle className="text-lg sm:text-xl font-semibold">Manajemen Pengguna</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                        {/* Tab Navigation */}
                        <div className="flex border-b">
                            <button className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === "student" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`} onClick={() => setActiveTab("student")}>
                                Siswa
                            </button>
                            <button className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === "teacher" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`} onClick={() => setActiveTab("teacher")}>
                                Guru
                            </button>
                            <button className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === "admin" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`} onClick={() => setActiveTab("admin")}>
                                Admin
                            </button>
                        </div>
                        {/* Search and Add Button */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={`Cari ${activeTab === "student" ? "siswa..." : activeTab === "teacher" ? "guru..." : "admin..."}`}
                                    className="pl-10 w-full rounded-lg"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    disabled={isLoading}
                                />
                            </div>
                            {activeTab === "admin" && (
                                <Button
                                    onClick={() => {
                                        reset();
                                        setOpenFormDialog(true);
                                    }}
                                    className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-all"
                                    disabled={isLoading}
                                >
                                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="text-xs sm:text-sm font-medium">Tambah Admin</span>
                                </Button>
                            )}
                        </div>
                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No</TableHead>
                                        <TableHead>Nama Lengkap</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Jenis Kelamin</TableHead>
                                        {activeTab === "admin" && <TableHead>Nomor Telepon</TableHead>}
                                        {(activeTab === "student" || activeTab === "teacher") && <TableHead>Nama Sekolah</TableHead>}
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={activeTab === "admin" ? 6 : 6} className="text-center py-6">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Memuat data...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={activeTab === "admin" ? 6 : 6} className="text-center py-6">
                                                Tidak ada data pengguna.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user, index) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                                                <TableCell>{user.full_name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.gender}</TableCell>
                                                {activeTab === "admin" && <TableCell>{user.phone || "-"}</TableCell>}
                                                {(activeTab === "student" || activeTab === "teacher") && <TableCell>{user.school_name || "-"}</TableCell>}
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user)}>
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-4">
                            <Select
                                value={rowsPerPage.toString()}
                                onValueChange={(value) => {
                                    setRowsPerPage(Number(value));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue placeholder={rowsPerPage} />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {rowsPerPageOptions.map((size) => (
                                        <SelectItem key={size} value={size.toString()}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span>
                                    {currentPage} / {totalPages}
                                </span>
                                <Button variant="outline" size="icon" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Form Dialog untuk Tambah Admin */}
            <Dialog open={openFormDialog} onOpenChange={setOpenFormDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Admin</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label htmlFor="email">Email</label>
                            <Input id="email" type="email" {...register("email")} />
                            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <Input id="password" type="password" {...register("password")} />
                            {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="full_name">Nama Lengkap</label>
                            <Input id="full_name" {...register("full_name")} />
                            {errors.full_name && <p className="text-red-500">{errors.full_name.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="phone">Nomor Telepon</label>
                            <Input id="phone" {...register("phone")} />
                        </div>
                        <div>
                            <label htmlFor="gender">Jenis Kelamin</label>
                            <Select value={watch("gender")} onValueChange={(value) => setValue("gender", value as "Laki-laki" | "Perempuan")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih jenis kelamin" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && <p className="text-red-500">{errors.gender.message}</p>}
                        </div>
                        <input type="hidden" {...register("role")} value="admin" />
                        <DialogFooter className="p-4 sm:p-6">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary-800 text-white">
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                    </DialogHeader>
                    <p>Apakah Anda yakin ingin menghapus pengguna {userToDelete?.full_name}?</p>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <Button onClick={confirmDeleteUser} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
                            {isLoading && <Loader2 className="h-4 w-4 text-white animate-spin mr-2" />}
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Success Dialog untuk Tambah Admin */}
            <Dialog open={openSuccessDialog} onOpenChange={setOpenSuccessDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Berhasil</DialogTitle>
                    </DialogHeader>
                    <p>Admin berhasil ditambahkan.</p>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
