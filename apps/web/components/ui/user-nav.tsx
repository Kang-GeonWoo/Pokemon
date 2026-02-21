"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export function UserNav() {
    const [user, setUser] = useState<{ displayName: string } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('pokemon_user');
        if (saved) {
            try {
                setUser(JSON.parse(saved));
            } catch (e) {
                // Ignore parsing errors
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('pokemon_user');
        setUser(null);
        window.location.reload();
    };

    if (!mounted) return <div className="w-16 h-8 animate-pulse bg-white/5 rounded-md" />; // SSR 튐 방지

    if (user) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-accent-emerald bg-accent-emerald/10 px-3 py-1.5 rounded-full border border-accent-emerald/20">
                    <User className="w-4 h-4" />
                    {user.displayName}님
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-400 hover:text-white hover:bg-white/5">
                    로그아웃
                </Button>
            </div>
        );
    }

    return (
        <Link href="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex hover:bg-white/5">로그인</Button>
        </Link>
    );
}
