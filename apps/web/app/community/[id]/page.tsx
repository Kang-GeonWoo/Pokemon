"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Heart, MessageSquare, Flag, Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CommunityPostPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

    // Dummy user checking (상시 노출로 변경하여 테스트 가능하게 함)
    const isAuthor = true;

    useEffect(() => {
        if (!id) return;
        Promise.all([
            fetch(`${apiBase}/api/community/posts/${id}`).then(r => r.json()),
            fetch(`${apiBase}/api/community/posts/${id}/comments`).then(r => r.json())
        ])
            .then(([postData, commentsData]) => {
                if (postData.error) {
                    alert(postData.error);
                    router.back();
                } else {
                    setPost(postData);
                    setComments(commentsData.comments || []);
                }
            })
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [id, apiBase, router]);

    const handleLike = async () => {
        try {
            const res = await fetch(`${apiBase}/api/community/posts/${id}/like`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setLiked(data.liked);
                setPost((prev: any) => ({ ...prev, likes: prev.likes + (data.liked ? 1 : -1) }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleReport = async () => {
        if (!confirm("이 게시글을 신고하시겠습니까? 누적 신고 시 자동 삭제 처리됩니다.")) return;
        try {
            const res = await fetch(`${apiBase}/api/community/posts/${id}/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "SPAM" })
            });
            const data = await res.json();
            if (data.success) {
                alert("신고가 접수되었습니다.");
                if (data.reportCount >= 50) {
                    alert("누적 신고 횟수 초과로 해당 게시물이 블라인드 되었습니다.");
                    router.push('/community');
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async () => {
        if (!confirm("정말 이 게시물을 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`${apiBase}/api/community/posts/${id}`, { method: "DELETE" });
            if (res.ok) {
                alert("삭제되었습니다.");
                router.push("/community");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        try {
            const res = await fetch(`${apiBase}/api/community/posts/${id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: newComment })
            });
            if (res.ok) {
                setNewComment("");
                // Refresh comments
                const cRes = await fetch(`${apiBase}/api/community/posts/${id}/comments`);
                const cData = await cRes.json();
                setComments(cData.comments || []);
            }
        } catch (e) {
            console.error("Comment submit error", e);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-accent-cyan" /></div>;
    }

    if (!post) {
        return <div className="text-center py-20 text-gray-400">게시글이 존재하지 않습니다.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in pb-20">
            {/* Header / Nav */}
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => router.push('/community')} className="text-gray-400 hover:text-white -ml-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    목록으로
                </Button>

                <div className="flex gap-2">
                    {isAuthor && (
                        <>
                            <Button variant="secondary" size="sm" onClick={() => router.push(`/community/write?edit=${id}`)}>
                                <Edit className="w-4 h-4 mr-2" /> 수정
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleDelete} className="bg-red-500/20 text-red-400 hover:bg-red-500/40">
                                <Trash2 className="w-4 h-4 mr-2" /> 삭제
                            </Button>
                        </>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleReport} className="text-gray-500 hover:text-yellow-400">
                        <Flag className="w-4 h-4 mr-2" /> 신고
                    </Button>
                </div>
            </div>

            {/* Post Content */}
            <div className="bg-[#1e1e1e] border border-white/5 rounded-t-2xl p-6 md:p-10 shadow-xl mb-0">
                <div className="border-b border-white/10 pb-6 mb-6">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-6 leading-tight flex items-center gap-3">
                        {post.tags?.map((t: string) => (
                            <span key={t} className="text-sm font-medium text-accent-emerald bg-accent-emerald/10 px-2.5 py-1 rounded border border-accent-emerald/20">
                                {t}
                            </span>
                        ))}
                        {post.title}
                    </h1>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-cyan to-primary flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                {post.author.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-200 font-bold text-base">{post.author}</span>
                                <span className="text-gray-500 text-xs font-mono">{new Date(post.createdAt).toLocaleString('ko-KR')}</span>
                            </div>
                        </div>
                        <div className="flex gap-4 text-gray-400 font-medium">
                            <span>조회수 <b className="text-gray-300">{(post.likes * 3 + Math.floor(Math.random() * 50))}</b></span>
                            <span>댓글 <b className="text-gray-300">{comments.length}</b></span>
                        </div>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none min-h-[300px] text-gray-200 leading-relaxed whitespace-pre-wrap text-lg p-2">
                    {/* In a real app, use a markdown renderer here */}
                    {post.body}
                </div>

                <div className="flex flex-col items-center mt-16 mb-8 gap-3">
                    <Button
                        size="lg"
                        className={`rounded-full px-8 h-14 gap-3 border transition-all shadow-lg ${liked ? 'bg-red-500 hover:bg-red-600 border-red-400 text-white' : 'bg-surface/50 border-white/10 hover:border-red-400 hover:text-red-400 text-gray-300'}`}
                        onClick={handleLike}
                    >
                        <Heart className={`w-6 h-6 ${liked ? 'fill-current text-white' : ''}`} />
                        <span className="font-bold text-xl">{post.likes}</span>
                    </Button>
                    <span className="text-xs text-gray-500">이 게시글이 도움이 되셨다면 추천을 눌러주세요!</span>
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-[#1a1a1a] rounded-b-2xl p-6 md:p-8 border border-white/5 border-t-0 shadow-xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white border-b border-white/10 pb-4">
                    <MessageSquare className="w-5 h-5 text-accent-cyan" />
                    댓글 <span className="text-accent-cyan font-bold">{comments.length}</span>
                </h3>

                <div className="flex gap-3 mb-8">
                    <Input
                        placeholder="이 파티/글에 대한 의견을 남겨주세요..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-black/30 border-white/10 h-12 focus:border-accent-cyan transition-colors"
                        onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                    />
                    <Button onClick={handleCommentSubmit} className="h-12 px-6 bg-accent-cyan hover:bg-cyan-600 text-white shadow-lg">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-0 border-t border-white/5 pt-4">
                    {comments.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 bg-black/20 rounded-lg border border-dashed border-white/5">
                            등록된 댓글이 없습니다. 첫 댓글을 남겨주세요.
                        </div>
                    ) : (
                        comments.map((c, idx) => (
                            <div key={c.id} className={`p-4 flex flex-col gap-2 group ${idx !== comments.length - 1 ? 'border-b border-white/5' : ''}`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white font-bold opacity-80">
                                            {c.author.charAt(0)}
                                        </div>
                                        <span className="font-bold text-gray-200 text-sm">{c.author}</span>
                                    </div>
                                </div>
                                <div className="text-gray-300 text-[15px] pl-8 leading-relaxed whitespace-pre-wrap">{c.body}</div>
                                <div className="text-[11px] text-gray-500 font-mono pl-8">{new Date(c.createdAt).toLocaleString('ko-KR')}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
