import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'

export default function NotificationBell() {
    const { notifications, unreadCount, markRead } = useNotifications()
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
                <Bell size={20} className="text-slate-400" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] h-[18px]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-slate-700 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto animate-fade-in">
                    <div className="p-3 border-b border-slate-700">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted">No notifications yet</div>
                    ) : (
                        notifications.slice(0, 10).map((n) => (
                            <button
                                key={n.id}
                                onClick={() => { if (!n.read) markRead(n.id) }}
                                className={`w-full text-left p-3 border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                            >
                                <div className="flex items-start gap-2">
                                    {!n.read && <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{n.title}</p>
                                        <p className="text-xs text-muted mt-0.5">{n.message}</p>
                                        <p className="text-[10px] text-slate-600 mt-1">
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
