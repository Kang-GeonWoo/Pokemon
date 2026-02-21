"use client"

import * as React from "react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMetadata } from "@/hooks/useMetadata"
import { Copy, CheckCircle2 } from "lucide-react"

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

interface ShowdownExportProps {
    isOpen: boolean
    onClose: () => void
    team: Record<string, TeamSlot>
}

export function ShowdownExportDialog({ isOpen, onClose, team }: ShowdownExportProps) {
    const metadata = useMetadata()
    const [copied, setCopied] = React.useState(false)

    const generateText = React.useCallback(() => {
        if (!metadata) return ""

        let result = ""
        for (let i = 1; i <= 6; i++) {
            const slot = team[i.toString()]
            if (!slot || !slot.speciesId) continue

            const speciesName = metadata.pokemon[slot.speciesId] || slot.speciesId
            const itemName = slot.itemId ? (metadata.items[slot.itemId] || slot.itemId) : ""
            const abilityName = slot.abilityId ? (metadata.abilities[slot.abilityId] || slot.abilityId) : ""
            const teraTypeName = slot.teraType ? (metadata.types[slot.teraType] || slot.teraType) : ""
            const natureName = slot.natureId ? (metadata.natures[slot.natureId] || slot.natureId) : ""

            result += itemName ? `${speciesName} @ ${itemName}\n` : `${speciesName}\n`
            if (abilityName) result += `특성: ${abilityName}\n`
            if (slot.level !== 50) result += `Level: ${slot.level}\n`
            if (teraTypeName) result += `테라스탈: ${teraTypeName}\n`

            // EVs
            const evs = []
            if (slot.evs.hp) evs.push(`${slot.evs.hp} HP`)
            if (slot.evs.atk) evs.push(`${slot.evs.atk} Atk`)
            if (slot.evs.def) evs.push(`${slot.evs.def} Def`)
            if (slot.evs.spa) evs.push(`${slot.evs.spa} SpA`)
            if (slot.evs.spd) evs.push(`${slot.evs.spd} SpD`)
            if (slot.evs.spe) evs.push(`${slot.evs.spe} Spe`)
            if (evs.length > 0) result += `EVs: ${evs.join(' / ')}\n`

            if (natureName) result += `${natureName} 성격\n`

            // IVs
            const ivs = []
            if (slot.ivs.hp !== 31) ivs.push(`${slot.ivs.hp} HP`)
            if (slot.ivs.atk !== 31) ivs.push(`${slot.ivs.atk} Atk`)
            if (slot.ivs.def !== 31) ivs.push(`${slot.ivs.def} Def`)
            if (slot.ivs.spa !== 31) ivs.push(`${slot.ivs.spa} SpA`)
            if (slot.ivs.spd !== 31) ivs.push(`${slot.ivs.spd} SpD`)
            if (slot.ivs.spe !== 31) ivs.push(`${slot.ivs.spe} Spe`)
            if (ivs.length > 0) result += `IVs: ${ivs.join(' / ')}\n`

            // Moves
            for (const moveId of slot.moves) {
                if (moveId) {
                    const moveName = metadata.moves[moveId] || moveId
                    result += `- ${moveName}\n`
                }
            }
            result += "\n"
        }
        return result.trim()
    }, [team, metadata])

    const text = generateText()

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="텍스트로 팀 내보내기">
            <div className="space-y-4">
                <p className="text-sm text-gray-400">
                    작성된 파티를 게임이나 다른 커뮤니티에 공유할 수 있도록 텍스트로 내보냅니다.
                </p>
                <div className="relative">
                    <textarea
                        readOnly
                        value={text}
                        className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-gray-300 font-mono resize-none focus:outline-none"
                    />
                    <Button
                        size="sm"
                        onClick={handleCopy}
                        variant="secondary"
                        className="absolute top-2 right-2 gap-2 bg-surface backdrop-blur-md"
                    >
                        {copied ? (
                            <><CheckCircle2 className="w-4 h-4 text-green-400" /> 복사 완료</>
                        ) : (
                            <><Copy className="w-4 h-4" /> 복사하기</>
                        )}
                    </Button>
                </div>
                <div className="flex justify-end pt-2">
                    <Button variant="ghost" onClick={onClose}>닫기</Button>
                </div>
            </div>
        </Dialog>
    )
}
