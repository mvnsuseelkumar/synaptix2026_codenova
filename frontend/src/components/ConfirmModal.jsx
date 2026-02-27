import { X, AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4 animate-fade-in shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="flex items-start gap-3 mb-4">
                    {danger && (
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                            <AlertTriangle size={20} className="text-red-400" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                        <p className="text-sm text-muted mt-1">{message}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={danger ? 'btn-danger text-sm' : 'btn-primary text-sm'}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
