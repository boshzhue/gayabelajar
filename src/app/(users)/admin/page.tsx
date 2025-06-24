"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, RefreshCw, Server } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { AxiosError } from "axios";
// Tipe respons dari API
interface DashboardResponse {
    total_siswa: number;
    total_guru: number;
    total_admin: number;
    total_tes_selesai: number;
}

// Tipe untuk stats di UI
interface StatItem {
    title: string;
    value: number;
}

// Tipe utama untuk dashboard data
interface DashboardData {
    stats: StatItem[];
    userDistribution: {
        students: { count: number; percentage: number };
        teachers: { count: number; percentage: number };
        admins: { count: number; percentage: number };
    };
    systemHealth: {
        database: boolean;
        api: boolean;
        storage: boolean;
    };
}

export default function DashboardOverview() {
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        stats: [
            { title: "Total Siswa", value: 0 },
            { title: "Total Guru", value: 0 },
            { title: "Total Admin", value: 0 },
            { title: "Tes Selesai", value: 0 },
        ],
        userDistribution: {
            students: { count: 0, percentage: 0 },
            teachers: { count: 0, percentage: 0 },
            admins: { count: 0, percentage: 0 },
        },
        systemHealth: {
            database: false,
            api: false,
            storage: false,
        },
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fungsi untuk mengambil data dari API
    const fetchDashboardData = async () => {
        try {
            const response = await api.get<DashboardResponse>("/admin/dashboard");
            const data = response.data;

            const totalUsers = data.total_siswa + data.total_guru + data.total_admin;
            const studentPercentage = totalUsers ? (data.total_siswa / totalUsers) * 100 : 0;
            const teacherPercentage = totalUsers ? (data.total_guru / totalUsers) * 100 : 0;
            const adminPercentage = totalUsers ? (data.total_admin / totalUsers) * 100 : 0;

            setDashboardData({
                stats: [
                    { title: "Total Siswa", value: data.total_siswa },
                    { title: "Total Guru", value: data.total_guru },
                    { title: "Total Admin", value: data.total_admin },
                    { title: "Tes Selesai", value: data.total_tes_selesai },
                ],
                userDistribution: {
                    students: { count: data.total_siswa, percentage: studentPercentage },
                    teachers: { count: data.total_guru, percentage: teacherPercentage },
                    admins: { count: data.total_admin, percentage: adminPercentage },
                },
                systemHealth: {
                    database: true,
                    api: true,
                    storage: false,
                },
            });

            setLoading(false);
        } catch (err) {
            let message = "Gagal memuat data dashboard";

            if (err instanceof AxiosError) {
                message = err.response?.data?.detail || err.message;
            }

            console.error("Error fetching dashboard data:", err);
            setError(message);
            setLoading(false);
        }
    };

    // Jalankan fetch saat komponen mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Skeleton loader
    const SkeletonCard = () => (
        <Card className="bg-white">
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-1/4 mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </CardContent>
        </Card>
    );

    if (error) {
        return (
            <div className="flex min-h-screen justify-center items-center text-red-500">
                <div className="text-center">
                    <p>Error: {error}</p>
                    <Button onClick={fetchDashboardData} className="mt-4">
                        Coba Lagi
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen text-foreground">
            <div className="flex-1 flex flex-col">
                <main className="flex-1">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">Dashboard Admin EduSmart</h1>
                                <p className="text-sm text-muted-foreground">Ringkasan aktivitas dan statistik platform</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-sm text-muted-foreground bg-primary-50 px-3 py-1 rounded-md">
                                    Terakhir diperbarui:{" "}
                                    {new Date().toLocaleString("id-ID", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </div>
                                <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading}>
                                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {loading
                                ? Array(4)
                                      .fill(null)
                                      .map((_, i) => <SkeletonCard key={i} />)
                                : dashboardData.stats.map((stat, index) => (
                                      <Card key={index} className="bg-white hover:shadow-md transition-shadow border border-gray-100">
                                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                              <div className="text-2xl font-bold text-primary-900">{stat.value}</div>
                                          </CardContent>
                                      </Card>
                                  ))}
                        </div>

                        {/* Quick Stats and System Health */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* User Distribution */}
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary-600" />
                                        Distribusi Pengguna
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="space-y-3">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-2 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-2 w-full" />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span>Siswa</span>
                                                <span className="font-medium">
                                                    {dashboardData.userDistribution.students.count} ({dashboardData.userDistribution.students.percentage.toFixed(0)}
                                                    %)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                                                    style={{
                                                        width: `${dashboardData.userDistribution.students.percentage}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Guru</span>
                                                <span className="font-medium">
                                                    {dashboardData.userDistribution.teachers.count} ({dashboardData.userDistribution.teachers.percentage.toFixed(0)}
                                                    %)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-green-600 h-2.5 rounded-full transition-all"
                                                    style={{
                                                        width: `${dashboardData.userDistribution.teachers.percentage}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Admin</span>
                                                <span className="font-medium">
                                                    {dashboardData.userDistribution.admins.count} ({dashboardData.userDistribution.admins.percentage.toFixed(0)}
                                                    %)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-purple-600 h-2.5 rounded-full transition-all"
                                                    style={{
                                                        width: `${dashboardData.userDistribution.admins.percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* System Health */}
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Server className="w-5 h-5 text-primary-600" />
                                        Kesehatan Sistem
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="space-y-3">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {Object.entries(dashboardData.systemHealth).map(([key, value]) => (
                                                <div key={key} className="flex justify-between text-sm">
                                                    <span className="capitalize">{key}</span>
                                                    <span className={`font-medium ${value ? "text-green-600" : "text-red-600"}`}>{value ? "Sehat" : "Bermasalah"}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
