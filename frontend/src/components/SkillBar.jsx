export default function SkillBar({ skill, score, maxScore = 5, showLabel = true, className = '' }) {
    const percent = Math.min((score / maxScore) * 100, 100)
    const color = score >= 3.5 ? 'bg-emerald-500' : score >= 2 ? 'bg-amber-500' : 'bg-red-500'

    return (
        <div className={`${className}`}>
            {showLabel && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-300">{skill}</span>
                    <span className="text-sm font-semibold text-white">{score.toFixed(1)}/{maxScore}</span>
                </div>
            )}
            <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${color} transition-all duration-500 ease-out`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    )
}
