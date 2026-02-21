"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Search, PlusCircle, MessageSquare, Heart, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

type Post = {
    id: string;
    title: string;
    author: string;
    likes: number;
    comments: number;
    tags: string[];
};

export default function CommunityPage() {
    const [isWriting, setIsWriting] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [newTitle, setNewTitle] = useState("");
    const [newBody, setNewBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
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

    const handleSubmit = async () => {
        if (!newTitle.trim() || !newBody.trim()) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }
        try {
            const res = await fetch(`${apiBase}/api/community/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle, body: newBody }),
            });
            if (res.ok) {
                alert("성공적으로 글이 게시되었습니다!");
                setIsWriting(false);
                setNewTitle("");
                setNewBody("");
                fetchPosts();
            } else {
                const data = await res.json();
                alert(data.error || "작성 실패");
            }
        } catch (e) {
            alert("서버와 통신할 수 없습니다.");
        }
    };
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
                    <Button className="gap-2 shrink-0 bg-accent-emerald hover:bg-emerald-600 text-white" onClick={() => setIsWriting(true)}>
                        <PlusCircle className="w-4 h-4" /> 내 파티 공유하기
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

            {/* Write Post Modal */}
            {isWriting && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-surface/90 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setIsWriting(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold mb-4">새 파티 공유 게시글 작성</h2>
                        <Input
                            placeholder="글 제목 (예: 시즌 13 마스터볼 타부자고 렌탈팀)"
                            className="bg-black/20"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="파티 사용 방법과 코드를 입력해주세요..."
                            className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent-emerald"
                            value={newBody}
                            onChange={e => setNewBody(e.target.value)}
                        ></textarea>
                        <Button className="w-full bg-accent-emerald hover:bg-emerald-600 text-white shadow-lg" onClick={handleSubmit}>
                            게시하기
                        </Button>
                    </div>
                </div>
            )
            }

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
                    <Card key={post.id || i} className="bg-surface/40 backdrop-blur-xl border-white/5 hover:border-accent-emerald/50 transition-all hover:-translate-y-1 group cursor-pointer" onClick={() => setSelectedPost(post)}>
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

            {/* Read Post Modal */}
            {selectedPost && selectedPost.id && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4" onClick={(e) => {
                    if (e.target === e.currentTarget) setSelectedPost(null);
                }}>
                    <div className="bg-surface border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/20 p-2 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="mb-6 border-b border-white/10 pb-4 pr-8">
                            <h2 className="text-2xl font-bold text-white mb-2">{selectedPost.title}</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>작성자: <span className="text-gray-200">{selectedPost.author}</span></span>
                                <div className="flex gap-1.5 flex-wrap">
                                    {selectedPost.tags?.map(t => (
                                        <Badge variant="outline" key={t} className="text-[10px] border-accent-emerald/20 text-accent-emerald/80 bg-accent-emerald/5 px-1 py-0">
                                            #{t}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="text-gray-200 whitespace-pre-wrap leading-relaxed min-h-[150px] bg-black/20 p-4 rounded-xl border border-white/5">
                            {/* @ts-ignore */}
                            {selectedPost.body || "내용이 없습니다."}
                        </div>

                        <div className="mt-8 flex justify-between items-center pt-4 border-t border-white/10">
                            <Button variant="ghost" className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                <Heart className="w-4 h-4" /> 추천 ({selectedPost.likes || 0})
                            </Button>
                            <Button variant="secondary" onClick={() => setSelectedPost(null)}>
                                닫기
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
