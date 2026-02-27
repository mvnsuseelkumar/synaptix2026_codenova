import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message = '', action, className = '' }) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                <Icon size={28} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-1">{title}</h3>
            {message && <p className="text-sm text-muted text-center max-w-md mb-4">{message}</p>}
            {action && action}
        </div>
    )
}
