import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react'
import { login as loginApi } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function Login() {
    const navigate = useNavigate()
    const { loginUser } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    })

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const res = await loginApi(data)
            const { access_token, role, user_id, name } = res.data
            loginUser(access_token, { id: user_id, name, role, email: data.email })
            toast.success(`Welcome back, ${name}!`)
            navigate(`/${role}/dashboard`)
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Login failed')
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
                    <p className="text-muted">Sign in to your account</p>
                </div>

                <div className="card p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                {...register('email')}
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="label" htmlFor="password">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field pr-10"
                                    placeholder="••••••••"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-muted mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:underline font-medium">Sign up</Link>
                </p>
            </div>
        </div>
    )
}
