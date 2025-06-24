"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Plus, Search, Trash2, ListChecks, BookText } from "lucide-react";
import api from "@/lib/axios";

// Define interfaces for API responses
interface QuestionResponse {
    id: number;
    pertanyaan: string;
    pilihan_a: string;
    pilihan_b: string;
}

interface RecommendationResponse {
    id: number;
    kategori: string;
    gaya_belajar: string;
    rekomendasi: string;
    penjelasan: string;
}

// Define error response structure
interface ApiError {
    response?: {
        data?: {
            detail?: string | { loc: string[]; msg: string }[];
        };
    };
}

interface Question {
    id: number;
    text: string;
    options: string[];
}

interface Recommendation {
    id: number;
    dimension: string;
    style_type: string;
    content: string;
    penjelasan: string;
    priority: number;
}

export default function ContentManagementPage() {
    const [activeTab, setActiveTab] = useState<"questions" | "recommendations">("questions");
    const [searchQuery, setSearchQuery] = useState("");
    const [editingItem, setEditingItem] = useState<Question | Recommendation | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

    // Fetch questions from API
    const fetchQuestions = async () => {
        try {
            const response = await api.get<QuestionResponse[]>("/admin/soal");
            setQuestions(
                response.data.map((q) => ({
                    id: q.id,
                    text: q.pertanyaan,
                    options: [q.pilihan_a, q.pilihan_b],
                }))
            );
        } catch (error) {
            console.error("Error fetching questions:", error);
            alert("Gagal mengambil pertanyaan");
        }
    };

    // Fetch recommendations from API
    const fetchRecommendations = async () => {
        try {
            const response = await api.get<RecommendationResponse[]>("/admin/rekomendasi");
            setRecommendations(
                response.data.map((r) => ({
                    id: r.id,
                    dimension: r.kategori,
                    style_type: r.gaya_belajar,
                    content: r.rekomendasi,
                    penjelasan: r.penjelasan,
                    priority: 1,
                }))
            );
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            alert("Gagal mengambil rekomendasi");
        }
    };

    // Initial data fetch
    useEffect(() => {
        if (activeTab === "questions") fetchQuestions();
        else fetchRecommendations();
    }, [activeTab]);

    // Filter questions and recommendations
    const filteredQuestions = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase();
        return questions.filter((q) => q.text.toLowerCase().includes(lowerQuery) || q.options.some((opt) => opt.toLowerCase().includes(lowerQuery)));
    }, [searchQuery, questions]);

    const filteredRecommendations = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase();
        return recommendations.filter((r) => r.content.toLowerCase().includes(lowerQuery) || r.dimension?.toLowerCase().includes(lowerQuery) || r.style_type?.toLowerCase().includes(lowerQuery));
    }, [searchQuery, recommendations]);

    // Add new question
    const handleAddQuestion = () => {
        const newQuestion: Question = {
            id: 0,
            text: "",
            options: ["", ""],
        };
        setEditingItem(newQuestion);
        setIsEditDialogOpen(true);
    };

    // Add new recommendation
    const handleAddRecommendation = () => {
        const newRecommendation: Recommendation = {
            id: 0,
            dimension: "processing",
            style_type: "Aktif Kuat",
            content: "",
            penjelasan: "",
            priority: 1,
        };
        setEditingItem(newRecommendation);
        setIsEditDialogOpen(true);
    };

    // Save item (create or update)
    const handleSaveItem = async (updatedItem: Question | Recommendation) => {
        try {
            if ("options" in updatedItem) {
                // Question validation
                if (!updatedItem.text?.trim()) {
                    alert("Teks pertanyaan harus diisi (minimal 10 karakter)");
                    return;
                }
                if (updatedItem.text.length < 10) {
                    alert("Teks pertanyaan harus minimal 10 karakter");
                    return;
                }
                if (!updatedItem.options[0]?.trim() || !updatedItem.options[1]?.trim()) {
                    alert("Opsi A dan B harus diisi (minimal 2 karakter)");
                    return;
                }
                const payload = {
                    pertanyaan: updatedItem.text.trim(),
                    pilihan_a: updatedItem.options[0].trim(),
                    pilihan_b: updatedItem.options[1].trim(),
                };
                if (updatedItem.id === 0) {
                    await api.post("/admin/tambah soal", payload);
                } else {
                    await api.put(`/admin/soal update${updatedItem.id}`, payload);
                }
                fetchQuestions();
            } else {
                // Recommendation validation
                if (!updatedItem.content?.trim()) {
                    alert("Konten rekomendasi harus diisi");
                    return;
                }
                if (!updatedItem.dimension) {
                    alert("Dimensi harus dipilih");
                    return;
                }
                if (!updatedItem.style_type) {
                    alert("Gaya belajar harus dipilih");
                    return;
                }
                const payload = {
                    kategori: updatedItem.dimension,
                    gaya_belajar: updatedItem.style_type,
                    penjelasan: updatedItem.penjelasan,
                    rekomendasi: updatedItem.content.trim(),
                };
                if (updatedItem.id === 0) {
                    await api.post("/admin/tambah rekomendasi", payload);
                } else {
                    await api.put(`/admin/update rekomendasi${updatedItem.id}`, payload);
                }
                fetchRecommendations();
            }
            setIsEditDialogOpen(false);
        } catch (error: unknown) {
            const apiError = error as ApiError;
            console.error("Error saving item:", apiError);
            let errorMessage = "Gagal menyimpan item";
            if (apiError.response?.data?.detail) {
                if (Array.isArray(apiError.response.data.detail)) {
                    errorMessage = apiError.response.data.detail.map((err) => `${err.loc.join(".")}: ${err.msg}`).join("; ");
                } else {
                    errorMessage = apiError.response.data.detail as string;
                }
            }
            alert(errorMessage);
        }
    };

    // Delete item
    const handleDeleteItem = async (id: number, type: "questions" | "recommendations") => {
        if (confirm("Apakah Anda yakin ingin menghapus item ini?")) {
            try {
                if (type === "questions") {
                    await api.delete(`/admin/hapus soal${id}`);
                    fetchQuestions();
                } else {
                    await api.delete(`/admin/hapus rekomendasi${id}`);
                    fetchRecommendations();
                }
            } catch (error: unknown) {
                const apiError = error as ApiError;
                console.error("Error deleting item:", apiError);
                alert(apiError.response?.data?.detail || "Gagal menghapus item");
            }
        }
    };

    // Mapping kategori
    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            processing: "Pemrosesan",
            perception: "Persepsi",
            input: "Input",
            understanding: "Pemahaman",
        };
        return labels[category] || category;
    };

    return (
        <div className="min-h-screen text-foreground p-4 sm:p-6">
            <Card className="bg-white shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">Manajemen Konten</CardTitle>
                    <CardDescription>Kelola pertanyaan tes dan rekomendasi pembelajaran</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        {/* Tab Navigation */}
                        <div className="flex border-b">
                            <button className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === "questions" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`} onClick={() => setActiveTab("questions")}>
                                <ListChecks className="h-4 w-4" />
                                Pertanyaan Tes
                            </button>
                            <button
                                className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === "recommendations" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                                onClick={() => setActiveTab("recommendations")}
                            >
                                <BookText className="h-4 w-4" />
                                Rekomendasi Belajar
                            </button>
                        </div>

                        {/* Search and Add Button */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input placeholder={`Cari ${activeTab === "questions" ? "pertanyaan..." : "rekomendasi..."}`} className="pl-10 w-full rounded-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                            <Button onClick={activeTab === "questions" ? handleAddQuestion : handleAddRecommendation} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah {activeTab === "questions" ? "Pertanyaan" : "Rekomendasi"}
                            </Button>
                        </div>

                        {/* Content Tables */}
                        {activeTab === "questions" ? (
                            <QuestionsTable
                                questions={filteredQuestions}
                                onEdit={(question) => {
                                    setEditingItem(question);
                                    setIsEditDialogOpen(true);
                                }}
                                onDelete={(id) => handleDeleteItem(id, "questions")}
                            />
                        ) : (
                            <RecommendationsTable
                                recommendations={filteredRecommendations}
                                getCategoryLabel={getCategoryLabel}
                                onEdit={(recommendation) => {
                                    setEditingItem(recommendation);
                                    setIsEditDialogOpen(true);
                                }}
                                onDelete={(id) => handleDeleteItem(id, "recommendations")}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            {isEditDialogOpen && editingItem && <EditDialog item={editingItem} onSave={handleSaveItem} onClose={() => setIsEditDialogOpen(false)} />}
        </div>
    );
}

// Sub-components remain unchanged
function QuestionsTable({ questions, onEdit, onDelete }: { questions: Question[]; onEdit: (question: Question) => void; onDelete: (id: number) => void }) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>Pertanyaan</TableHead>
                        <TableHead className="w-[150px]">Opsi A</TableHead>
                        <TableHead className="w-[150px]">Opsi B</TableHead>
                        <TableHead className="w-[150px]">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {questions.length > 0 ? (
                        questions.map((question) => (
                            <TableRow key={question.id}>
                                <TableCell className="font-medium">{question.id}</TableCell>
                                <TableCell>{question.text}</TableCell>
                                <TableCell>{question.options[0]}</TableCell>
                                <TableCell>{question.options[1]}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => onEdit(question)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => onDelete(question.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                                {questions.length === 0 ? "Belum ada pertanyaan" : "Tidak ditemukan pertanyaan yang sesuai"}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function RecommendationsTable({
    recommendations,
    getCategoryLabel,
    onEdit,
    onDelete,
}: {
    recommendations: Recommendation[];
    getCategoryLabel: (category: string) => string;
    onEdit: (recommendation: Recommendation) => void;
    onDelete: (id: number) => void;
}) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead className="w-[60px]">No</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Gaya Belajar</TableHead>
                        <TableHead>Penjelasan</TableHead>
                        <TableHead>Rekomendasi</TableHead>
                        <TableHead className="w-[180px]">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recommendations.length > 0 ? (
                        recommendations.map((recommendation) => (
                            <TableRow key={recommendation.id}>
                                <TableCell className="font-medium">{recommendation.id}</TableCell>
                                <TableCell>{getCategoryLabel(recommendation.dimension)}</TableCell>
                                <TableCell>{recommendation.style_type}</TableCell>
                                <TableCell>{recommendation.penjelasan}</TableCell>
                                <TableCell>{recommendation.content}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => onEdit(recommendation)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => onDelete(recommendation.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                                {recommendations.length === 0 ? "Belum ada rekomendasi" : "Tidak ditemukan rekomendasi yang sesuai"}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function EditDialog({ item, onSave, onClose }: { item: Question | Recommendation; onSave: (item: Question | Recommendation) => void; onClose: () => void }) {
    const [localItem, setLocalItem] = useState(item);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-xl bg-white">
                <CardHeader>
                    <CardTitle>{"options" in localItem ? "Edit Pertanyaan" : "Edit Rekomendasi"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {"options" in localItem ? (
                            // Question Form
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Pertanyaan</label>
                                    <Input
                                        value={localItem.text}
                                        onChange={(e) =>
                                            setLocalItem({
                                                ...localItem,
                                                text: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Opsi A</label>
                                    <Input
                                        value={localItem.options[0]}
                                        onChange={(e) => {
                                            const newOptions = [...localItem.options];
                                            newOptions[0] = e.target.value;
                                            setLocalItem({
                                                ...localItem,
                                                options: newOptions,
                                            });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Opsi B</label>
                                    <Input
                                        value={localItem.options[2]}
                                        onChange={(e) => {
                                            const newOptions = [...localItem.options];
                                            newOptions[1] = e.target.value;
                                            setLocalItem({
                                                ...localItem,
                                                options: newOptions,
                                            });
                                        }}
                                    />
                                </div>
                            </>
                        ) : (
                            // Recommendation Form
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kategori</label>
                                    <select
                                        value={localItem.dimension}
                                        onChange={(e) =>
                                            setLocalItem({
                                                ...localItem,
                                                dimension: e.target.value,
                                            })
                                        }
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="processing">Pemrosesan</option>
                                        <option value="perception">Persepsi</option>
                                        <option value="input">Input</option>
                                        <option value="understanding">Pemahaman</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Gaya Belajar</label>
                                    <Input
                                        value={localItem.style_type}
                                        onChange={(e) =>
                                            setLocalItem({
                                                ...item,
                                                style_type: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Penjelasan</label>
                                    <Input
                                        value={localItem.penjelasan}
                                        onChange={(e) =>
                                            setLocalItem({
                                                ...localItem,
                                                penjelasan: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Rekomendasi</label>
                                    <Input
                                        value={localItem.content}
                                        onChange={(e) =>
                                            setLocalItem({
                                                ...localItem,
                                                content: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </>
                        )}
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                            <Button className="bg-blue-600 text-white" onClick={() => onSave(localItem)}>
                                Simpan
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
