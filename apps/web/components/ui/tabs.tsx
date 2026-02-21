"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface TabProps {
    id: string
    label: React.ReactNode
    active?: boolean
    onClick: () => void
    activeColor?: string
}

export function Tabs({
    tabs,
    activeTab,
    onTabChange,
    className
}: {
    tabs: { id: string; label: React.ReactNode }[]
    activeTab: string
    onTabChange: (id: string) => void
    className?: string
}) {
    return (
        <div className={cn("flex space-x-1 bg-surface/30 p-1 rounded-xl backdrop-blur-md border border-white/5", className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "relative flex-1 px-3 py-2 text-sm font-medium transition-colors rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        activeTab === tab.id ? "text-white" : "text-gray-400 hover:text-gray-200"
                    )}
                >
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="active-tab"
                            className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                            transition={{ type: "spring", duration: 0.5 }}
                        />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                </button>
            ))}
        </div>
    )
}
