"use client"

import * as React from "react"
import { useMetadata } from "@/hooks/useMetadata"
import { Tabs } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PokemonSearch } from "@/components/ui/pokemon-search"
import { SlotEditor } from "@/components/team-builder/slot-editor"
import { ShowdownImportDialog } from "@/components/team-builder/showdown-import"
import { ShowdownExportDialog } from "@/components/team-builder/showdown-export"
import { AIFeedbackDialog } from "@/components/team-builder/ai-feedback"
import { Plus, Trash2, Save, Download, Upload, Zap, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Individual Pokemon Slot Data Structure
type TeamSlot = {
    speciesId: string
    abilityId: string
    itemId: string
    natureId: string
    evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }
    ivs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }
    moves: string[]
    teraType: string
    level: number
}

const emptySlot = (): TeamSlot => ({
    speciesId: "",
    abilityId: "",
    itemId: "",
    natureId: "jolly",
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    moves: ["", "", "", ""],
    teraType: "",
    level: 50
})

export default function TeamBuilderPage() {
    const metadata = useMetadata()
    const [team, setTeam] = React.useState<Record<string, TeamSlot>>({
        "1": emptySlot(),
        "2": emptySlot(),
        "3": emptySlot(),
        "4": emptySlot(),
        "5": emptySlot(),
        "6": emptySlot(),
    })
    const [activeTab, setActiveTab] = React.useState("1")
    const [allowedMovesBySlot, setAllowedMovesBySlot] = React.useState<Record<string, string[]>>({})
    const [isImportOpen, setIsImportOpen] = React.useState(false)
    const [isExportOpen, setIsExportOpen] = React.useState(false)
    const [isAIOpen, setIsAIOpen] = React.useState(false)

    const saveTeam = () => {
        localStorage.setItem("saved_pokemon_team", JSON.stringify(team))
        alert("현재 팀이 브라우저에 성공적으로 저장되었습니다!");
    }

    const loadTeam = () => {
        const saved = localStorage.getItem("saved_pokemon_team")
        if (saved) {
            setTeam(JSON.parse(saved))
            alert("저장된 팀을 성공적으로 불러왔습니다!");
        } else {
            alert("저장된 팀 정보가 없습니다.");
        }
    }

    const handlePokemonSelect = async (id: string) => {
        setTeam(prev => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], speciesId: id }
        }))

        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            if (res.ok) {
                const data = await res.json()
                const firstAbility = data.abilities.find((a: any) => !a.is_hidden) || data.abilities[0];
                const allowedMoves = data.moves.map((m: any) => m.move.name.replace(/[^a-z0-9]/g, ''))

                setTeam(prev => {
                    // Make sure the selected speciesId hasn't changed during fetch
                    if (prev[activeTab].speciesId === id) {
                        return {
                            ...prev,
                            [activeTab]: {
                                ...prev[activeTab],
                                abilityId: firstAbility?.ability.name || ""
                            }
                        }
                    }
                    return prev
                })

                setAllowedMovesBySlot(prev => ({
                    ...prev,
                    [activeTab]: allowedMoves
                }))
            }
        } catch (error) {
            console.error("Failed to fetch pokemon details", error)
        }
    }

    const handleSlotChange = (updated: TeamSlot) => {
        setTeam(prev => ({
            ...prev,
            [activeTab]: updated
        }))
    }

    const clearSlot = () => {
        setTeam(prev => ({
            ...prev,
            [activeTab]: emptySlot()
        }))
        setAllowedMovesBySlot(prev => ({
            ...prev,
            [activeTab]: []
        }))
    }

    // Tabs definition
    const tabs = [1, 2, 3, 4, 5, 6].map(n => ({
        id: n.toString(),
        label: (
            <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-[10px]">{n}</span>
                <span className="truncate max-w-[80px]">
                    {team[n.toString()].speciesId
                        ? (metadata?.pokemon[team[n.toString()].speciesId] || team[n.toString()].speciesId)
                        : "비어있음"}
                </span>
            </div>
        )
    }))

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
                <div>
                    <h1 className="text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-violet to-secondary">
                        팀 빌더
                    </h1>
                    <p className="text-gray-400 mt-2">
                        나만의 최강 팀을 구성하고 시뮬레이션 하세요.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="secondary" size="sm" className="gap-2" onClick={() => setIsImportOpen(true)}>
                        <Upload className="w-4 h-4" /> 가져오기
                    </Button>
                    <Button variant="secondary" size="sm" className="gap-2" onClick={() => setIsExportOpen(true)}>
                        <Download className="w-4 h-4" /> 내보내기
                    </Button>
                    <Button size="sm" className="gap-2 px-4 shadow-lg shadow-primary/20 bg-gradient-to-r from-accent-violet to-primary hover:from-primary hover:to-accent-violet border-none text-white font-medium" onClick={() => setIsAIOpen(true)}>
                        <Sparkles className="w-4 h-4" /> AI 분석
                    </Button>
                    <Button size="sm" variant="secondary" className="gap-2 text-gray-300" onClick={saveTeam}>
                        <Save className="w-4 h-4" /> 팀 저장
                    </Button>
                    <Button size="sm" variant="secondary" className="gap-2 text-gray-300" onClick={loadTeam}>
                        <Upload className="w-4 h-4" /> 팀 불러오기
                    </Button>
                </div>
            </div>

            {/* Dialogs */}
            <AIFeedbackDialog
                isOpen={isAIOpen}
                onClose={() => setIsAIOpen(false)}
                team={team}
            />

            <ShowdownImportDialog
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImport={(newTeam) => setTeam(newTeam)}
            />

            <ShowdownExportDialog
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                team={team}
            />

            {/* Slot Tabs */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Editor Area */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {/* Left side: Pokemon Info & Selection */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-surface/40 backdrop-blur-xl border-white/5 overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5">
                            <CardTitle className="text-sm uppercase tracking-widest text-gray-400">포켓몬 선택</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {metadata ? (
                                <PokemonSearch
                                    pokemonList={metadata.pokemon}
                                    onSelect={handlePokemonSelect}
                                />
                            ) : (
                                <div className="h-10 bg-white/5 animate-pulse rounded-lg" />
                            )}

                            <div className="aspect-square rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 flex items-center justify-center relative overflow-hidden group">
                                {team[activeTab].speciesId ? (
                                    <div className="text-center p-4">
                                        <div className="text-3xl font-bold mb-2">
                                            {metadata?.pokemon[team[activeTab].speciesId] || team[activeTab].speciesId}
                                        </div>
                                        <div className="text-gray-500 font-mono text-sm uppercase">{team[activeTab].speciesId}</div>
                                        {/* Placeholder for sprite */}
                                        <div className="mt-8 text-primary/40 relative">
                                            <Zap className="w-20 h-20 mx-auto animate-pulse" />
                                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-600">
                                        <Plus className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                        <p>포켓몬을 선택하세요</p>
                                    </div>
                                )}
                            </div>

                            <Button onClick={clearSlot} variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2">
                                <Trash2 className="w-4 h-4" /> 슬롯 초기화
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right side: Detailed Stats & Moves */}
                <div className="lg:col-span-8">
                    {team[activeTab].speciesId ? (
                        <SlotEditor
                            slot={team[activeTab]}
                            allowedMoves={allowedMovesBySlot[activeTab]}
                            onChange={handleSlotChange}
                        />
                    ) : (
                        <Card className="bg-surface/40 backdrop-blur-xl border-white/5 h-full min-h-[500px] flex items-center justify-center border-dashed">
                            <div className="text-center text-gray-500 max-w-sm p-8">
                                <Plus className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                <h3 className="text-lg font-medium text-white/50 mb-2">에디터 대기 중</h3>
                                <p>왼쪽에서 포켓몬을 먼저 선택하시면 상세 설정을 시작할 수 있습니다.</p>
                            </div>
                        </Card>
                    )}
                </div>
            </section>
        </div>
    )
}
