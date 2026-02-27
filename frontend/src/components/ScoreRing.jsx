import { useMemo } from 'react'

export default function ScoreRing({ score, maxScore = 100, size = 120, strokeWidth = 10, className = '' }) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const percent = Math.min(score / maxScore, 1)
    const offset = circumference * (1 - percent)

    const color = useMemo(() => {
        if (percent >= 0.7) return '#10B981'
        if (percent >= 0.5) return '#F59E0B'
        return '#EF4444'
    }, [percent])

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="#334155" strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth={strokeWidth}
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{score.toFixed(1)}</span>
                <span className="text-xs text-muted">/ {maxScore}</span>
            </div>
        </div>
    )
}
