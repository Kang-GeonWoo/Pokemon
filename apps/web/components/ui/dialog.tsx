"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
    className?: string
}

export function Dialog({ isOpen, onClose, children, title, className }: DialogProps) {
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
                            "bg-surface/90 backdrop-blur-xl border border-white/10 p-6 shadow-2xl rounded-2xl",
                            "max-h-[85vh] overflow-y-auto",
                            className
                        )}
                    >
                        {title && (
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        {!title && (
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
