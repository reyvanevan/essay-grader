import {
    Users,
    FileCheck2,
    PenTool,
    AlertCircle,
    TrendingUp,
    Clock,
    BarChart3
} from "lucide-react";

export default function DashboardOverview() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-[32px] md:text-[42px] font-medium tracking-tight text-[#111] leading-tight">
                    Dashboard Overview
                </h1>
                <p className="text-[#555] text-[16px]">Selamat datang kembali, Pak Reyvan. Berikut ringkasan aktivitas penilaian esai hari ini.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        title: "Total Mahasiswa",
                        value: "128",
                        sub: "Mahasiswa terdaftar aktif",
                        icon: Users,
                        gradient: "bg-gradient-to-br from-[#fdf2f8] to-[#eef2ff]"
                    },
                    {
                        title: "Tugas Aktif",
                        value: "12",
                        sub: "Perlu evaluasi manual",
                        icon: PenTool,
                        gradient: "bg-gradient-to-br from-[#f5f3ff] to-[#ecfeff]"
                    },
                    {
                        title: "Graded by AI",
                        value: "456",
                        sub: "Rata-rata akurasi Llama",
                        icon: FileCheck2,
                        gradient: "bg-gradient-to-br from-[#eff6ff] to-[#f0fdf4]"
                    },
                    {
                        title: "Pending OCR",
                        value: "18",
                        sub: "Gagal terproses sistem",
                        icon: AlertCircle,
                        gradient: "bg-gradient-to-br from-[#fff1f2] to-[#fef2f2]"
                    }
                ].map((stat, i) => (
                    <div key={i} className={`${stat.gradient} p-6 rounded-2xl border border-white shadow-[0_2px_10px_0_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_0_rgba(0,0,0,0.06)] hover:-translate-y-1`}>
                        <h3 className="text-4xl font-bold text-[#111] tracking-tight mb-4">{stat.value}</h3>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                            <stat.icon className="w-4 h-4 text-gray-400" /> {stat.title}
                        </div>
                        <p className="text-[12px] font-medium text-gray-400/80">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-7 mt-8">
                <div className="md:col-span-4 bg-white p-7 md:p-8 rounded-[32px] border border-black/[0.04] shadow-sm flex flex-col transition-shadow hover:shadow-md">
                    <div className="mb-6">
                        <h2 className="text-[20px] font-semibold text-[#111] tracking-tight">Statistik Penilaian</h2>
                        <p className="text-[14px] text-gray-500 mt-1">Distribusi nilai mahasiswa menggunakan engine Llama 3.3</p>
                    </div>

                    <div className="flex-1 bg-gray-50/50 rounded-[20px] border border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[300px] text-gray-400 transition-colors hover:bg-gray-50">
                        <BarChart3 className="w-10 h-10 mb-3 text-gray-300" strokeWidth={1.5} />
                        <span className="text-sm font-medium">Visualisasi MAE & Confusion Matrix</span>
                    </div>
                </div>

                <div className="md:col-span-3 bg-white p-7 md:p-8 rounded-[32px] border border-black/[0.04] shadow-sm flex flex-col transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-[20px] font-semibold text-[#111] tracking-tight">Aktivitas Terkini</h2>
                            <p className="text-[14px] text-gray-500 mt-1">Log sistem grading realtime</p>
                        </div>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-bold tracking-wider uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live
                        </span>
                    </div>

                    <div className="flex-1 flex flex-col">
                        {[
                            {
                                desc: "Asep mengunggah jawaban esai tulis tangan",
                                time: "2m lalu",
                                status: "OCR Processing",
                                type: "ocr"
                            },
                            {
                                desc: "Penilaian AI 'Algoritma II' telah dieksekusi",
                                time: "15m lalu",
                                status: "Submitted (Score: 85)",
                                type: "ai"
                            },
                            {
                                desc: "Budi Setiawan mengirimkan draf esai via Teks",
                                time: "45m lalu",
                                status: "Grading in queue",
                                type: "pending"
                            }
                        ].map((activity, i) => (
                            <div key={i} className="flex gap-4 group">
                                <div className="flex flex-col items-center mt-0.5">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-[2.5px] border-white shadow-sm transition-transform duration-300 group-hover:scale-110 z-10 ${activity.type === 'ocr' ? 'bg-amber-100 text-amber-600' :
                                            activity.type === 'ai' ? 'bg-emerald-100 text-emerald-600' :
                                                'bg-gray-100 text-gray-500'
                                        }`}>
                                        {activity.type === 'ocr' ? <Clock className="w-3.5 h-3.5" strokeWidth={2.5} /> :
                                            activity.type === 'ai' ? <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} /> :
                                                <PenTool className="w-3.5 h-3.5" strokeWidth={2.5} />}
                                    </div>
                                    {i !== 2 && <div className="w-[1.5px] h-full bg-gray-100 -mt-1 group-hover:bg-gray-200 transition-colors"></div>}
                                </div>
                                <div className="flex-1 pb-6 pt-1">
                                    <p className="text-[14px] font-semibold text-[#222] tracking-tight mb-1 group-hover:text-black transition-colors leading-snug">{activity.desc}</p>
                                    <div className="flex items-center gap-2 text-[12px] font-medium tracking-tight">
                                        <span className="text-gray-400">{activity.time}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className={`${activity.type === 'ocr' ? 'text-amber-500' :
                                                activity.type === 'ai' ? 'text-emerald-500' :
                                                    'text-gray-400'
                                            }`}>{activity.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
