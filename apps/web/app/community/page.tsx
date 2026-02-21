"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Search, PlusCircle, MessageSquare, Heart, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function CommunityPage() {
    const [isWriting, setIsWriting] = useState(false);
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
                        <Input placeholder="포켓몬 이름, 파티 태그 검색" className="pl-9 bg-surface/50 border-white/10" />
                    </div>
                    <Button className="gap-2 shrink-0 bg-accent-emerald hover:bg-emerald-600 text-white" onClick={() => setIsWriting(true)}>
                        <PlusCircle className="w-4 h-4" /> 파티 공유하기
                    </Button>
                </div>
            </div>

            {/* Write Post Modal */}
            {isWriting && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-surface/90 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setIsWriting(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold mb-4">새 파티 공유 게시글 작성</h2>
                        <div className="space-y-4">
                            <Input placeholder="글 제목 (예: 시즌 13 마스터볼 타부자고 렌탈팀)" className="bg-black/20" />
                            <textarea placeholder="파티 사용 방법과 코드를 입력해주세요..." className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent-emerald"></textarea>
                            <Button className="w-full bg-accent-emerald hover:bg-emerald-600 text-white shadow-lg" onClick={() => {
                                alert("성공적으로 글이 게시되었습니다! (현재 프론트엔드 모의 구현 테스트 완료)");
                                setIsWriting(false);
                            }}>
                                게시하기
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {[
                    { title: "시즌 13 최종 1위 타부자고 안경 비트다운", author: "지존망나뇽", likes: 124, comments: 23, tags: ["대면구축", "타부자고"] },
                    { title: "안정성 100% 딩루 아머까오 사이클", author: "강철의연금술사", likes: 89, comments: 12, tags: ["사이클", "딩루"] },
                    { title: "망나뇽 고집 용춤 머리띠 스윕파티", author: "신속의망나뇽", likes: 256, comments: 45, tags: ["전개", "망나뇽"] },
                    { title: "초보자 추천: 날개치는머리 스탠다드", author: "뉴비구조대", likes: 512, comments: 88, tags: ["스탠다드", "날개치는머리"] },
                    { title: "파오젠 기띠 룸파티", author: "아이스크림", likes: 67, comments: 8, tags: ["기믹", "파오젠"] },
                    { title: "우라오스(연격) 물방울 세팅", author: "물주먹", likes: 112, comments: 15, tags: ["대면구축", "우라오스"] },
                ].map((post, i) => (
                    <Card key={i} className="bg-surface/40 backdrop-blur-xl border-white/5 hover:border-accent-emerald/50 transition-all hover:-translate-y-1 group">
                        <CardHeader className="pb-3 border-b border-white/10">
                            <CardTitle className="text-lg text-white group-hover:text-accent-emerald transition-colors line-clamp-1">
                                {post.title}
                            </CardTitle>
                            <div className="text-xs text-gray-500 font-mono mt-1">
                                by <span className="text-gray-300">{post.author}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex gap-2">
                                {/* Dummy Icons */}
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <div key={n} className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-[10px] text-gray-500 border border-white/5">
                                        P{n}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-1.5">
                                    {post.tags.map(t => (
                                        <Badge variant="outline" key={t} className="text-xs border-accent-emerald/20 text-accent-emerald/80 bg-accent-emerald/5">
                                            #{t}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1 hover:text-red-400 transition-colors cursor-pointer">
                                        <Heart className="w-3.5 h-3.5" /> {post.likes}
                                    </span>
                                    <span className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer">
                                        <MessageSquare className="w-3.5 h-3.5" /> {post.comments}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center pt-8">
                <Button variant="secondary" className="border border-white/10 bg-transparent text-gray-400 hover:text-white">더 보기</Button>
            </div>
        </div>
    );
}
