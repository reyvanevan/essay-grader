import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    FileCheck2,
    PenTool,
    AlertCircle,
    TrendingUp,
    Clock
} from "lucide-react";

export default function DashboardOverview() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard Overview</h1>
                <p className="text-zinc-500">Selamat datang kembali, Pak Reyvan. Berikut ringkasan aktivitas penilaian esai hari ini.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        title: "Total Mahasiswa",
                        value: "128",
                        sub: "+4 dari minggu lalu",
                        icon: Users,
                        color: "text-blue-600",
                        bg: "bg-blue-50"
                    },
                    {
                        title: "Tugas Aktif",
                        value: "12",
                        sub: "3 perlu evaluasi manual",
                        icon: PenTool,
                        color: "text-indigo-600",
                        bg: "bg-indigo-50"
                    },
                    {
                        title: "Graded by AI",
                        value: "456",
                        sub: "Rata-rata akurasi 94%",
                        icon: FileCheck2,
                        color: "text-emerald-600",
                        bg: "bg-emerald-50"
                    },
                    {
                        title: "Pending OCR",
                        value: "18",
                        sub: "Menunggu antrian kirim",
                        icon: AlertCircle,
                        color: "text-amber-600",
                        bg: "bg-amber-50"
                    }
                ].map((stat, i) => (
                    <Card key={i} className="border-zinc-200/60 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">{stat.title}</CardTitle>
                            <div className={`rounded-lg ${stat.bg} p-2 ${stat.color}`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
                            <p className="text-xs text-zinc-500 mt-1">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4 border-zinc-200/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Statistik Penilaian</CardTitle>
                        <CardDescription aria-hidden="true">
                            Distribusi nilai mahasiswa menggunakan engine Llama 3.3.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-t border-dashed border-zinc-100 italic text-zinc-400">
                        {/* Chart component placeholder */}
                        Visualisasi Grafik MAE & Confusion Matrix
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 border-zinc-200/60 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Aktivitas Terkini</CardTitle>
                            <Badge variant="secondary" className="font-normal">Real-time</Badge>
                        </div>
                        <CardDescription aria-hidden="true">Log aktivitas grading otomatis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[
                                {
                                    desc: "Asep Surasep mengunggah jawaban tulis tangan",
                                    time: "2 menit yang lalu",
                                    status: "OCR Processing",
                                    type: "ocr"
                                },
                                {
                                    desc: "Penilaian AI selesai untuk tugas 'Algoritma II'",
                                    time: "15 menit yang lalu",
                                    status: "Success (Score: 85)",
                                    type: "ai"
                                },
                                {
                                    desc: "Budi Setiawan mengirimkan esai via Teks",
                                    time: "45 menit yang lalu",
                                    status: "Grading in queue",
                                    type: "pending"
                                }
                            ].map((activity, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 ring-4 ring-white">
                                        {activity.type === 'ocr' ? <Clock className="h-4 w-4 text-zinc-500" /> : <TrendingUp className="h-4 w-4 text-indigo-500" />}
                                    </div>
                                    <div className="flex flex-1 flex-col gap-0.5">
                                        <p className="text-sm font-medium text-zinc-900 leading-none">
                                            {activity.desc}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold italic">{activity.time}</span>
                                            <span className="h-1 w-1 rounded-full bg-zinc-300"></span>
                                            <span className={`text-[11px] font-semibold ${activity.type === 'ai' ? 'text-emerald-600' : 'text-zinc-500'}`}>
                                                {activity.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
