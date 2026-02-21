"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");

    const handleSubmit = async () => {
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

        try {
            const body = isLogin
                ? { email, password }
                : { email, password, displayName };

            const res = await fetch(`${apiBase}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || "문제가 발생했습니다.");
            } else {
                setSuccessMsg(isLogin ? "로그인에 성공했습니다!" : "회원가입에 성공했습니다! 이제 로그인 가능합니다.");
                if (isLogin) {
                    localStorage.setItem('pokemon_user', JSON.stringify({
                        id: data.id,
                        displayName: data.displayName,
                        email: data.email
                    }));
                    setTimeout(() => {
                        window.location.href = "/team-builder";
                    }, 1000);
                } else {
                    setTimeout(() => setIsLogin(true), 1500);
                }
            }
        } catch (e: any) {
            console.error("Login fetch error:", e);
            setErrorMsg(`에러: ${e.message || "통신 실패"} (대상: ${apiBase})`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh] animate-fade-in relative z-10 w-full max-w-md mx-auto">
            {/* Decorative background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full -z-10" />

            <Card className="w-full bg-surface/40 backdrop-blur-2xl border-white/10 shadow-2xl">
                <CardHeader className="space-y-3 text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner mb-2">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        {isLogin ? "환영합니다" : "계정 만들기"}
                    </CardTitle>
                    <p className="text-sm text-gray-400">
                        {isLogin ? "PokeAssist에 로그인하고 나만의 파티를 클라우드에 저장하세요." : "지금 가입하고 배틀 어시스턴트의 모든 기능을 사용하세요."}
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    {errorMsg && <div className="p-3 text-sm text-red-200 bg-red-500/20 border border-red-500/50 rounded-lg">{errorMsg}</div>}
                    {successMsg && <div className="p-3 text-sm text-accent-emerald bg-accent-emerald/20 border border-accent-emerald/50 rounded-lg">{successMsg}</div>}

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 pl-1">이메일</label>
                            <Input placeholder="name@example.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-400 pl-1">닉네임</label>
                                <Input placeholder="트레이너 이름" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 pl-1">비밀번호</label>
                            <Input placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <Button
                            className="w-full gap-2 shadow-lg shadow-primary/20 bg-gradient-to-r from-accent-violet to-primary hover:from-primary hover:to-accent-violet border-none"
                            onClick={handleSubmit}
                            disabled={loading || !email || !password || (!isLogin && !displayName)}
                        >
                            {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"} <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background/80 px-2 text-gray-500 backdrop-blur-md">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="secondary" className="bg-white/5 hover:bg-white/10 text-gray-300">
                            Google
                        </Button>
                        <Button variant="secondary" className="bg-white/5 hover:bg-white/10 text-gray-300">
                            Discord
                        </Button>
                    </div>

                    <div className="text-center text-sm text-gray-500 pt-4">
                        {isLogin ? "아직 계정이 없으신가요? " : "이미 계정이 있으신가요? "}
                        <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline hover:text-accent-violet transition-colors">
                            {isLogin ? "회원가입" : "로그인"}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
