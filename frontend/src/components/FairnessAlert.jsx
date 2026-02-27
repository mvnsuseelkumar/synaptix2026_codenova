import { AlertTriangle } from 'lucide-react'

export default function FairnessAlert({ alerts, className = '' }) {
    if (!alerts || alerts.length === 0) return null

    return (
        <div className={`bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 ${className}`}>
            {alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-3">
                    <AlertTriangle className="text-amber-400 mt-0.5 shrink-0" size={20} />
                    <div>
                        <p className="text-amber-200 font-medium text-sm">⚠️ Fairness Alert</p>
                        <p className="text-amber-300/80 text-sm mt-1">{alert.detail}</p>
                        {alert.top10_breakdown && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {Object.entries(alert.top10_breakdown).map(([inst, count]) => (
                                    <span key={inst} className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                                        {inst}: {count}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
