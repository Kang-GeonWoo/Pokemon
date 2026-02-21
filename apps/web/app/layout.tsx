import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { UserNav } from '@/components/ui/user-nav';

export const metadata: Metadata = {
    title: '포켓몬 쇼다운 어시스턴트 | PokeAssist',
    description: '최강의 팀 빌더 & 배틀 어시스턴트',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" className="dark">
            <body className="min-h-screen bg-background font-sans text-white selection:bg-primary selection:text-white overflow-x-hidden">
                {/* Dynamic Background Gradients */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] animate-pulse-slow mix-blend-screen" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[150px] animate-pulse-slow mix-blend-screen" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-accent-violet/10 blur-[120px] animate-pulse-slow mix-blend-screen" style={{ animationDelay: '4s' }} />
                </div>

                <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-glass backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto flex h-16 items-center justify-between px-4">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="relative">
                                <Sparkles className="w-6 h-6 text-primary group-hover:animate-spin-slow transition-transform" />
                                <div className="absolute inset-0 bg-primary blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-xl font-bold font-display tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                                PokeAssist
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-8">
                            <NavLink href="/team-builder">팀 빌더</NavLink>
                            <NavLink href="/battle-assistant">배틀 허브</NavLink>
                            <NavLink href="/meta">메타 분석</NavLink>
                            <NavLink href="/community">커뮤니티</NavLink>
                        </div>

                        <div className="flex items-center space-x-3">
                            <UserNav />
                            <Link href="/team-builder">
                                <Button variant="gradient" size="sm" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                                    시작하기
                                </Button>
                            </Link>
                        </div>
                    </div>
                </nav>

                <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </body>
        </html>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-sm font-medium text-gray-400 hover:text-white transition-all duration-200 relative group py-2"
        >
            {children}
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" />
        </Link>
    );
}
