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

    // Dummy user checking
    const isAuthor = post?.author === "익명트레이너";

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
            <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl mb-8">
                <div className="border-b border-white/10 pb-6 mb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags?.map((t: string) => (
                            <Badge key={t} variant="outline" className="text-xs border-accent-emerald/30 text-accent-emerald/90 bg-accent-emerald/5 px-2 py-0.5">
                                #{t}
                            </Badge>
                        ))}
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
                    <div className="flex justify-between items-end text-sm text-gray-400 font-medium">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-cyan to-primary flex items-center justify-center text-white font-bold opacity-80">
                                {post.author.charAt(0)}
                            </div>
                            <span className="text-gray-200 text-base">{post.author}</span>
                        </div>
                        <div className="text-xs font-mono opacity-60">
                            {new Date(post.createdAt).toLocaleString('ko-KR')}
                        </div>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none min-h-[200px] text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {/* In a real app, use a markdown renderer here */}
                    {post.body}
                </div>

                <div className="flex justify-center mt-12 mb-4">
                    <Button
                        size="lg"
                        variant="outline"
                        className={`rounded-full px-8 gap-3 border-2 transition-all ${liked ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'border-white/10 hover:border-red-500/50 hover:text-red-400'}`}
                        onClick={handleLike}
                    >
                        <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                        <span className="font-bold text-lg">{post.likes}</span>
                    </Button>
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-surface/30 rounded-2xl p-6 md:p-8 border border-white/5">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <MessageSquare className="w-5 h-5 text-accent-cyan" />
                    댓글 <span className="text-gray-500 text-lg">({comments.length})</span>
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

                <div className="space-y-4">
                    {comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-black/10 rounded-xl border border-dashed border-white/5">
                            첫 댓글을 남겨주세요!
                        </div>
                    ) : (
                        comments.map(c => (
                            <div key={c.id} className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col gap-2 group">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-200 text-sm">{c.author}</span>
                                    <span className="text-xs text-gray-500 font-mono">{new Date(c.createdAt).toLocaleString('ko-KR')}</span>
                                </div>
                                <div className="text-gray-300 text-sm">{c.body}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
