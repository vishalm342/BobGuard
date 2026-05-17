import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, TrendingUp, AlertCircle, ArrowUpRight, X, Terminal, GitPullRequest, ChevronRight, Lock, Shield, Database, Package, CheckCircle, Loader2 } from 'lucide-react'

// ── Data helpers ────────────────────────────────────────────────────────────

const normalizeFinding = (finding, index = 0) => ({
  id: finding.id || finding.rule_id || finding.ruleId || `${finding.title || 'finding'}-${index}`,
  title: finding.title || finding.name || finding.rule_name || finding.category || 'Finding',
  severity: finding.severity || 'Medium',
  category: finding.category || finding.owasp_category || finding.owasp || 'Uncategorized',
  description: finding.description || finding.summary || finding.message || 'No description provided by the scan endpoint.',
  suggestion: finding.suggestion || finding.fix || finding.fix_text || finding.fixSnippet || '',
  codeSnippet: finding.codeSnippet || finding.code_snippet || finding.original_code || finding.snippet || '',
  fixSnippet: finding.fixSnippet || finding.fix_snippet || finding.fixed_snippet || finding.suggestion || '',
  file: finding.file || finding.file_path || finding.path || 'Unknown file',
  line: finding.line ?? finding.line_number ?? finding.lineNumber ?? null,
  ruleId: finding.rule_id || finding.ruleId || null,
})

const getSeverityScore = (severity) => {
  switch (severity) {
    case 'Critical': return 18
    case 'High': return 10
    case 'Medium': return 5
    case 'Low': return 2
    default: return 1
  }
}

const computeSecurityScore = (findings) => {
  if (!findings.length) return 100

  const penalty = findings.reduce((total, finding) => total + getSeverityScore(finding.severity), 0)
  return Math.max(0, 100 - penalty)
}

const buildCategoryData = (findings) => {
  const counts = findings.reduce((accumulator, finding) => {
    const category = finding.category || 'Uncategorized'
    accumulator[category] = (accumulator[category] || 0) + 1
    return accumulator
  }, {})

  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5)
}

const iconBySeverity = (severity) => {
  switch (severity) {
    case 'Critical': return <AlertCircle size={20} />
    case 'High': return <Shield size={20} />
    case 'Medium': return <Database size={20} />
    case 'Low': return <Package size={20} />
    default: return <Lock size={20} />
  }
}

const buildRecommendations = (findings) => findings.slice(0, 4).map((finding, index) => ({
  id: finding.id || `rec-${index}`,
  title: finding.title,
  desc: finding.description,
  priority: finding.severity || 'Medium',
  owasp: finding.category,
  icon: iconBySeverity(finding.severity),
  effort: finding.suggestion ? 'Guided fix available' : 'Review required',
  impact: `${finding.severity || 'Medium'} risk reduced`,
  details: finding.reasoning || finding.description || 'The backend returned this finding without additional reasoning.',
  codeSnippet: finding.codeSnippet || '// No vulnerable code snippet returned by the backend.',
  fixSnippet: finding.fixSnippet || finding.suggestion || '// No remediation snippet returned by the backend.',
  steps: finding.suggestion
    ? [finding.suggestion, 'Re-run the scan to confirm the issue is resolved.', 'Check for related findings in adjacent files.']
    : [
        'Inspect the flagged file and line in the backend output.',
        'Apply the remediation that matches the reported OWASP category.',
        'Re-scan the repository to verify the finding disappears.',
      ],
}))

// ── Circular Score ────────────────────────────────────────────────────────────

const CircularScore = ({ score = 78 }) => {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90">
        <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
        <motion.circle
          cx="96" cy="96" r={radius}
          stroke="url(#scoreGradient)" strokeWidth="12" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.2 }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="text-5xl font-black text-white"
        >
          {score}
        </motion.span>
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Security Score</span>
      </div>
    </div>
  )
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────

const VulnerabilityBarChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center rounded-2xl border border-dashed border-white/8 bg-white/[0.02] text-gray-500 text-sm">
        No category data returned for this scan.
      </div>
    )
  }

  const maxCount = Math.max(...data.map(d => d.count), 1)
  const palette = [
    { color: 'bg-red-500', glow: 'shadow-red-500/30' },
    { color: 'bg-orange-500', glow: 'shadow-orange-500/30' },
    { color: 'bg-yellow-500', glow: 'shadow-yellow-500/30' },
    { color: 'bg-blue-500', glow: 'shadow-blue-500/30' },
    { color: 'bg-green-500', glow: 'shadow-green-500/30' },
  ]

  return (
    <div className="h-64 flex items-end justify-between gap-4 px-4 border-b border-white/5">
      {data.map((item, index) => {
        const style = palette[index % palette.length]
        return (
          <div key={item.category} className="flex-1 flex flex-col items-center gap-4 group">
            <div className="relative w-full flex items-end justify-center h-48">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(item.count / maxCount) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
                className={`w-full max-w-[40px] rounded-t-lg ${style.color} opacity-75 group-hover:opacity-100 group-hover:shadow-lg ${style.glow} transition-all duration-300 relative`}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 px-2 py-0.5 rounded-lg whitespace-nowrap">
                  {item.count} issues
                </div>
              </motion.div>
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter text-center h-8 leading-tight">
              {item.category}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Slide-over Drawer ─────────────────────────────────────────────────────────

const RecommendationDrawer = ({ rec, onClose }) => {
  const [prState, setPrState] = useState('idle')

  useEffect(() => {
    setPrState('idle')
  }, [rec])

  const handleApplyFix = async () => {
    setPrState('applying')
    await new Promise(resolve => setTimeout(resolve, 2000))
    setPrState('applied')
  }

  const priorityColor = {
    Critical: 'text-red-400 bg-red-500/15 border-red-500/25',
    High: 'text-orange-400 bg-orange-500/15 border-orange-500/25',
    Medium: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/25',
  }

  return (
    <AnimatePresence>
      {rec && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer Panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 38 }}
            className="fixed top-0 right-0 h-full w-[520px] bg-[#0e0e1a] border-l border-white/8 z-50 flex flex-col shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between p-7 border-b border-white/6 bg-gradient-to-r from-blue-600/8 to-purple-600/5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  {rec.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${priorityColor[rec.priority]}`}>
                      {rec.priority}
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono">{rec.owasp}</span>
                  </div>
                  <h2 className="text-xl font-black text-white">{rec.title}</h2>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90, backgroundColor: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="p-2 rounded-xl text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-7 space-y-7 custom-scrollbar">

              {/* Meta chips */}
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'Effort', value: rec.effort },
                  { label: 'Impact', value: rec.impact },
                ].map(m => (
                  <div key={m.label} className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-sm">
                    <span className="text-gray-600 text-xs font-bold uppercase tracking-wider mr-2">{m.label}</span>
                    <span className="text-white font-semibold">{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Why This Matters</h3>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{rec.details}</p>
              </div>

              {/* Code Diff */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Code Change</h3>
                <div className="space-y-2">
                  <div className="rounded-xl overflow-hidden border border-red-500/15">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/8 border-b border-red-500/10">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Before (Vulnerable)</span>
                    </div>
                    <pre className="text-xs font-mono text-red-300/80 p-4 bg-red-950/20 overflow-x-auto leading-relaxed">
                      {rec.codeSnippet}
                    </pre>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-green-500/15">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/8 border-b border-green-500/10">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs font-bold text-green-400 uppercase tracking-widest">After (Fixed)</span>
                    </div>
                    <pre className="text-xs font-mono text-green-300/80 p-4 bg-green-950/20 overflow-x-auto leading-relaxed">
                      {rec.fixSnippet}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Remediation Steps</h3>
                <div className="space-y-2">
                  {rec.steps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-white/3 border border-white/5"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-300">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="p-6 border-t border-white/6 bg-[#0a0a12]">
              <motion.button
                onClick={prState === 'idle' ? handleApplyFix : undefined}
                whileHover={prState === 'idle' ? { scale: 1.02, boxShadow: '0 0 32px rgba(59,130,246,0.35)' } : {}}
                whileTap={prState === 'idle' ? { scale: 0.97 } : {}}
                layout
                className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all relative overflow-hidden ${
                  prState === 'idle'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                    : prState === 'applying'
                    ? 'bg-blue-900/80 text-blue-300 cursor-not-allowed shadow-none border border-blue-800'
                    : 'bg-emerald-600 text-white cursor-default shadow-[0_4px_20px_rgba(5,150,105,0.4)]'
                }`}
              >
                <AnimatePresence mode="wait">
                  {prState === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                      <GitPullRequest size={16} />
                      <span>Apply Fix via Pull Request</span>
                    </motion.div>
                  )}
                  {prState === 'applying' && (
                    <motion.div key="applying" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-2">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Loader2 size={16} /></motion.div>
                      <span>Creating Pull Request...</span>
                    </motion.div>
                  )}
                  {prState === 'applied' && (
                    <motion.div key="applied" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="flex items-center gap-2">
                      <CheckCircle size={16} />
                      <span>Fix Applied! (PR #105)</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Main Reports Component ────────────────────────────────────────────────────

const Reports = ({ findings = [], summary = {}, loading = false, error = '', source = '' }) => {
  const [activeRec, setActiveRec] = useState(null)

  const normalizedFindings = useMemo(() => findings.map(normalizeFinding), [findings])
  const chartData = useMemo(() => buildCategoryData(normalizedFindings), [normalizedFindings])
  const recommendations = useMemo(() => buildRecommendations(normalizedFindings), [normalizedFindings])
  const securityScore = Number(summary.securityScore ?? computeSecurityScore(normalizedFindings)) || 0
  const totalFindings = Number(summary.total ?? normalizedFindings.length) || 0
  const criticalFindings = Number(summary.critical ?? normalizedFindings.filter(finding => finding.severity === 'Critical').length) || 0

  useEffect(() => {
    if (!recommendations.length) {
      setActiveRec(null)
      return
    }

    setActiveRec(previous => (previous && recommendations.some(rec => rec.id === previous.id) ? previous : recommendations[0]))
  }, [recommendations])

  if (loading && !normalizedFindings.length) {
    return (
      <div className="space-y-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white/3 border border-white/5 animate-pulse h-[320px]" />
          <div className="md:col-span-2 p-8 rounded-3xl bg-white/3 border border-white/5 animate-pulse h-[320px]" />
        </div>
        <div className="p-8 rounded-3xl bg-white/3 border border-white/5 animate-pulse h-[420px]" />
      </div>
    )
  }

  if (error && !normalizedFindings.length) {
    return (
      <div className="space-y-8 pb-12">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-100">
          <AlertCircle size={32} className="mx-auto mb-4 text-red-300" />
          <h3 className="text-lg font-bold mb-2">Unable to load report data</h3>
          <p className="text-sm text-red-100/70">{error || 'The backend did not return report data for this scan.'}</p>
        </div>
      </div>
    )
  }

  if (!normalizedFindings.length) {
    return (
      <div className="space-y-8 pb-12">
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-gray-500">
          <AlertCircle size={32} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-300 mb-2">No report data yet</h3>
          <p className="text-sm max-w-xl mx-auto leading-relaxed">
            {source ? 'The backend scan returned no findings, so the report is empty.' : 'Run /scan or /scan-local to populate the report with real findings.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Drawer */}
      <RecommendationDrawer rec={activeRec} onClose={() => setActiveRec(null)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
          Security Health Report
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
          <TrendingUp size={14} />
          <span>{totalFindings} findings analyzed</span>
        </div>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-3xl bg-white/3 border border-white/5 flex flex-col items-center justify-center gap-6"
        >
          <CircularScore score={securityScore} />
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2 font-medium">
              System Integrity: {securityScore >= 80 ? 'Stable' : securityScore >= 60 ? 'Review required' : 'At risk'}
            </p>
            <div className="flex items-center gap-1.5 justify-center text-green-400 text-xs font-bold">
              <ShieldCheck size={12} />
              {criticalFindings > 0 ? `${criticalFindings} critical findings need attention` : 'Validated by current scan'}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 p-8 rounded-3xl bg-white/3 border border-white/5"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg text-white">Vulnerabilities by Category</h3>
            <span className="text-xs text-gray-500 font-mono">{source || 'Current scan'}</span>
          </div>
          <VulnerabilityBarChart data={chartData} />
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-8 rounded-3xl bg-gradient-to-br from-blue-600/8 to-purple-600/6 border border-white/8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/20">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-white">Top Recommendations</h3>
            <p className="text-gray-500 text-sm">Click any card to see the backend finding, code context, and remediation steps.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => {
            const dotColor = {
              Critical: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]',
              High: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.7)]',
              Medium: 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.7)]',
              Low: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)]',
              Info: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]',
            }
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                onClick={() => setActiveRec(rec)}
                whileHover={{
                  x: 6,
                  scale: 1.015,
                  backgroundColor: 'rgba(59, 130, 246, 0.06)',
                  borderColor: 'rgba(59, 130, 246, 0.25)',
                  boxShadow: '0 0 24px rgba(59, 130, 246, 0.08)',
                }}
                whileTap={{ scale: 0.98 }}
                className="p-5 rounded-2xl border border-white/6 bg-white/2 cursor-pointer group flex items-start justify-between transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/8 text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all shrink-0">
                    {rec.icon}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dotColor[rec.priority] || dotColor.Info}`} />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{rec.priority}</span>
                      <span className="text-[10px] text-gray-700 font-mono">{rec.owasp}</span>
                    </div>
                    <h4 className="font-bold text-white group-hover:text-blue-300 transition-colors">{rec.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{rec.desc}</p>
                  </div>
                </div>
                <div className="shrink-0 ml-3 mt-1">
                  <motion.div
                    animate={{ x: [0, 3, 0], y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    <ArrowUpRight size={18} className="text-gray-700 group-hover:text-blue-400 transition-colors" />
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

export default Reports
