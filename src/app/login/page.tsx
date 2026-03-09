import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            <Card className="w-full max-w-md border-zinc-200 shadow-xl shadow-zinc-200/50">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Lecturer Portal</CardTitle>
                    <CardDescription>
                        Masukkan email dan password Anda untuk masuk ke dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="reyvan@umb.ac.id" className="border-zinc-200 focus:border-indigo-500" />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="#" className="text-xs text-indigo-600 hover:underline">Lupa password?</Link>
                        </div>
                        <Input id="password" type="password" className="border-zinc-200 focus:border-indigo-500" />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Link href="/dashboard" className="w-full">
                        <Button className="w-full bg-indigo-600 font-semibold text-white hover:bg-indigo-700 h-11">
                            Sign In
                        </Button>
                    </Link>
                    <div className="text-center text-sm text-zinc-500">
                        Belum punya akun? <Link href="#" className="text-indigo-600 font-medium hover:underline">Daftar sekarang</Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
