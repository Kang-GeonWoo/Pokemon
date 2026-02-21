"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectOption {
    value: string
    label: string
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string
    options: SelectOption[]
    onChange: (value: string) => void
    className?: string
}

export function Select({ label, options, value, onChange, className, ...props }: SelectProps) {
    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <label className="text-xs font-medium text-gray-400">
                    {label}
                </label>
            )}
            <div className="relative group">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                        "w-full h-10 px-3 py-2 bg-surface/50 border border-white/10 rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm text-white transition-all hover:bg-surface/70",
                        className
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-surface text-black">
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 group-hover:text-white transition-colors">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
        </div>
    )
}
