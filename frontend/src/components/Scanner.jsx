import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Database, ShieldCheck, Cpu, Lock, Terminal } from 'lucide-react'

const FallingCodeStream = () => {
  const columns = useMemo(() => Array.from({ length: 20 }, () => ({
    left: `${Math.random() * 100}%`,
    duration: 5 + Math.random() * 10,
    delay: Math.random() * 5,
    chars: Array.from({ length: 15 }, () => 
      Math.random() > 0.5 ? Math.floor(Math.random() * 2) : String.fromCharCode(65 + Math.floor(Math.random() * 26))
    )
  })), [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {columns.map((col, i) => (
        <motion.div
          key={i}
          initial={{ y: -500 }}
          animate={{ y: '100vh' }}
          transition={{
            duration: col.duration,
            repeat: Infinity,
            ease: "linear",
            delay: col.delay
          }}
          className="absolute text-[10px] font-mono text-blue-500/40 whitespace-pre flex flex-col"
          style={{ left: col.left }}
        >
          {col.chars.map((char, j) => (
            <span key={j} className={j === 0 ? "text-blue-200" : ""}>{char}</span>
          ))}
        </motion.div>
      ))}
    </div>
  )
}

const PulsingLogo = () => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Glows */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl"
      />
      
      {/* Main Logo Container */}
      <div className="relative z-10 w-32 h-32 flex items-center justify-center">
        <motion.div
          animate={{
            rotateY: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 border-4 border-blue-500/30 rounded-full border-t-blue-400"
        />
        
        <div className="flex flex-col items-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Cpu size={48} className="text-blue-400 mb-1" />
          </motion.div>
          <span className="text-xs font-black tracking-[0.2em] text-blue-300">BOB</span>
        </div>
      </div>
    </div>
  )
}

const Scanner = ({ repoUrl, onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initializing MCP session...')
  const hasCompletedRef = useRef(false)

  const intervalRef = useRef(null)

  useEffect(() => {
    const statuses = [
      'Initializing MCP session...',
      'Connecting to GitHub API...',
      'Reading project structure...',
      'Bob is ingesting the full codebase via MCP...',
      'Mapping functions to OWASP Top 10...',
      'Identifying security patterns...',
      'Generating prioritized report...'
    ]

    let currentStatus = 0
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return 100
        }

        const statusIdx = Math.min(Math.floor((prev / 100) * statuses.length), statuses.length - 1)
        if (statusIdx > currentStatus) {
          currentStatus = statusIdx
          setStatus(statuses[statusIdx])
        }

        const next = prev + Math.random() * 1.5
        return next
      })
    }, 80)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    // Use rounded progress to avoid the UI showing 100% due to rounding
    if (Math.round(progress) < 100 || hasCompletedRef.current || !onComplete) return undefined

    hasCompletedRef.current = true
    // clear the progress interval so it doesn't re-run and clear our timeout
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const timer = setTimeout(() => onComplete(), 600)
    return () => clearTimeout(timer)
  }, [progress, onComplete])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-[#0a0a0c] overflow-hidden text-white">
      <FallingCodeStream />
      
      <div className="max-w-md w-full relative z-20">
        <div className="mb-16 flex justify-center">
          <PulsingLogo />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            Analyzing Repository
          </h2>
          <p className="text-blue-400/60 text-center mb-10 truncate max-w-full font-mono text-sm">
            {repoUrl}
          </p>
        </motion.div>

        <div className="space-y-8">
          <div className="relative pt-1">
            <div className="flex mb-3 items-center justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={status}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2"
                >
                  <Terminal size={14} className="text-blue-400" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-blue-400/80">
                    {status}
                  </span>
                </motion.div>
              </AnimatePresence>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-blue-400">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-[3px] mb-4 text-xs flex rounded-full bg-white/5 border border-white/5">
              <motion.div 
                style={{ width: `${progress}%` }}
                className="shadow-[0_0_15px_rgba(37,99,235,0.5)] flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 transition-all duration-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-12">
            {[
              { icon: <Search size={16} />, text: 'Source code analysis', active: progress > 20 },
              { icon: <Database size={16} />, text: 'Cross-file context mapping', active: progress > 45 },
              { icon: <ShieldCheck size={16} />, text: 'Vulnerability detection', active: progress > 70 },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: item.active ? 1 : 0.2, x: 0, scale: item.active ? 1 : 0.98 }}
                transition={{ duration: 0.5 }}
                className={`flex items-center gap-3 p-4 rounded-xl border ${item.active ? 'bg-blue-500/5 border-blue-500/20 text-white' : 'border-white/5 text-gray-600'}`}
              >
                <div className={`${item.active ? 'text-blue-400' : 'text-gray-700'}`}>
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.text}</span>
                {item.active && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Scanner

