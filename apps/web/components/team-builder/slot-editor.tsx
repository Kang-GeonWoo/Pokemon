"use client"

import * as React from "react"
import { useMetadata } from "@/hooks/useMetadata"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Combobox } from "@/components/ui/combobox"
import { Badge } from "@/components/ui/badge"

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

interface SlotEditorProps {
    slot: TeamSlot
    allowedMoves?: string[]
    onChange: (updated: TeamSlot) => void
}

export function SlotEditor({ slot, allowedMoves, onChange }: SlotEditorProps) {
    const metadata = useMetadata()

    if (!slot.speciesId) return null

    const handleEvChange = (stat: keyof TeamSlot["evs"], value: number) => {
        onChange({
            ...slot,
            evs: { ...slot.evs, [stat]: value }
        })
    }

    const handleMoveChange = (index: number, moveId: string) => {
        const newMoves = [...slot.moves]
        newMoves[index] = moveId
        onChange({ ...slot, moves: newMoves })
    }

    // Helper to format options for Select/Combobox
    const getOptions = (map: Record<string, string> | undefined) => {
        if (!map) return []
        return Object.entries(map).map(([id, name]) => ({ value: id, label: name }))
    }

    const stats: (keyof TeamSlot["evs"])[] = ["hp", "atk", "def", "spa", "spd", "spe"]
    const statLabels = { hp: "HP", atk: "공격", def: "방어", spa: "특공", spd: "특방", spe: "스피드" }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Column: Basic Info & Moves */}
            <div className="space-y-6">
                <Card className="bg-white/5 border-white/10 relative z-20">
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Combobox
                                label="특성"
                                options={getOptions(metadata?.abilities)}
                                value={slot.abilityId}
                                onChange={(val) => onChange({ ...slot, abilityId: val })}
                                placeholder="특성 검색"
                            />
                            <Combobox
                                label="도구"
                                options={getOptions(metadata?.items)}
                                value={slot.itemId}
                                onChange={(val) => onChange({ ...slot, itemId: val })}
                                placeholder="도구 검색"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Combobox
                                label="성격"
                                options={getOptions(metadata?.natures)}
                                value={slot.natureId}
                                onChange={(val) => onChange({ ...slot, natureId: val })}
                                placeholder="성격 검색"
                            />
                            <Combobox
                                label="테라스탈"
                                options={getOptions(metadata?.types)}
                                value={slot.teraType}
                                onChange={(val) => onChange({ ...slot, teraType: val })}
                                placeholder="타입 검색"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 relative z-10">
                    <CardContent className="pt-6 space-y-4">
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">기술 (4가지)</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {slot.moves.map((move, i) => (
                                <div key={i} className="flex gap-2 items-start">
                                    <Badge variant="outline" className="w-8 justify-center shrink-0 mt-2">{i + 1}</Badge>
                                    <div className="flex-1 relative">
                                        <Combobox
                                            options={getOptions(metadata?.moves)}
                                            value={move}
                                            onChange={(val) => handleMoveChange(i, val)}
                                            className="flex-1"
                                            placeholder={`기술 ${i + 1} 검색`}
                                        />
                                        {move && allowedMoves && !allowedMoves.includes(move.replace(/[^a-z0-9]/g, '')) && (
                                            <div className="mt-1.5 text-xs text-red-400 font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                                <span className="inline-block w-4 h-4 bg-red-500/20 border border-red-500/50 text-red-500 rounded-full flex items-center justify-center font-bold">!</span>
                                                배울 수 없는 기술입니다
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: EVs & Stats */}
            <div className="space-y-6">
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">노력치 (EVs)</h4>
                            <Badge variant="glass" className="font-mono">
                                Total: {Object.values(slot.evs).reduce((a, b) => a + b, 0)} / 510
                            </Badge>
                        </div>
                        <div className="space-y-4">
                            {stats.map(stat => (
                                <Slider
                                    key={stat}
                                    label={statLabels[stat]}
                                    value={slot.evs[stat]}
                                    max={252}
                                    onChange={(e) => handleEvChange(stat, parseInt(e.target.value))}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
