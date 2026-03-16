'use client'
import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"


export default function FilterDropdown({ options, selected, onSelect, icon }: { options: string[], selected: string, onSelect: (val: string) => void, icon?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-300 cursor-pointer text-sm font-medium
                    ${isOpen
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:border-white/20 hover:text-white'}`}
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-zinc-500">{icon}</span>
                    {selected}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-zinc-500'}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 p-1.5 bg-zinc-900/95 backdrop-blur-3xl border border-white/10 rounded-xl z-50 shadow-2xl animate-in fade-in zoom-in duration-200 origin-top overflow-hidden">
                    <div className="max-h-60 overflow-y-auto no-scrollbar py-0.5">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    onSelect(option)
                                    setIsOpen(false)
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer mb-0.5 last:mb-0
                                    ${selected === option
                                        ? 'bg-white text-black font-bold'
                                        : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                {option}
                                {selected === option && <Check className="w-3.5 h-3.5" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}