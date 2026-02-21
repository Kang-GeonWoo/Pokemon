"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ComboboxProps {
    options: { value: string; label: string }[]
    value: string
    onChange: (value: string) => void
    label?: string
    placeholder?: string
    className?: string
}

export function Combobox({ options, value, onChange, label, placeholder, className }: ComboboxProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const containerRef = React.useRef<HTMLDivElement>(null)

    const selectedOption = React.useMemo(() => options.find((o) => o.value === value), [options, value])

    React.useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleOutsideClick)
        return () => document.removeEventListener("mousedown", handleOutsideClick)
    }, [])

    const results = React.useMemo(() => {
        if (!query) return options.slice(0, 50) // 기본으로는 50개만 표시
        const lowerQuery = query.toLowerCase()
        return options.filter((o) =>
            o.label.includes(query) || o.value.toLowerCase().includes(lowerQuery)
        ).slice(0, 50)
    }, [query, options])

    return (
        <div className={cn("space-y-1.5 relative", isOpen ? "z-50" : "z-10", className)} ref={containerRef}>
            {label && (
                <label className="text-xs font-medium text-gray-400">
                    {label}
                </label>
            )}
            <div className="relative">
                <div
                    onClick={() => {
                        setIsOpen(!isOpen)
                        if (!isOpen) setQuery("")
                    }}
                    className={cn(
                        "w-full h-10 px-3 py-2 bg-surface/50 border border-white/10 rounded-lg cursor-pointer flex items-center justify-between text-sm transition-all hover:bg-surface/70 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50",
                        !selectedOption && "text-gray-400"
                    )}
                >
                    <span className="truncate">{selectedOption ? selectedOption.label : (placeholder || "선택...")}</span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 w-full mt-2 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
                        >
                            <div className="p-2 border-b border-white/10">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        autoFocus
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="w-full bg-black/20 border border-white/5 rounded-md py-1.5 pl-8 pr-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-primary"
                                        placeholder="이름 또는 ID 검색..."
                                    />
                                </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto py-1">
                                {results.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-gray-400 text-center">검색 결과가 없습니다.</div>
                                ) : (
                                    results.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                onChange(option.value)
                                                setIsOpen(false)
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-primary/20 transition-colors group text-left",
                                                value === option.value ? "text-primary" : "text-gray-200"
                                            )}
                                        >
                                            <span className="truncate pr-2">{option.label}</span>
                                            {value === option.value && <Check className="w-4 h-4 shrink-0 text-primary" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
