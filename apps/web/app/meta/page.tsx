"use client";

import { useMetadata } from "@/hooks/useMetadata";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function MetaAnalyticsPage() {
    const metadata = useMetadata();

    // Mock top 10 usage rankings
    const mockRankings = [
        { id: "gholdengo", rank: 1, trend: "up" },
        { id: "dragonite", rank: 2, trend: "same" },
        { id: "fluttermane", rank: 3, trend: "up" },
        { id: "ironbundle", rank: 4, trend: "down" },
        { id: "chi-yu", rank: 5, trend: "up" },
        { id: "ting-lu", rank: 6, trend: "same" },
        { id: "chien-pao", rank: 7, trend: "down" },
        { id: "amoonguss", rank: 8, trend: "up" },
        { id: "corviknight", rank: 9, trend: "down" },
        { id: "urshifu-rapid-strike", rank: 10, trend: "up" },
    ];

    if (!metadata) {
        return <div className="flex justify-center items-center min-h-[50vh] animate-pulse">데이터 로딩 중...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-primary flex items-center gap-3">
                        <BarChart3 className="w-10 h-10 text-accent-cyan" />
                        메타 분석
                    </h1>
                    <p className="text-gray-400 mt-2">
                        현재 랭크 배틀 시즌의 포켓몬 사용률 및 트렌드를 확인하세요.
                    </p>
                </div>
                <div className="bg-surface/50 border border-white/10 px-4 py-2 rounded-lg text-sm font-mono text-gray-300">
                    시즌 13 싱글배틀 규정 G
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {mockRankings.map((p, i) => {
                    const pokeName = metadata.pokemon[p.id] || p.id;
                    return (
                        <Card key={p.id} className="bg-surface/40 backdrop-blur-xl border-white/5 flex items-center p-4 hover:border-accent-cyan/50 hover:bg-surface/60 transition-all hover:translate-x-1 group">
                            <div className="w-16 text-center text-2xl font-black font-mono text-gray-500 group-hover:text-white transition-colors">
                                #{p.rank}
                            </div>
                            <div className="w-10 flex justify-center items-center">
                                {p.trend === 'up' && <TrendingUp className="w-5 h-5 text-accent-emerald" />}
                                {p.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-400" />}
                                {p.trend === 'same' && <Minus className="w-5 h-5 text-gray-500" />}
                            </div>
                            <div className="flex-1 px-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-accent-cyan transition-colors">
                                    {pokeName}
                                </h3>
                                <div className="text-sm font-mono text-gray-500 uppercase">{p.id}</div>
                            </div>
                            <div className="hidden md:flex gap-2">
                                <Badge variant="outline" className="border-white/10 bg-black/20 text-gray-300">사용률 {(30 - i * 2.5).toFixed(1)}%</Badge>
                                <Badge variant="outline" className="border-white/10 bg-black/20 text-gray-300">승률 {(52 - i * 0.3).toFixed(1)}%</Badge>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
