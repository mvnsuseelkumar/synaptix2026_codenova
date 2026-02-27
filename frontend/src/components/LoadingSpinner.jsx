import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ text = 'Loading...', className = '' }) {
    return (
        <div className={`flex flex-col items-center justify-center py-20 ${className}`}>
            <Loader2 size={36} className="text-primary animate-spin mb-3" />
            <p className="text-sm text-muted">{text}</p>
        </div>
    )
}
