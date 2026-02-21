"use client";

import { useBattleAssistant } from "../../lib/useBattleAssistant";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InstructionCard } from "@/components/ui/instruction-card";
import { Combobox } from "@/components/ui/combobox";
import { RefreshCw, Zap, Trash2, Shield, Lock, Ban, Eraser, Loader2 } from "lucide-react";
import { useMetadata } from "@/hooks/useMetadata";
import { useState, useEffect, useMemo, useRef } from "react";

export default function BattleAssistantPage() {
  const {
    sid,
    loading,
    error,
    slots,
    setSlots,
    pred,
    saveSlotsAndPredict,
    lockMove,
    banMove,
    clearMove,
    reset,
    resetSession,
  } = useBattleAssistant();

  const metadata = useMetadata();

  // Local state for inputs to allow typing Korean before it matches an ID
  const [inputs, setInputs] = useState<{ [key: string]: string }>({ 1: "", 2: "", 3: "", 4: "", 5: "", 6: "" });
  const [focusedSlot, setFocusedSlot] = useState<number | null>(null);

  // Sync slots to inputs when slots change (e.g. after reset or load) generally
  // But we need to be careful not to overwrite user typing.
  // We only sync if slots are NOT empty and inputs are empty (initial load)
  useEffect(() => {
    if (slots[1] && !inputs[1]) setInputs(prev => ({ ...prev, 1: slots[1] }));
    if (slots[2] && !inputs[2]) setInputs(prev => ({ ...prev, 2: slots[2] }));
    if (slots[3] && !inputs[3]) setInputs(prev => ({ ...prev, 3: slots[3] }));
    if (slots[4] && !inputs[4]) setInputs(prev => ({ ...prev, 4: slots[4] }));
    if (slots[5] && !inputs[5]) setInputs(prev => ({ ...prev, 5: slots[5] }));
    if (slots[6] && !inputs[6]) setInputs(prev => ({ ...prev, 6: slots[6] }));
  }, [slots]);

  // Helper to get Korean Name
  const getName = (id: string) => metadata?.pokemon[id] || id;
  const getMoveName = (id: string) => metadata?.moves[id] || id;

  const moveOptions = useMemo(() => {
    if (!metadata?.moves) return [];
    return Object.entries(metadata.moves).map(([k, v]) => ({ value: k, label: v as string }));
  }, [metadata]);

  const handleInputChange = (n: number, value: string) => {
    setInputs(prev => ({ ...prev, [n]: value }));

    // Try to match ID
    const cleanVal = value.trim();
    let matchedId = cleanVal.toLowerCase().replace(/[^a-z0-9]/g, ""); // basic english id

    // Exact Korean Match
    if (metadata?.reversePokemon[cleanVal]) {
      matchedId = metadata.reversePokemon[cleanVal];
    }

    // Update logic: 
    // If it looks like an English ID, use it.
    // If it matches a Korean name, use the mapped ID.
    // We pass 'matchedId' to setSlots. 
    setSlots(s => ({ ...s, [n]: matchedId }));
  };

  const getSuggestions = (query: string) => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    return Object.entries(metadata?.pokemon || {})
      .filter(([id, name]) => (name as string).toLowerCase().includes(q) || id.includes(q))
      .slice(0, 10); // top 10
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-violet to-secondary">
            배틀 어시스턴트
          </h1>
          <p className="text-gray-400 mt-2">
            상대의 포켓몬을 입력하고 다음 수를 예측하세요.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {sid && <span className="text-xs text-gray-500 font-mono bg-surface/50 px-2 py-1 rounded">SID: {sid.slice(0, 8)}...</span>}
          <Button onClick={() => {
            resetSession();
            setInputs({ 1: "", 2: "", 3: "", 4: "", 5: "", 6: "" });
          }} disabled={loading} variant="secondary" size="sm" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            새 세션 시작
          </Button>
        </div>
      </div>

      {/* User Manual */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <InstructionCard
          title="사용 가이드"
          steps={[
            "1. 상대 포켓몬 이름을 한국어('한카리아스') 또는 영어('garchomp')로 입력하세요.",
            "2. '분석 및 예측 시작'을 누르면 AI가 상대의 기술을 예측합니다.",
            "3. 예측된 기술의 [LOCK], [BAN] 버튼을 사용하여 상황을 시뮬레이션 하세요."
          ]}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg animate-pulse">
          ⚠️ <b>Error:</b> {error}
        </div>
      )}

      {/* Main Input Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {[1, 2, 3, 4, 5, 6].map((n) => {
          const currentId = (slots as any)[n];
          // Check if current input matches a known pokemon (Korean or English ID)
          const isMatched = currentId && (metadata?.pokemon[currentId] || /^[a-z0-9]+$/.test(currentId));
          const displayMatched = metadata?.pokemon[currentId] ? `${metadata.pokemon[currentId]} (${currentId})` : currentId;

          const query = inputs[n as keyof typeof inputs] || "";
          const suggestions = getSuggestions(query);

          return (
            <Card key={n} style={{ zIndex: focusedSlot === n ? 100 : 50 - n }} className={`border-t-4 relative transition-colors ${isMatched ? 'border-t-accent-emerald' : 'border-t-primary/50'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <h2 className="text-6xl font-bold text-white">{n}</h2>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex justify-between">
                  <span>상대 포켓몬 {n}</span>
                  {isMatched && <span className="text-xs bg-accent-emerald/20 text-accent-emerald px-2 py-1 rounded-full">{displayMatched}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Input
                    value={query}
                    onChange={(e) => handleInputChange(n, e.target.value)}
                    onFocus={() => setFocusedSlot(n)}
                    onBlur={() => setTimeout(() => setFocusedSlot(null), 150)}
                    placeholder="예: 타부자고 or 망나뇽"
                    className="text-lg py-6 bg-surface/80 relative z-10"
                  />
                  {focusedSlot === n && query && suggestions.length > 0 && !isMatched && (
                    <div className="absolute top-full left-0 right-0 z-[200] mt-1 bg-surface border border-white/20 rounded-md shadow-2xl overflow-hidden py-1">
                      {suggestions.map(([id, name]) => (
                        <button
                          key={id}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-white/10 text-white text-sm"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleInputChange(n, name as string);
                            setFocusedSlot(null);
                          }}
                        >
                          {name as string} <span className="text-gray-500 text-xs ml-2">({id})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Actions */}
      <div className="flex justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Button onClick={saveSlotsAndPredict} disabled={loading || !sid} size="lg" className="px-8 text-lg gap-2 shadow-lg shadow-primary/20">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
          {loading ? "AI 분석 중..." : "분석 및 예측 시작"}
        </Button>
        <Button onClick={() => {
          reset();
          setInputs({ 1: "", 2: "", 3: "", 4: "", 5: "", 6: "" });
        }} disabled={loading || !sid} variant="ghost" size="lg" className="gap-2 text-gray-400 hover:text-red-400">
          <Trash2 className="w-5 h-5" />
          초기화
        </Button>
      </div>

      <hr className="border-white/10" />

      {/* Predictions List */}
      <section className="space-y-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-accent-cyan" />
          <h2 className="text-2xl font-bold">예측 결과</h2>
        </div>

        {!pred && (
          <div className="text-center py-12 text-gray-500 bg-surface/30 rounded-xl border border-dashed border-white/10">
            포켓몬을 입력하고 분석을 시작하면 여기에 결과가 나타납니다.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pred?.predictions?.map((p, index) => {
            const pokeName = getName(p.species_id);
            return (
              <Card key={p.slot_id} style={{ zIndex: 50 - index }} className="relative bg-surface/40 backdrop-blur-sm border-white/5">
                <CardHeader className="bg-white/5 pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider text-gray-400">Slot {p.slot}</span>
                    {p.species_id && <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">{pokeName}</span>}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {p.moves.length === 0 ? (
                    <div className="text-sm text-gray-400 py-6 text-center bg-black/20 rounded-lg border border-white/5">
                      😔 해당 포맷에서 사용 통계가 없는 포켓몬입니다. <br />(미입국 또는 밴 의심)
                    </div>
                  ) : p.moves.map((m: any) => {
                    const moveName = getMoveName(m.move_id);
                    return (
                      <div key={m.move_id} className="relative group p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-200 flex items-center gap-2">
                            {moveName}
                            {m.warning && (
                              <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30" title="이 기술은 현재 포맷 통계에 존재하지 않습니다. 포켓몬이 배울 수 없는 기술이거나 매우 마이너한 픽입니다.">
                                ⚠️ 통계 없음 (경고)
                              </span>
                            )}
                          </span>
                          <span className={`text-sm font-bold ${m.p > 0.7 ? 'text-accent-emerald' : m.p > 0.3 ? 'text-accent-cyan' : 'text-gray-500'}`}>
                            {(m.p * 100).toFixed(1)}%
                          </span>
                        </div>

                        {/* Probability Bar */}
                        <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full ${m.p > 0.7 ? 'bg-accent-emerald' : m.p > 0.3 ? 'bg-accent-cyan' : 'bg-gray-500'}`}
                            style={{ width: `${m.p * 100}%` }}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => lockMove(p.slot_id, m.move_id)}
                            variant={m.locked ? "default" : "ghost"}
                            size="sm"
                            className={`h-7 px-2 text-xs gap-1 ${m.locked ? 'bg-accent-emerald hover:bg-accent-emerald/80' : ''}`}
                            disabled={loading}
                          >
                            <Lock className="w-3 h-3" /> Lock
                          </Button>
                          <Button
                            onClick={() => banMove(p.slot_id, m.move_id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 hover:text-red-400 hover:bg-red-900/20"
                            disabled={loading}
                          >
                            <Ban className="w-3 h-3" /> Ban
                          </Button>
                          {(m.locked || m.p === 0) && (
                            <Button
                              onClick={() => clearMove(p.slot_id, m.move_id)}
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 text-gray-500 hover:text-white"
                              disabled={loading}
                            >
                              <Eraser className="w-3 h-3" /> Reset
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-4 mt-2 border-t border-white/10">
                    <Combobox
                      options={moveOptions}
                      value=""
                      onChange={(val) => {
                        if (val) lockMove(p.slot_id, val);
                      }}
                      placeholder="관측 기술 직접 검색 🔒"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
