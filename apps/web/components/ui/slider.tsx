"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    value: number
    max: number
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function Slider({ label, value, max, className, ...props }: SliderProps) {
    const percentage = (value / max) * 100

    return (
        <div className={cn("space-y-2 w-full", className)}>
            {label && (
                <div className="flex justify-between text-xs font-medium text-gray-400 mb-1">
                    <span>{label}</span>
                    <span className="text-white font-mono">{value}</span>
                </div>
            )}
            <div className="relative h-6 flex items-center group">
                <input
                    type="range"
                    value={value}
                    max={max}
                    className="absolute w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer outline-none focus:ring-0 z-20 transition-all accent-primary hover:accent-primary/80"
                    style={{
                        background: `linear-gradient(to right, #6366f1 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`
                    }}
                    {...props}
                />
                {/* Glow behind the bar */}
                <div
                    className="absolute h-1.5 bg-primary/30 blur-sm rounded-full pointer-events-none transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
