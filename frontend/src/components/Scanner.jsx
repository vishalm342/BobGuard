import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Database, ShieldCheck, Cpu, Lock, Terminal } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || ''

// ── Helpers shared with the fetch ───────────────────────────────────────────

const isLocalSource = (source) => {
  if (!source) return false
  return !/^https?:\/\//i.test(source) && !source.includes('github.com')
}

const parseResponseBody = async (response) => {
  const text = await response.text()
  if (!text) return {}
  try { return JSON.parse(text) } catch { return { message: text } }
}

const extractFindings = (payload) => {
  const candidates = [
    payload?.findings,
    payload?.vulnerabilities,
    payload?.issues,
    payload?.results,
    payload?.scan?.findings,
    payload?.data,
    payload,
  ]
  const rawFindings = candidates.find(c => Array.isArray(c)) || []
  return rawFindings
}

// ── Visual sub-components (unchanged) ───────────────────────────────────────

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

// ── Main Scanner ─────────────────────────────────────────────────────────────

/**
 * Scanner performs the real HTTP fetch and drives the progress bar from it.
 * Props:
 *   repoUrl   – the source to scan (URL or local path)
 *   onComplete(result) – called with { endpoint, findings, payload } on success
 *   onError()          – called when the fetch fails or backend is unreachable
 */
const Scanner = ({ repoUrl, onComplete, onError }) => {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initializing scan...')

  const animFrameRef = useRef(null)
  const resolvedRef = useRef(false)

  const statuses = [
    'Initializing scan...',
    'Connecting to backend...',
    'Reading project structure...',
    'Bob is ingesting the codebase via MCP...',
    'Mapping functions to OWASP Top 10...',
    'Identifying security patterns...',
    'Generating prioritized report...',
  ]

  // Animate progress smoothly up to a cap while the fetch is in-flight,
  // then jump to 100 when the fetch resolves.
  const progressRef = useRef(0)
  const targetRef = useRef(80) // animate freely up to 80 %, then wait for real response

  useEffect(() => {
    let rafId
    const tick = () => {
      if (progressRef.current < targetRef.current) {
        // Ease toward target
        progressRef.current = Math.min(
          progressRef.current + Math.random() * 0.6 + 0.2,
          targetRef.current
        )
        const rounded = Math.round(progressRef.current)
        setProgress(rounded)
        const statusIdx = Math.min(
          Math.floor((progressRef.current / 100) * statuses.length),
          statuses.length - 1
        )
        setStatus(statuses[statusIdx])
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    animFrameRef.current = rafId
    return () => cancelAnimationFrame(rafId)
  }, []) // run once on mount

  // ── Real fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!repoUrl) {
      onError?.()
      return
    }

    const controller = new AbortController()

    const doFetch = async () => {
      const isLocal =
        !/^https?:\/\//i.test(repoUrl) && !repoUrl.includes('github.com')
      const primary = isLocal ? '/scan-local' : '/scan'
      const fallback = isLocal ? '/scan' : '/scan-local'

      let lastError = null

      for (const endpoint of [primary, fallback]) {
        try {
          const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // CRITICAL: This sends the cookie
            body: JSON.stringify({ repoUrl, repo_url: repoUrl, source: repoUrl, folder_path: repoUrl }),
            signal: controller.signal,
          })

          if (!response.ok) {
            const body = await parseResponseBody(response)
            throw new Error(body?.detail || body?.message || `Request failed with ${response.status}`)
          }

          const payload = await parseResponseBody(response)
          if (resolvedRef.current) return
          resolvedRef.current = true

          // Animate to 100 % then call onComplete
          targetRef.current = 100
          progressRef.current = 99
          setProgress(100)
          setStatus('Generating prioritized report...')
          await new Promise(r => setTimeout(r, 500))
          onComplete?.({ endpoint, findings: extractFindings(payload), payload })
          return
        } catch (error) {
          if (error.name === 'AbortError') return
          lastError = error
        }
      }

      // Both endpoints failed
      if (resolvedRef.current) return
      resolvedRef.current = true
      onError?.()
    }

    doFetch()

    return () => {
      controller.abort()
    }
  }, [repoUrl]) // intentionally depends only on repoUrl – fires once per scan

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
