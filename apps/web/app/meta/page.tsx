"use client";

import { useMetadata } from "@/hooks/useMetadata";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, Minus, X, Activity, Droplets, Target, Shield, Sword } from "lucide-react";
import { useState, useEffect } from "react";

function toId(text: string) {
    return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

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
        { id: "urshifurapidstrike", rank: 10, trend: "up" },
    ];

    const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);
    const [setsData, setSetsData] = useState<any>(null);
    const [loadingSets, setLoadingSets] = useState(false);

    useEffect(() => {
        if (selectedPokemon && !setsData) {
            setLoadingSets(true);
            fetch('https://play.pokemonshowdown.com/data/sets/gen9.json')
                .then(r => r.json())
                .then(data => setSetsData(data))
                .catch(e => console.error(e))
                .finally(() => setLoadingSets(false));
        }
    }, [selectedPokemon]);

    let displaySets: any[] = [];
    if (selectedPokemon && setsData) {
        // Collect sets across different formats
        for (const format in setsData) {
            const formatData = setsData[format];
            if (formatData && formatData.dex) {
                const searchId = toId(selectedPokemon);
                const targetKey = Object.keys(formatData.dex).find(k => toId(k) === searchId);

                if (targetKey) {
                    const pkmnSets = formatData.dex[targetKey];
                    for (const [name, data] of Object.entries(pkmnSets)) {
                        displaySets.push({ name: `[${format.toUpperCase()}] ${name}`, data });
                        if (displaySets.length >= 5) break;
                    }
                }
            }
            if (displaySets.length >= 5) break;
        }
    }

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
                        <Card key={p.id} onClick={() => setSelectedPokemon(p.id)} className="cursor-pointer bg-surface/40 backdrop-blur-xl border-white/5 flex items-center p-4 hover:border-accent-cyan/50 hover:bg-surface/60 transition-all hover:translate-x-1 group">
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

            {/* Set Modal */}
            {selectedPokemon && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" onClick={(e) => {
                    if (e.target === e.currentTarget) setSelectedPokemon(null);
                }}>
                    <div className="bg-surface border border-white/10 p-6 rounded-2xl w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setSelectedPokemon(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/20 p-2 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-accent-cyan flex items-center gap-2">
                            <Target className="w-6 h-6" /> {metadata.pokemon[selectedPokemon] || selectedPokemon} 유력 샘플 정보
                        </h2>

                        {loadingSets ? (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                                <div className="w-8 h-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin mb-4"></div>
                                글로벌 메타 데이터(Smogon)를 분석하여 유력 샘플을 불러오고 있습니다...
                            </div>
                        ) : displaySets.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 bg-black/20 rounded-xl border border-white/5">
                                이 포켓몬의 등록된 메이저 템플릿 샘플이 아직 없습니다.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {displaySets.map((setObj, i) => {
                                    const d = setObj.data as any;
                                    const abilityName = d.ability;
                                    const ability = (metadata.abilities && metadata.abilities[toId(abilityName)]) || abilityName || '-';

                                    const itemName = d.item;
                                    const item = (metadata.items && metadata.items[toId(itemName)]) || itemName || '-';

                                    const natureName = d.nature;
                                    const nature = (metadata.natures && metadata.natures[toId(natureName)]) || natureName || '-';
                                    const moves = (d.moves || []).map((mArr: any) => {
                                        const m = Array.isArray(mArr) ? mArr[0] : mArr;
                                        return metadata.moves[toId(m)] || m;
                                    });

                                    return (
                                        <Card key={i} className="bg-surface/60 border-white/10 overflow-hidden">
                                            <CardHeader className="bg-black/20 pb-3 border-b border-white/5 py-3">
                                                <CardTitle className="text-lg text-white font-medium flex justify-between items-center">
                                                    <span>샘플 #{i + 1} : <span className="text-accent-emerald">{setObj.name}</span></span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                                        <span className="text-sm text-gray-400 flex items-center gap-1"><Activity className="w-4 h-4" /> 특성</span>
                                                        <span className="text-white font-medium">{ability}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                                        <span className="text-sm text-gray-400 flex items-center gap-1"><Droplets className="w-4 h-4" /> 도구</span>
                                                        <span className="text-white font-medium">{item}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                                        <span className="text-sm text-gray-400">성격 (Nature)</span>
                                                        <span className="text-white font-medium">{nature}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-400">노력치 (EVs)</span>
                                                        <span className="text-xs text-accent-cyan font-mono bg-accent-cyan/10 px-2 py-1 rounded">
                                                            {d.evs ? Object.entries(d.evs).map(([k, v]) => `${k.toUpperCase()}:${v}`).join(' / ') : '기본'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                                                    <h4 className="text-sm text-gray-400 mb-2 border-b border-white/10 pb-1 flex items-center gap-1"><Sword className="w-4 h-4" /> 주요 기술 배치</h4>
                                                    <ul className="space-y-1.5 list-disc list-inside text-gray-200 pl-1">
                                                        {moves.map((m: string, idx: number) => <li key={idx} className="font-medium text-sm">{m}</li>)}
                                                    </ul>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
