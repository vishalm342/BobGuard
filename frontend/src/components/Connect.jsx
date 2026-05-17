import React, { useState } from 'react'
import { Code, Shield, Zap, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const Connect = ({ onConnect }) => {
  const [url, setUrl] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (url.trim()) onConnect(url)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="z-10 max-w-4xl w-full text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img 
              src="/ibm_bob_mascot.png" 
              alt="IBM Bob" 
              className="relative w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-2 border-white/10 shadow-2xl"
            />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
        >
          Securing Code with <span className="gradient-text">IBM Bob</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          The only security AI that reads your <span className="text-white font-semibold">entire codebase</span> via MCP. 
          Deep context, OWASP mapping, and precision fixes.
        </motion.p>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="relative max-w-2xl mx-auto mb-16"
        >
          <div className="relative flex items-center">
            <div className="absolute left-6 text-gray-500">
              <Code size={24} />
            </div>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="github.com/username/repository"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-40 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all glass hover:bg-white/10"
              required
            />
            <button 
              type="submit"
              className="absolute right-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              Analyze <ArrowRight size={20} />
            </button>
          </div>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <FeatureCard 
            icon={<Code className="text-blue-400" />} 
            title="Full Context" 
            desc="Reads your whole project, not just isolated snippets."
          />
          <FeatureCard 
            icon={<Shield className="text-purple-400" />} 
            title="OWASP Native" 
            desc="Automatic mapping to the latest security standards."
          />
          <FeatureCard 
            icon={<Zap className="text-cyan-400" />} 
            title="Auto-Fixes" 
            desc="One-click PRs to patch vulnerabilities instantly."
          />
        </motion.div>
      </div>
    </div>
  )
}

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-6 rounded-2xl glass glass-hover text-left">
    <div className="mb-4 bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{desc}</p>
  </div>
)

export default Connect
