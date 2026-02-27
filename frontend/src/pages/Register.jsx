import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Sparkles, Eye, EyeOff, Loader2, Building2, GraduationCap } from 'lucide-react'
import { registerStudent, registerCompany } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

const studentSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    domain_preference: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

const companySchema = z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    industry: z.string().optional(),
})

export default function Register() {
    const navigate = useNavigate()
    const { loginUser } = useAuth()
    const [role, setRole] = useState('student')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const studentForm = useForm({ resolver: zodResolver(studentSchema) })
    const companyForm = useForm({ resolver: zodResolver(companySchema) })
    const form = role === 'student' ? studentForm : companyForm

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            let res
            if (role === 'student') {
                const dp = data.domain_preference ? data.domain_preference.split(',').map((s) => s.trim()).filter(Boolean) : []
                res = await registerStudent({ name: data.name, email: data.email, password: data.password, domain_preference: dp })
            } else {
                res = await registerCompany({ name: data.name, email: data.email, password: data.password, industry: data.industry || '' })
            }
            const { access_token, user_id, name } = res.data
            loginUser(access_token, { id: user_id, name, role, email: data.email })
            toast.success('Account created successfully!')
            navigate(`/${role}/dashboard`)
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <Sparkles size={22} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">InternMatch</span>
                    </Link>
                    <p className="text-muted">Create your account</p>
                </div>

                <div className="card p-8">
                    {/* Role toggle */}
                    <div className="flex bg-surface-2 rounded-lg p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('student')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${role === 'student' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <GraduationCap size={16} /> Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('company')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${role === 'company' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <Building2 size={16} /> Company
                        </button>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="label">{role === 'student' ? 'Full Name' : 'Company Name'}</label>
                            <input className="input-field" placeholder={role === 'student' ? 'John Doe' : 'Acme Corp'} {...form.register('name')} />
                            {form.formState.errors.name && <p className="text-red-400 text-xs mt-1">{form.formState.errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="label">Email</label>
                            <input type="email" className="input-field" placeholder="you@example.com" {...form.register('email')} />
                            {form.formState.errors.email && <p className="text-red-400 text-xs mt-1">{form.formState.errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••" {...form.register('password')} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {form.formState.errors.password && <p className="text-red-400 text-xs mt-1">{form.formState.errors.password.message}</p>}
                        </div>

                        {role === 'student' && (
                            <>
                                <div>
                                    <label className="label">Confirm Password</label>
                                    <input type={showPassword ? 'text' : 'password'} className="input-field" placeholder="••••••••" {...form.register('confirmPassword')} />
                                    {form.formState.errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{form.formState.errors.confirmPassword.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Domain Preferences <span className="text-muted">(comma separated)</span></label>
                                    <input className="input-field" placeholder="Web Development, Data Science" {...form.register('domain_preference')} />
                                </div>
                            </>
                        )}

                        {role === 'company' && (
                            <div>
                                <label className="label">Industry</label>
                                <input className="input-field" placeholder="Technology, Finance, Healthcare..." {...form.register('industry')} />
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-muted mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
