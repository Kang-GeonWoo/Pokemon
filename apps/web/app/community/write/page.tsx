"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2, Edit } from "lucide-react";

export default function CommunityWritePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [type, setType] = useState<"TEAM" | "FREE">("TEAM");
    const [loading, setLoading] = useState(false);
    const [initialFetch, setInitialFetch] = useState(!!editId);

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

    useEffect(() => {
        if (editId) {
            fetch(`${apiBase}/api/community/posts/${editId}`)
                .then(r => r.json())
                .then(data => {
                    if (data.id) {
                        setTitle(data.title);
                        setBody(data.body);
                        setType(data.tags?.includes('자유') ? 'FREE' : 'TEAM');
                    }
                })
                .catch(e => console.error(e))
                .finally(() => setInitialFetch(false));
        } else {
            setInitialFetch(false);
        }
    }, [editId, apiBase]);

    const handleSubmit = async () => {
        if (!title.trim() || !body.trim()) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            const url = editId ? `${apiBase}/api/community/posts/${editId}` : `${apiBase}/api/community/posts`;
            const method = editId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, body, type }),
            });

            if (res.ok) {
                const data = await res.json();
                alert(editId ? "성공적으로 수정되었습니다!" : "성공적으로 등록되었습니다!");
                router.push(editId ? `/community/${editId}` : '/community');
            } else {
                const data = await res.json();
                alert(data.error || "작성 실패");
            }
        } catch (e) {
            alert("서버와 통신할 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (initialFetch) {
        return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-accent-emerald" /></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                뒤로 가기
            </Button>

            <div className="bg-[#1e1e1e] border border-white/5 rounded-2xl p-6 md:p-10 shadow-xl">
                <h1 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
                    <Edit className="w-6 h-6 text-accent-emerald" />
                    {editId ? '게시글 수정' : '새 게시글 작성'}
                </h1>

                <div className="space-y-6">
                    <div className="flex gap-6 p-4 bg-black/20 rounded-xl border border-white/5">
                        <label className="flex items-center gap-2 cursor-pointer transition-colors hover:text-white">
                            <input
                                type="radio"
                                name="postType"
                                checked={type === "TEAM"}
                                onChange={() => setType("TEAM")}
                                className="accent-accent-emerald w-4 h-4"
                            />
                            <span className={`font-medium ${type === "TEAM" ? "text-accent-emerald" : "text-gray-400"}`}>렌탈팀 공유</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer transition-colors hover:text-white">
                            <input
                                type="radio"
                                name="postType"
                                checked={type === "FREE"}
                                onChange={() => setType("FREE")}
                                className="accent-accent-emerald w-4 h-4"
                            />
                            <span className={`font-medium ${type === "FREE" ? "text-accent-emerald" : "text-gray-400"}`}>자유 게시판</span>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 pl-1">제목</label>
                        <Input
                            placeholder={type === "TEAM" ? "예: 시즌 13 마스터볼 타부자고 렌탈팀" : "제목을 입력해주세요"}
                            className="bg-black/30 border-white/10 h-14 text-lg focus:border-accent-emerald transition-colors"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 pl-1">내용</label>
                        <textarea
                            placeholder={type === "TEAM" ? "포켓몬들의 상세 정보, 파티 운영법, 렌탈 코드를 입력해주세요..." : "내용을 자유롭게 입력해주세요..."}
                            className="w-full h-[400px] bg-black/30 border border-white/10 rounded-xl p-4 text-base resize-y focus:outline-none focus:border-accent-emerald transition-colors text-white"
                            value={body}
                            onChange={e => setBody(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            className="bg-accent-emerald hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 px-8 h-12 text-lg"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                            {editId ? '수정 완료' : '작성 완료'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
