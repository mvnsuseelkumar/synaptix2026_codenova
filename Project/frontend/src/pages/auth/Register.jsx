import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, Mail, Lock, User, AlertCircle, GraduationCap, Briefcase } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('applicant');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password, role);
            navigate(`/${role}/dashboard`);
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-16">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-950/30 via-slate-950 to-slate-950" />
            <div className="absolute top-20 right-1/3 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl" />
            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create Account</h1>
                    <p className="text-slate-400 mt-2">Join SkillNova — fair, AI-powered matching</p>
                </div>
                <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-5">
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">I am a...</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setRole('applicant')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${role === 'applicant' ? 'bg-violet-500/10 border-violet-500/40 text-violet-300' : 'bg-white/5 border-white/10 text-slate-400 hover:border-violet-500/20'}`}>
                                <GraduationCap className="w-6 h-6" /><span className="text-sm font-medium">Job Seeker</span>
                            </button>
                            <button type="button" onClick={() => setRole('recruiter')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${role === 'recruiter' ? 'bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-300' : 'bg-white/5 border-white/10 text-slate-400 hover:border-fuchsia-500/20'}`}>
                                <Briefcase className="w-6 h-6" /><span className="text-sm font-medium">Recruiter</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none" placeholder="John Doe" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none" placeholder="you@example.com" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none" placeholder="Min 6 characters" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50">
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                    <p className="text-center text-sm text-slate-400">
                        Already have an account? <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
