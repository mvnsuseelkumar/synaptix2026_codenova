import { ChevronRight } from 'lucide-react'

export default function PageHeader({ title, breadcrumbs = [], action, className = '' }) {
    return (
        <div className={`flex items-center justify-between mb-8 ${className}`}>
            <div>
                {breadcrumbs.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted mb-1">
                        {breadcrumbs.map((crumb, i) => (
                            <span key={i} className="flex items-center gap-1">
                                {i > 0 && <ChevronRight size={14} />}
                                {crumb.href ? (
                                    <a href={crumb.href} className="hover:text-primary transition-colors">{crumb.label}</a>
                                ) : (
                                    <span className="text-slate-400">{crumb.label}</span>
                                )}
                            </span>
                        ))}
                    </div>
                )}
                <h1 className="text-2xl font-bold text-white">{title}</h1>
            </div>
            {action && <div>{action}</div>}
        </div>
    )
}
