"use client"

import * as React from "react"
import { Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { motion, AnimatePresence } from "framer-motion"

const CHOSUNG_LIST = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
function getChosung(str: string) {
    let result = "";
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i) - 0xAC00;
        if (code > -1 && code < 11172) {
            result += CHOSUNG_LIST[Math.floor(code / 588)];
        } else {
            result += str[i];
        }
    }
    return result;
}

interface PokemonSearchProps {
    onSelect: (speciesId: string) => void
    pokemonList: Record<string, string> // id -> name
    placeholder?: string
    className?: string
}

export function PokemonSearch({ onSelect, pokemonList, placeholder, className }: PokemonSearchProps) {
    const [query, setQuery] = React.useState("")
    const [isOpen, setIsOpen] = React.useState(false)

    const results = React.useMemo(() => {
        if (!query) return []
        const lowerQuery = query.toLowerCase()
        const chosungQ = getChosung(lowerQuery)
        return Object.entries(pokemonList)
            .filter(([id, name]) => {
                const lowerName = name.toLowerCase()
                const chosungName = getChosung(lowerName)
                return id.toLowerCase().includes(lowerQuery) ||
                    lowerName.includes(lowerQuery) ||
                    chosungName.includes(chosungQ)
            })
            .slice(0, 10)
    }, [query, pokemonList])

    return (
        <div className={cn("relative", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder || "포켓몬 검색 (예: 피카츄, pikachu)"}
                    className="pl-10"
                />
            </div>

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="max-h-60 overflow-y-auto py-2">
                            {results.map(([id, name]) => (
                                <button
                                    key={id}
                                    onClick={() => {
                                        onSelect(id)
                                        setQuery("")
                                        setIsOpen(false)
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-primary/20 transition-colors group"
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-medium text-white">{name}</span>
                                        <span className="text-xs text-gray-400 group-hover:text-primary-foreground/70">{id}</span>
                                    </div>
                                    <Check className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
