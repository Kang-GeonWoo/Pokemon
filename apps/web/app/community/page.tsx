"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Search, PlusCircle, MessageSquare, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Post = {
    id: string;
    title: string;
    author: string;
    likes: number;
    comments: number;
    tags: string[];
};

export default function CommunityPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"ALL" | "TEAM" | "FREE">("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${apiBase}/api/community/posts`);
            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-accent-emerald to-accent-cyan flex items-center gap-3">
                        <Users className="w-10 h-10 text-accent-emerald" />
                        커뮤니티 및 렌탈팀
                    </h1>
                    <p className="text-gray-400 mt-2">
                        마스터 랭커들의 파티를 구경하고, 내 파티를 공유해보세요.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="포켓몬 이름, 파티 태그 검색"
                            className="pl-9 bg-surface/50 border-white/10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button className="gap-2 shrink-0 bg-accent-emerald hover:bg-emerald-600 text-white" onClick={() => router.push('/community/write')}>
                        <PlusCircle className="w-4 h-4" /> 게시글 작성하기
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-2">
                <button
                    onClick={() => setActiveTab("ALL")}
                    className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'ALL' ? 'text-accent-emerald border-accent-emerald' : 'text-gray-400 border-transparent hover:text-white'}`}>
                    전체보기
                </button>
                <button
                    onClick={() => setActiveTab("TEAM")}
                    className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'TEAM' ? 'text-accent-emerald border-accent-emerald' : 'text-gray-400 border-transparent hover:text-white'}`}>
                    렌탈팀 갤러리
                </button>
                <button
                    onClick={() => setActiveTab("FREE")}
                    className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'FREE' ? 'text-accent-emerald border-accent-emerald' : 'text-gray-400 border-transparent hover:text-white'}`}>
                    자유 게시판
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {loading ? (
                    <div className="col-span-full text-center text-gray-400 py-10">
                        <div className="w-8 h-8 rounded-full border-2 border-accent-emerald border-t-transparent animate-spin mx-auto mb-4"></div>
                        목록을 불러오는 중...
                    </div>
                ) : posts.length === 0 ? (
                    <div className="col-span-full text-center text-gray-400 py-10">첫 파티를 공유하고 영웅이 되어보세요!</div>
                ) : posts.filter(p => {
                    const isTeam = p.tags.includes("렌탈팀");
                    if (activeTab === "TEAM" && !isTeam) return false;
                    if (activeTab === "FREE" && isTeam) return false;
                    if (searchQuery) {
                        const sq = searchQuery.toLowerCase();
                        return p.title.toLowerCase().includes(sq) || p.author.toLowerCase().includes(sq) || p.tags.some(t => t.toLowerCase().includes(sq));
                    }
                    return true;
                }).map((post, i) => (
                    <Card key={post.id || i} className="bg-surface/40 backdrop-blur-xl border-white/5 hover:border-accent-emerald/50 transition-all hover:-translate-y-1 group cursor-pointer" onClick={() => router.push(`/community/${post.id}`)}>
                        <CardHeader className="pb-3 border-b border-white/10">
                            <CardTitle className="text-lg text-white group-hover:text-accent-emerald transition-colors line-clamp-1">
                                {post.title}
                            </CardTitle>
                            <div className="text-xs text-gray-500 font-mono mt-1">
                                by <span className="text-gray-300">{post.author}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {/* Dummy Icons for Party preview */}
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <div key={n} className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-[10px] text-gray-500 border border-white/5">
                                        P{n}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-1.5 flex-wrap">
                                    {post.tags.map(t => (
                                        <Badge variant="outline" key={t} className="text-[10px] border-accent-emerald/20 text-accent-emerald/80 bg-accent-emerald/5 px-1 py-0">
                                            #{t}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                                    <span className="flex items-center gap-1 hover:text-red-400 transition-colors cursor-pointer">
                                        <Heart className="w-3.5 h-3.5" /> {post.likes || 0}
                                    </span>
                                    <span className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer">
                                        <MessageSquare className="w-3.5 h-3.5" /> {post.comments || 0}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center pt-8">
                <Button variant="secondary" className="border border-white/10 bg-transparent text-gray-400 hover:text-white" onClick={fetchPosts}>새로고침</Button>
            </div>
        </div >
    );
}
