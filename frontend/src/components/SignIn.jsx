import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Eye, EyeOff, Mail, Lock,
  ArrowRight, Check, Cpu, Zap, Globe, Activity,
  ShieldCheck, Database, Fingerprint
} from 'lucide-react'

/* ─── Animated Background ─────────────────────────────────────────────────── */
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hexGrid" width="56" height="48.5" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
          <path d="M28 0 L56 14 L56 34.5 L28 48.5 L0 34.5 L0 14 Z" fill="none" stroke="#3b82f6" strokeWidth="0.4"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexGrid)"/>
    </svg>
    <motion.div animate={{ scale:[1,1.2,1], opacity:[0.1,0.2,0.1] }} transition={{ duration:10, repeat:Infinity, ease:'easeInOut' }}
      className="absolute -top-52 -left-52 w-[700px] h-[700px] rounded-full bg-blue-600 blur-[160px]"/>
    <motion.div animate={{ scale:[1,1.15,1], opacity:[0.06,0.14,0.06] }} transition={{ duration:12, repeat:Infinity, ease:'easeInOut', delay:3 }}
      className="absolute -bottom-40 -right-32 w-[550px] h-[550px] rounded-full bg-violet-700 blur-[150px]"/>
    <motion.div animate={{ scale:[1,1.25,1], opacity:[0.04,0.1,0.04] }} transition={{ duration:14, repeat:Infinity, ease:'easeInOut', delay:5 }}
      className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-cyan-500 blur-[120px]"/>
  </div>
)

/* ─── Floating Particles ──────────────────────────────────────────────────── */
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div key={p.id}
          animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          className="absolute rounded-full bg-blue-400"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
        />
      ))}
    </div>
  )
}

/* ─── Pulsing Security Shield with Orbits ─────────────────────────────────── */
const SecurityShieldVisual = () => {
  const orbitIcons = [
    { icon: <Database size={14}/>, angle: 0, radius: 100, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
    { icon: <Fingerprint size={14}/>, angle: 120, radius: 100, color: 'text-violet-400', bg: 'bg-violet-500/15' },
    { icon: <ShieldCheck size={14}/>, angle: 240, radius: 100, color: 'text-blue-400', bg: 'bg-blue-500/15' },
  ]
  return (
    <div className="relative flex items-center justify-center w-72 h-72">
      {/* Pulse rings */}
      {[1,2,3].map(r => (
        <motion.div key={r}
          animate={{ scale:[1,1.8,1], opacity:[0.25,0,0.25] }}
          transition={{ duration:3.5, repeat:Infinity, delay:r*0.7, ease:'easeOut' }}
          className="absolute rounded-full border border-blue-400/30"
          style={{ width: r*70, height: r*70 }}/>
      ))}
      {/* Orbit ring */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration:20, repeat:Infinity, ease:'linear' }}
        className="absolute w-[200px] h-[200px] rounded-full border border-dashed border-blue-500/15"/>
      {/* Orbiting icons */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration:20, repeat:Infinity, ease:'linear' }}
        className="absolute w-[200px] h-[200px]">
        {orbitIcons.map((item, i) => {
          const rad = (item.angle * Math.PI) / 180
          const x = Math.cos(rad) * item.radius
          const y = Math.sin(rad) * item.radius
          return (
            <motion.div key={i} animate={{ rotate: -360 }} transition={{ duration:20, repeat:Infinity, ease:'linear' }}
              className={`absolute w-8 h-8 rounded-lg ${item.bg} border border-white/10 flex items-center justify-center ${item.color}`}
              style={{ left: `calc(50% + ${x}px - 16px)`, top: `calc(50% + ${y}px - 16px)` }}>
              {item.icon}
            </motion.div>
          )
        })}
      </motion.div>
      {/* Core shield */}
      <motion.div
        animate={{ boxShadow:['0 0 30px rgba(59,130,246,0.3)','0 0 60px rgba(59,130,246,0.7)','0 0 30px rgba(59,130,246,0.3)'] }}
        transition={{ duration:2.5, repeat:Infinity }}
        className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/25 to-violet-600/25 backdrop-blur-2xl border border-blue-400/30 flex items-center justify-center">
        <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:2, repeat:Infinity }}>
          <Shield size={42} className="text-blue-300" strokeWidth={1.5}/>
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ─── Stats Row ───────────────────────────────────────────────────────────── */
const STATS = [
  { icon: <Zap size={14}/>, label:'Threats Blocked', value:'14.2M', color:'text-blue-400' },
  { icon: <Globe size={14}/>, label:'Repos Secured', value:'92K+', color:'text-cyan-400' },
]

/* ─── Input Field ─────────────────────────────────────────────────────────── */
const InputField = ({ id, label, type='text', icon, value, onChange, placeholder, rightSlot, autoComplete }) => {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">{label}</label>
      <div className={`relative flex items-center rounded-xl border transition-all duration-300 ${
        focused
          ? 'border-blue-500/60 bg-blue-500/[0.06] shadow-[0_0_0_3px_rgba(59,130,246,0.1),0_0_20px_rgba(59,130,246,0.08)]'
          : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.04]'
      }`}>
        <span className="pl-4 text-gray-600">{icon}</span>
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent px-3 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none font-medium"/>
        {rightSlot && <span className="pr-4">{rightSlot}</span>}
      </div>
    </div>
  )
}

/* ─── Main SignIn Component ───────────────────────────────────────────────── */
const SignIn = ({ onSignIn }) => {
  const [form, setForm] = useState({ email:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.email.includes('@')) e.email = 'Valid work email required'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1600))
    setLoading(false)
    setDone(true)
    setTimeout(() => onSignIn?.(), 900)
  }

  const set = key => ev => {
    setForm(f => ({ ...f, [key]: ev.target.value }))
    setErrors(er => ({ ...er, [key]: undefined }))
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex overflow-hidden relative">
      <AnimatedBackground/>
      <FloatingParticles/>

      {/* ─── Left Panel ─── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] p-14 relative z-10">
        {/* Brand */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Cpu size={18} className="text-white"/>
          </div>
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">IBM Bob</span>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest border border-white/10 px-2 py-0.5 rounded-full">Security AI</span>
        </motion.div>

        {/* Center content */}
        <div className="flex flex-col items-start gap-10">
          <div>
            <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
              className="text-5xl font-black leading-[1.1] mb-5">
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">Welcome</span><br/>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Back</span>
            </motion.h1>
            <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              className="text-gray-400 text-[15px] leading-relaxed max-w-sm">
              Sign in to IBM Bob to continue monitoring your repositories, resolving vulnerabilities, and securing your codebase with AI.
            </motion.p>
          </div>

          <SecurityShieldVisual/>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3+i*0.1 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                <span className={s.color}>{s.icon}</span>
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{s.label}</div>
                  <div className={`text-sm font-black ${s.color}`}>{s.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }}
          className="text-xs text-gray-700">© 2026 IBM Bob Security AI · All rights reserved</motion.div>
      </div>

      {/* ─── Right Panel (Form) ─── */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div initial={{ opacity:0, y:24, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
          transition={{ duration:0.65, ease:[0.16,1,0.3,1] }} className="w-full max-w-md">

          {/* Glass card */}
          <div className="relative rounded-3xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-2xl shadow-[0_8px_64px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"/>
            {/* Corner glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px]"/>

            <div className="p-10">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-5 lg:hidden">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                    <Cpu size={15} className="text-white"/>
                  </div>
                  <span className="font-black text-lg gradient-text">IBM Bob</span>
                </div>
                <h2 className="text-[26px] font-black text-white mb-1.5 tracking-tight">Sign in to your account</h2>
                <p className="text-sm text-gray-500">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Sign up</Link>
                </p>
              </div>

              {/* Form */}
              <AnimatePresence mode="wait">
                {!done ? (
                  <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <InputField id="signin-email" label="Work Email" type="email" icon={<Mail size={16}/>}
                        value={form.email} onChange={set('email')} placeholder="jane@company.com" autoComplete="email"/>
                      {errors.email && <p className="text-red-400 text-xs mt-1 font-medium">{errors.email}</p>}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="signin-password" className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Password</label>
                        <button type="button" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</button>
                      </div>
                      <div className={`relative flex items-center rounded-xl border transition-all duration-300 ${
                        form.password
                          ? 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.04]'
                          : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.04]'
                      }`}>
                        <span className="pl-4 text-gray-600"><Lock size={16}/></span>
                        <input id="signin-password" type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Enter your password" autoComplete="current-password"
                          className="flex-1 bg-transparent px-3 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none font-medium"/>
                        <span className="pr-4">
                          <button type="button" onClick={() => setShowPw(p => !p)} className="text-gray-600 hover:text-gray-300 transition-colors">
                            {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </button>
                        </span>
                      </div>
                      {errors.password && <p className="text-red-400 text-xs mt-1 font-medium">{errors.password}</p>}
                    </div>

                    {/* Submit button with vibrant blue gradient glow */}
                    <motion.button type="submit" disabled={loading}
                      whileHover={!loading ? { scale:1.02, boxShadow:'0 0 50px rgba(59,130,246,0.55), 0 0 100px rgba(59,130,246,0.2)' } : {}}
                      whileTap={!loading ? { scale:0.97 } : {}}
                      className="relative w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 shadow-[0_4px_30px_rgba(59,130,246,0.35)] transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden mt-2">
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"
                        style={{ animation:'shimmer 3s infinite' }}/>
                      {loading ? (
                        <>
                          <motion.div animate={{ rotate:360 }} transition={{ duration:0.8, repeat:Infinity, ease:'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"/>
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <Shield size={16}/><span>Sign In</span><ArrowRight size={16}/>
                        </>
                      )}
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-white/[0.05]"/>
                      <span className="text-xs text-gray-700 font-medium">or continue with</span>
                      <div className="flex-1 h-px bg-white/[0.05]"/>
                    </div>

                    {/* OAuth */}
                    <div className="grid grid-cols-2 gap-3">
                      {[{ label:'GitHub', logo:'GH' },{ label:'Microsoft', logo:'MS' }].map(p => (
                        <motion.button key={p.label} type="button"
                          whileHover={{ scale:1.02, backgroundColor:'rgba(255,255,255,0.06)' }}
                          whileTap={{ scale:0.97 }}
                          className="flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-sm font-semibold text-gray-300 hover:text-white transition-all">
                          <span className="text-[10px] font-black bg-white/15 px-1.5 py-0.5 rounded-md">{p.logo}</span>
                          {p.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.form>
                ) : (
                  <motion.div key="success" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                    className="flex flex-col items-center justify-center py-12 text-center">
                    <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:300, damping:20 }}
                      className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                      <Check size={36} className="text-emerald-400"/>
                    </motion.div>
                    <h3 className="text-xl font-black text-white mb-2">Authenticated!</h3>
                    <p className="text-gray-500 text-sm">Taking you to the dashboard…</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-400/30 to-transparent"/>
          </div>

          {/* Trust badge */}
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
            className="text-center text-xs text-gray-700 mt-6">
            Trusted by security teams at{' '}
            <span className="text-gray-500 font-semibold">IBM · Cloudflare · Stripe · Vercel</span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default SignIn
