'use client'

import { useTranslation } from "@/providers/LocaleProvider";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { X } from "lucide-react";

interface CreateListModalProps {
    handleCreateList: (e: React.FormEvent) => void;
    newListName: string;
    setNewListName: (value: string) => void;
    setIsCreatingList: (value: boolean) => void;
}

export default function CreateListModal({
    handleCreateList,
    newListName,
    setNewListName,
    setIsCreatingList
}: CreateListModalProps) {
    const { t } = useTranslation();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const modalContent = (

        <div
            className="fixed inset-0 z-999 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto"
            onClick={() => setIsCreatingList(false)}
        >
            <div
                className="relative my-auto w-full max-w-[400px] bg-zinc-900 border border-white/10 p-8 rounded-xl shadow-2xl space-y-8"
                onClick={(e) => e.stopPropagation()}
            >
                <X className="absolute top-4 right-4 cursor-pointer text-white hover:text-zinc-400" onClick={() => setIsCreatingList(false)} />

                <div className="space-y-2 text-center">
                    <h2 className="text-blue-400/80 text-xl font-black uppercase tracking-tight">
                        {t("common", "createNewList")}
                    </h2>

                </div>

                <form onSubmit={handleCreateList} className="flex flex-col gap-6">
                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder={t("common", "listNamePlaceholder")}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all text-lg"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={!newListName.trim()}
                            className="w-full py-4 bg-white text-black hover:bg-zinc-200 disabled:opacity-20 rounded-2xl font-black uppercase text-sm transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-white/5"
                        >
                            {t("common", "create")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCreatingList(false)}
                            className="w-full py-2 bg-transparent text-zinc-500 hover:text-white rounded-xl text-[10px] uppercase font-bold tracking-[0.2em] transition-colors cursor-pointer"
                        >
                            {t("common", "cancel")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (typeof window === "undefined") return null;
    return createPortal(modalContent, document.body);
}