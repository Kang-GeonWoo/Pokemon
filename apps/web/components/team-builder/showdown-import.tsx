"use client"

import * as React from "react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMetadata } from "@/hooks/useMetadata"
import { Loader2 } from "lucide-react"

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

interface ShowdownImportProps {
    isOpen: boolean
    onClose: () => void
    onImport: (team: Record<string, TeamSlot>) => void
}

export function ShowdownImportDialog({ isOpen, onClose, onImport }: ShowdownImportProps) {
    const metadata = useMetadata()
    const [text, setText] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    const handleImport = async () => {
        setIsLoading(true)
        // Simulate parsing delay for better UX (so user sees loading state)
        await new Promise(r => setTimeout(r, 600))

        if (!metadata) {
            setIsLoading(false)
            return
        }

        const lines = text.split('\n')
        const newTeam: Record<string, TeamSlot> = {}
        let currentSlot = 1

        let currentMon: Partial<TeamSlot> = {
            evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
            moves: ["", "", "", ""],
            level: 50
        }
        let moveIndex = 0

        const toId = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '')

        const saveCurrentMon = () => {
            if (currentMon.speciesId && currentSlot <= 6) {
                newTeam[currentSlot.toString()] = {
                    ...currentMon,
                    abilityId: currentMon.abilityId || "",
                    itemId: currentMon.itemId || "",
                    natureId: currentMon.natureId || "jolly",
                    teraType: currentMon.teraType || "",
                } as TeamSlot
                currentSlot++
            }
            currentMon = {
                evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
                ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
                moves: ["", "", "", ""],
                level: 50
            }
            moveIndex = 0
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) {
                // Empty line denotes end of a Pokemon block
                if (currentMon.speciesId) {
                    saveCurrentMon()
                }
                continue
            }

            // Move
            if (line.startsWith('-')) {
                const moveName = line.substring(1).trim()
                const moveId = metadata.reverseMoves[moveName] || toId(moveName)
                if (moveIndex < 4) {
                    currentMon.moves![moveIndex] = moveId
                    moveIndex++
                }
                continue
            }

            // Ability
            if (line.startsWith('Ability:') || line.startsWith('특성:')) {
                const abilityName = line.split(':')[1].trim()
                currentMon.abilityId = metadata.reverseAbilities[abilityName] || toId(abilityName)
                continue
            }

            // EVs
            if (line.startsWith('EVs:') || line.startsWith('노력치:')) {
                const evParts = line.split(':')[1].trim().split('/')
                evParts.forEach(part => {
                    const [valStr, stat] = part.trim().split(' ')
                    const val = parseInt(valStr) || 0
                    const statLower = stat.toLowerCase()
                    if (statLower.includes('hp')) currentMon.evs!.hp = val
                    if (statLower.includes('atk') || statLower.includes('공')) currentMon.evs!.atk = val
                    if (statLower.includes('def') || statLower.includes('방')) currentMon.evs!.def = val
                    if (statLower.includes('spa') || statLower.includes('특공')) currentMon.evs!.spa = val
                    if (statLower.includes('spd') || statLower.includes('특방')) currentMon.evs!.spd = val
                    if (statLower.includes('spe') || statLower.includes('스')) currentMon.evs!.spe = val
                })
                continue
            }

            // IVs
            if (line.startsWith('IVs:') || line.startsWith('개체값:')) {
                const ivParts = line.split(':')[1].trim().split('/')
                ivParts.forEach(part => {
                    const [valStr, stat] = part.trim().split(' ')
                    const val = parseInt(valStr) || 0
                    const statLower = stat.toLowerCase()
                    if (statLower.includes('hp')) currentMon.ivs!.hp = val
                    if (statLower.includes('atk') || statLower.includes('공')) currentMon.ivs!.atk = val
                    if (statLower.includes('def') || statLower.includes('방')) currentMon.ivs!.def = val
                    if (statLower.includes('spa') || statLower.includes('특공')) currentMon.ivs!.spa = val
                    if (statLower.includes('spd') || statLower.includes('특방')) currentMon.ivs!.spd = val
                    if (statLower.includes('spe') || statLower.includes('스')) currentMon.ivs!.spe = val
                })
                continue
            }

            // Nature
            if (line.includes('Nature') || line.includes('성격')) {
                const natureName = line.split(' ')[0]
                currentMon.natureId = metadata.reverseNatures[natureName] || toId(natureName)
                continue
            }

            // Tera Type
            if (line.startsWith('Tera Type:') || line.startsWith('테라스탈:')) {
                const typeName = line.split(':')[1].trim()
                currentMon.teraType = metadata.reverseTypes[typeName] || toId(typeName)
                continue
            }

            // If it's a new Pokemon (First line of a block: Species @ Item)
            if (!currentMon.speciesId) {
                const parts = line.split('@')
                const speciesName = parts[0].trim()
                currentMon.speciesId = metadata.reversePokemon[speciesName] || toId(speciesName)

                if (parts.length > 1) {
                    const itemName = parts[1].trim()
                    currentMon.itemId = metadata.reverseItems[itemName] || toId(itemName)
                }
            }
        }

        // Save last pokemon if exists
        if (currentMon.speciesId) {
            saveCurrentMon()
        }

        // Fill remaining slots with empty
        const emptySlot = (): TeamSlot => ({
            speciesId: "", abilityId: "", itemId: "", natureId: "jolly",
            evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
            moves: ["", "", "", ""], teraType: "", level: 50
        })

        for (let j = 1; j <= 6; j++) {
            if (!newTeam[j.toString()]) {
                newTeam[j.toString()] = emptySlot()
            }
        }

        onImport(newTeam)
        setIsLoading(false)
        setText("")
        onClose()
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="텍스트로 렌탈 팀 가져오기">
            <div className="space-y-4">
                <p className="text-sm text-gray-400">
                    포켓몬 쇼다운 포맷의 텍스트를 붙여넣어 팀을 한 번에 구성하세요. (한국어 및 영어 지원)
                </p>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={`망나뇽 @ 구애머리띠\n특성: 멀티스케일\n테라스탈: 노말\nEVs: 252 Atk / 4 SpD / 252 Spe\n고집 성격\n- 신속\n- 역린\n- 지진\n- 불꽃펀치`}
                    className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-gray-300 font-mono resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                />
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={onClose}>취소</Button>
                    <Button onClick={handleImport} disabled={!text.trim() || isLoading} className="min-w-[100px]">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "가져오기"}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}
