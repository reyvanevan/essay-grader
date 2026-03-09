import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  ScanSearch,
  BookOpenCheck,
  Scale,
  ArrowRight,
  ShieldCheck,
  Zap,
  GraduationCap
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              Smart<span className="text-indigo-600">Assistant</span>
            </span>
          </div>
          <nav className="hidden space-x-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-zinc-600 transition-colors hover:text-indigo-600">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-zinc-600 transition-colors hover:text-indigo-600">
              How it Works
            </Link>
            <Link href="#about" className="text-sm font-medium text-zinc-600 transition-colors hover:text-indigo-600">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden font-medium text-zinc-600 sm:inline-flex">
                Log in
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-indigo-600 font-medium text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-indigo-200">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-40">
          <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-full -translate-x-1/2 overflow-hidden blur-3xl">
            <div className="absolute -left-[10%] top-0 h-[400px] w-[500px] rounded-full bg-indigo-50 opacity-50 transition-all duration-700" />
            <div className="absolute -right-[10%] top-20 h-[500px] w-[500px] rounded-full bg-blue-50 opacity-40 transition-all duration-700" />
          </div>

          <div className="container mx-auto px-4 text-center md:px-6">
            <Badge variant="outline" className="mb-6 border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-indigo-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Powered by Llama 3.3-70b
            </Badge>
            <h1 className="mx-auto mb-8 max-w-4xl text-5xl font-extrabold tracking-tight text-zinc-950 sm:text-6xl md:text-7xl">
              Automated Essay Grading <br />
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                With Deep Semantic Analysis
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
              A comprehensive Smart Assistant Lecturer designed to provide objective,
              consistent, and precise essay evaluations using state-of-the-art LLM and OCR technology.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 bg-indigo-600 px-8 text-lg font-semibold text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-indigo-200">
                  Join the Thesis Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-14 h-14 border-zinc-200 px-8 text-lg font-medium text-zinc-700 transition-all hover:bg-zinc-50">
                  Explore Features
                </Button>
              </Link>
            </div>

            {/* Dashboard Preview Decoy */}
            <div className="mt-20 flex aspect-[16/9] w-full max-w-5xl translate-y-4 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/50 p-2 shadow-2xl md:mt-24">
              <div className="relative h-full w-full overflow-hidden rounded-xl bg-white shadow-inner">
                <div className="flex h-full w-full flex-col p-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="h-6 w-32 rounded-md bg-zinc-100"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 rounded-full bg-zinc-100"></div>
                      <div className="h-8 w-24 rounded-md bg-zinc-100"></div>
                    </div>
                  </div>
                  <div className="grid flex-1 grid-cols-12 gap-6 pt-6">
                    <div className="col-span-3 space-y-4">
                      <div className="h-10 w-full rounded-md bg-zinc-50"></div>
                      <div className="h-10 w-full rounded-md bg-indigo-50"></div>
                      <div className="h-10 w-full rounded-md bg-zinc-50"></div>
                    </div>
                    <div className="col-span-9 rounded-md border border-dashed border-zinc-200 bg-white/50 p-8 flex flex-col items-center justify-center space-y-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        <BookOpenCheck className="h-8 w-8" />
                      </div>
                      <div className="h-4 w-48 rounded bg-zinc-100"></div>
                      <div className="h-4 w-32 rounded bg-zinc-50"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-zinc-50 py-24 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
                Built for Precision & Efficiency
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-zinc-600">
                Combining human-level understanding with machine-speed processing.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Semantic Analysis",
                  description: "Leverages LLM to understand contextual meanings, not just keyword matching.",
                  icon: ScanSearch,
                  color: "indigo"
                },
                {
                  title: "OCR Integration",
                  description: "Directly process handwritten essay submissions using advanced Optical Character Recognition.",
                  icon: BookOpenCheck,
                  color: "blue"
                },
                {
                  title: "Custom Rubrics",
                  description: "Dynamically adapt to specific lecturer criteria and assessment standards.",
                  icon: Scale,
                  color: "violet"
                },
                {
                  title: "Objective Feedback",
                  description: "Consistent evaluations free from human fatigue and subjective bias.",
                  icon: ShieldCheck,
                  color: "emerald"
                }
              ].map((feature, idx) => (
                <Card key={idx} className="group border-zinc-200 bg-white transition-all hover:-translate-y-2 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50">
                  <CardContent className="pt-8">
                    <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-${feature.color}-50 text-${feature.color}-600 transition-colors group-hover:bg-${feature.color}-600 group-hover:text-white`}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-zinc-900">{feature.title}</h3>
                    <p className="leading-relaxed text-zinc-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats / Proof Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 rounded-3xl bg-indigo-900 px-8 py-16 text-white md:grid-cols-3 md:px-16">
              <div className="text-center">
                <div className="mb-2 text-5xl font-extrabold text-white sm:text-6xl">95%</div>
                <div className="text-indigo-200/80">MAE Correlation</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-5xl font-extrabold text-white sm:text-6xl">&lt; 5s</div>
                <div className="text-indigo-200/80">Processing Time</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-5xl font-extrabold text-white sm:text-6xl">100%</div>
                <div className="text-indigo-200/80">Consistency Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-24 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-16 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-xl">
                <Badge className="mb-4 bg-indigo-600">The Workflow</Badge>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
                  From Handwriting <br /> to Detailed Analysis
                </h2>
              </div>
              <p className="max-w-sm text-zinc-600">
                Our seamless pipeline ensures every word is accounted for and every idea is evaluated fairly.
              </p>
            </div>
            <div className="grid gap-12 lg:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Submission",
                  desc: "Student uploads digital text or an image of their handwritten essay response."
                },
                {
                  step: "02",
                  title: "OCR & Analysis",
                  desc: "System digitizes input and Llama AI evaluates it against customized lecturer rubrics."
                },
                {
                  step: "03",
                  title: "Instant Results",
                  desc: "Detailed feedback, score reasoning, and quantitative grades are delivered instantly."
                }
              ].map((step, idx) => (
                <div key={idx} className="group relative">
                  <span className="mb-6 block text-7xl font-black text-indigo-50 transition-colors group-hover:text-indigo-100/50">
                    {step.step}
                  </span>
                  <h3 className="mb-4 text-2xl font-bold text-zinc-900">{step.title}</h3>
                  <p className="text-lg leading-relaxed text-zinc-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="about" className="border-t border-zinc-100 bg-white py-12 md:py-20 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900">
              Smart<span className="text-indigo-600">Assistant</span>
            </span>
          </div>
          <p className="mx-auto mb-8 max-w-md text-zinc-500">
            A Bachelor Thesis Project at Universitas Muhammadiyah Bandung.
            Focusing on the intersection of Generative AI and Education.
          </p>
          <div className="flex justify-center space-x-6 text-sm font-medium text-zinc-400">
            <span>&copy; 2026 M Reyvan Purnama</span>
            <span>220102043</span>
            <span>Teknik Informatika</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
