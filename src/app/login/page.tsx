import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams;
    const hasError = searchParams?.error === "true";

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4 font-sans">
            <div className="w-full max-w-[400px] bg-white p-8 md:p-10 rounded-[32px] border border-black/[0.04] shadow-[0_8px_30px_0_rgba(0,0,0,0.04)] flex flex-col">
                <div className="flex justify-center mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-[#333] to-[#000] text-white shadow-md">
                        <Sparkles className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-[24px] font-semibold text-[#111] tracking-tight mb-2">Lecturer Portal</h1>
                    <p className="text-[14px] text-gray-500">Sign in to Kromia Desk to manage assignments and grades.</p>
                </div>

                {hasError && (
                    <div className="mb-6 flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                        <AlertCircle className="w-4 h-4" />
                        Invalid email or password.
                    </div>
                )}

                <form className="flex flex-col gap-5" action={login}>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email Address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="lecturer@university.edu"
                            required
                            className="h-12 rounded-xl border-gray-200 focus:border-black focus:ring-1 focus:ring-black bg-gray-50/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Password</Label>
                            <Link href="#" className="text-xs font-medium text-gray-400 hover:text-black transition-colors">Forgot?</Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="h-12 rounded-xl border-gray-200 focus:border-black focus:ring-1 focus:ring-black bg-gray-50/50"
                        />
                    </div>

                    <Button type="submit" className="w-full h-12 mt-2 rounded-xl bg-gradient-to-b from-[#333] to-[#000] font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Sign In
                    </Button>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-3 text-gray-400 font-semibold tracking-wider">Or continue with</span>
                        </div>
                    </div>

                    <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-gray-200 bg-white font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition-all shadow-sm">
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Google
                    </Button>
                </form>

                <div className="mt-8 text-center text-[13px] text-gray-500 font-medium">
                    Need an account? <Link href="#" className="text-[#111] hover:underline">Contact Administrator</Link>
                </div>
            </div>
        </div>
    );
}
