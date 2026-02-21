"use client"

import * as React from "react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMetadata } from "@/hooks/useMetadata"
import { Sparkles, Loader2, AlertTriangle, ShieldCheck, Target } from "lucide-react"

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

interface AIFeedbackProps {
    isOpen: boolean
    onClose: () => void
    team: Record<string, TeamSlot>
}

// Simple type effectiveness chart for simulation
const typeChart: Record<string, Record<string, number>> = {
    normal: { fighting: 2, ghost: 0 },
    fire: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, ice: 0.5, bug: 0.5, steel: 0.5, fairy: 0.5 },
    water: { electric: 2, grass: 2, fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5 },
    electric: { ground: 2, electric: 0.5, flying: 0.5, steel: 0.5 },
    grass: { fire: 2, ice: 2, poison: 2, flying: 2, bug: 2, water: 0.5, electric: 0.5, grass: 0.5, ground: 0.5 },
    ice: { fire: 2, fighting: 2, rock: 2, steel: 2, ice: 0.5 },
    fighting: { flying: 2, psychic: 2, fairy: 2, bug: 0.5, rock: 0.5, dark: 0.5 },
    poison: { ground: 2, psychic: 2, grass: 0.5, fighting: 0.5, poison: 0.5, bug: 0.5, fairy: 0.5 },
    ground: { water: 2, grass: 2, ice: 2, poison: 0.5, rock: 0.5, electric: 0 },
    flying: { electric: 2, ice: 2, rock: 2, grass: 0.5, fighting: 0.5, bug: 0.5, ground: 0 },
    psychic: { bug: 2, ghost: 2, dark: 2, fighting: 0.5, psychic: 0.5 },
    bug: { fire: 2, flying: 2, rock: 2, grass: 0.5, fighting: 0.5, ground: 0.5 },
    rock: { water: 2, grass: 2, fighting: 2, ground: 2, steel: 2, normal: 0.5, fire: 0.5, poison: 0.5, flying: 0.5 },
    ghost: { ghost: 2, dark: 2, poison: 0.5, bug: 0.5, normal: 0, fighting: 0 },
    dragon: { ice: 2, dragon: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5 },
    dark: { fighting: 2, bug: 2, fairy: 2, ghost: 0.5, dark: 0.5, psychic: 0 },
    steel: { fire: 2, fighting: 2, ground: 2, normal: 0.5, grass: 0.5, ice: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5, poison: 0 },
    fairy: { poison: 2, steel: 2, fighting: 0.5, bug: 0.5, dark: 0.5, dragon: 0 }
}

export function AIFeedbackDialog({ isOpen, onClose, team }: AIFeedbackProps) {
    const metadata = useMetadata()
    const [isAnalyzing, setIsAnalyzing] = React.useState(false)
    const [analysisResult, setAnalysisResult] = React.useState<{
        weaknesses: string[]
        strengths: string[]
        suggestions: string[]
        summary: string
    } | null>(null)

    React.useEffect(() => {
        if (isOpen) {
            analyzeTeam()
        }
    }, [isOpen])

    const analyzeTeam = async () => {
        setIsAnalyzing(true)
        setAnalysisResult(null)

        try {
            // Fetch type data for all team members
            const typesPromises = Object.values(team)
                .filter(slot => slot.speciesId)
                .map(async slot => {
                    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slot.speciesId}`)
                    if (!res.ok) return null
                    const data = await res.json()
                    return data.types.map((t: any) => t.type.name) as string[]
                })

            const typesArray = (await Promise.all(typesPromises)).filter(Boolean) as string[][]

            // Wait a little bit to simulate AI thinking
            await new Promise(resolve => setTimeout(resolve, 1500))

            if (typesArray.length === 0) {
                setAnalysisResult({
                    weaknesses: ["포켓몬이 비어있습니다."],
                    strengths: [],
                    suggestions: ["최소 1마리 이상의 포켓몬을 추가해주세요."],
                    summary: "분석할 데이터가 부족합니다."
                })
                setIsAnalyzing(false)
                return
            }

            // Calculate team weaknesses
            const teamWeaknessCounts: Record<string, number> = {}
            const teamResistanceCounts: Record<string, number> = {}

            const allTypes = Object.keys(typeChart)
            allTypes.forEach(attType => {
                teamWeaknessCounts[attType] = 0
                teamResistanceCounts[attType] = 0

                typesArray.forEach(defTypes => {
                    let multiplier = 1
                    defTypes.forEach(dt => {
                        const m = typeChart[dt]?.[attType]
                        if (m !== undefined) multiplier *= m
                    })
                    if (multiplier > 1) teamWeaknessCounts[attType]++
                    if (multiplier < 1) teamResistanceCounts[attType]++
                })
            })

            // Find major weaknesses (3 or more weak to it, or 0 resistances)
            const majorWeaknesses = allTypes.filter(t => teamWeaknessCounts[t] >= 3 || (teamWeaknessCounts[t] >= 2 && teamResistanceCounts[t] === 0))
            const solidResistances = allTypes.filter(t => teamResistanceCounts[t] >= 3)

            const weaknessesText = majorWeaknesses.map(t => metadata?.types[t] || t).filter(Boolean)
            const resistancesText = solidResistances.map(t => metadata?.types[t] || t).filter(Boolean)

            const weaknesses = weaknessesText.length > 0
                ? weaknessesText.map(t => `파티가 전반적으로 [${t}] 타입 공격에 취약합니다. 일관성을 내어줄 위험이 큽니다.`)
                : ["특별히 치명적인 일관성을 가진 약점 타입은 없습니다. 훌륭한 타입 밸런스입니다!"]

            const strengths = resistancesText.length > 0
                ? resistancesText.map(t => `[${t}] 타입 공격을 안전하게 받아낼 수 있는 포켓몬이 충분합니다.`)
                : ["뚜렷하게 유리한 반감 타입 사이클이 부족합니다. 교체 플레이 체력을 더 올릴 필요가 있습니다."]

            const suggestions = []
            if (typesArray.length < 6) {
                suggestions.push("현재 6마리가 모두 채워지지 않았습니다. 남은 슬롯을 채워 상성을 보완하세요.")
            }
            if (majorWeaknesses.length > 0) {
                const recTypes = allTypes.filter(t => typeChart[t]?.[majorWeaknesses[0]] < 1)
                const recText = recTypes.map(t => metadata?.types[t] || t).slice(0, 2).join(' 또는 ')
                if (recText) {
                    suggestions.push(`[${metadata?.types[majorWeaknesses[0]] || majorWeaknesses[0]}] 약점을 찌르는 포켓몬을 막기 위해 [${recText}] 타입 포켓몬이나 테라스탈 채용을 강력하게 권장합니다.`)
                }
            } else {
                suggestions.push("현 메타에서 유행하는 사기 포켓몬에 대비한 핀포인트 메타 공격기 채용을 검토해보세요.")
            }

            let summary = ""
            if (typesArray.length < 6) summary = "파티가 아직 완성되지 않았습니다. 남은 포켓몬을 신중히 골라주세요."
            else if (majorWeaknesses.length >= 2) summary = "타입 밸런스 조정이 시급한 파티입니다. 특정 스타트 어택에 파티 전체가 무너질 수 있습니다."
            else summary = "전반적으로 밸런스가 잡힌 무난한 구성입니다. 랭크 배틀에서 충분한 경쟁력이 예상됩니다."

            setAnalysisResult({
                weaknesses,
                strengths,
                suggestions,
                summary
            })

        } catch (error) {
            console.error(error)
            setAnalysisResult(null)
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="AI 파티 솔루션" className="max-w-2xl">
            <div className="space-y-6 pt-2">
                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <div className="relative">
                            <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        </div>
                        <h3 className="text-xl font-medium text-white">AI 참모가 파티를 뜯어보고 있습니다...</h3>
                        <p className="text-sm text-gray-400">타입 일관성, 약점, 보완 프레임을 수집 중입니다.</p>
                        <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
                    </div>
                ) : analysisResult ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gradient-to-r from-primary/20 to-accent-violet/20 border border-primary/30 rounded-xl p-4">
                            <p className="font-medium text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                {analysisResult.summary}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-3">
                                <h4 className="flex items-center gap-2 text-red-400 font-medium">
                                    <AlertTriangle className="w-4 h-4" /> 주의해야 할 약점
                                </h4>
                                <ul className="space-y-2">
                                    {analysisResult.weaknesses.map((w, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                            <span className="text-red-500 mt-0.5">•</span>
                                            <span className="leading-snug">{w}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-3">
                                <h4 className="flex items-center gap-2 text-blue-400 font-medium">
                                    <ShieldCheck className="w-4 h-4" /> 우수한 방어 상성
                                </h4>
                                <ul className="space-y-2">
                                    {analysisResult.strengths.map((s, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                            <span className="text-blue-500 mt-0.5">•</span>
                                            <span className="leading-snug">{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                            <h4 className="flex items-center gap-2 text-accent-cyan font-medium">
                                <Target className="w-4 h-4" /> 솔루션 및 추천 포켓몬
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                {analysisResult.suggestions.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-accent-cyan mt-0.5">→</span>
                                        <span className="leading-snug">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={onClose}>확인했습니다</Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </Dialog>
    )
}
