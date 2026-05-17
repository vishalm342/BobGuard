import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  FileCode,
  Terminal,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  BarChart,
  Activity,
  Bell,
  RefreshCw,
  TrendingUp,
  Cpu
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import VulnerabilityDetail from './VulnerabilityDetail'
import CodebaseView from './CodebaseView'
import Vulnerabilities from './Vulnerabilities'
import Reports from './Reports'
import Notifications from './Notifications'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''
const SCAN_TIMEOUT_MS = 120000

// ── Data helpers ────────────────────────────────────────────────────────────

const normalizeSeverity = (severity) => {
  const value = String(severity || '').trim().toLowerCase()

  if (value.startsWith('crit')) return 'Critical'
  if (value.startsWith('high')) return 'High'
  if (value.startsWith('med')) return 'Medium'
  if (value.startsWith('low')) return 'Low'
  if (value.startsWith('info')) return 'Info'

  return severity ? String(severity) : 'Medium'
}

const normalizeLine = (line) => {
  const parsed = Number(line)
  return Number.isFinite(parsed) ? parsed : null
}

const splitFileAndLine = (finding) => {
  const candidates = [
    finding.file,
    finding.file_path,
    finding.filePath,
    finding.path,
    finding.location,
    finding.source_file,
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    const text = String(candidate)
    const match = text.match(/^(.*?):(\d+)$/)

    if (match) {
      return { file: match[1], line: normalizeLine(match[2]) }
    }

    return { file: text, line: normalizeLine(finding.line || finding.line_number || finding.lineNumber) }
  }

  return {
    file: 'Unknown file',
    line: normalizeLine(finding.line || finding.line_number || finding.lineNumber),
  }
}

const normalizeFinding = (finding, index = 0) => {
  const { file, line } = splitFileAndLine(finding)
  const title = finding.title || finding.name || finding.rule_name || `${finding.rule_id || 'Finding'} detected`
  const suggestion = finding.suggestion || finding.fix || finding.fix_text || finding.fixText || finding.recommendation || finding.remediation || finding.remediation_text || finding.suggested_fix || finding.suggestedFix || finding.fixSnippet || ''

  return {
    id: finding.id || finding.rule_id || finding.ruleId || `${file}:${line || index}`,
    title,
    severity: normalizeSeverity(finding.severity),
    category: finding.owasp_category || finding.category || finding.owasp || 'Uncategorized',
    file,
    line,
    description: finding.description || finding.summary || finding.message || 'No description provided by the scan endpoint.',
    suggestion,
    codeSnippet: finding.codeSnippet || finding.code_snippet || finding.sourceSnippet || finding.original_code || finding.snippet || '',
    fixSnippet: finding.fixSnippet || finding.fix_snippet || finding.fixed_snippet || suggestion,
    reasoning: finding.reasoning || finding.explanation || finding.details || '',
    ruleId: finding.rule_id || finding.ruleId || finding.id || null,
    raw: finding,
  }
}

const extractFindings = (payload) => {
  const candidates = [
    payload?.findings,
    payload?.vulnerabilities,
    payload?.issues,
    payload?.results,
    payload?.scan?.findings,
    payload?.scan?.results,
    payload?.analysis?.findings,
    payload?.report?.findings,
    payload?.data,
    payload,
  ]

  const rawFindings = candidates.find(candidate => Array.isArray(candidate)) || []
  return rawFindings.map((finding, index) => normalizeFinding(finding, index))
}

const extractSummary = (payload, findings) => {
  const summary = payload?.summary || payload?.stats || payload?.statistics || payload?.metrics || payload?.scanSummary || {}
  const severityCounts = summary?.severityCounts || payload?.severityCounts || payload?.severity_counts || {}
  const fallbackCounts = findings.reduce((accumulator, finding) => {
    const severity = normalizeSeverity(finding.severity)
    accumulator[severity] = (accumulator[severity] || 0) + 1
    return accumulator
  }, {})
  const total = Number(summary.total ?? summary.totalFindings ?? summary.findings ?? findings.length) || 0
  const critical = Number(summary.critical ?? severityCounts.Critical ?? severityCounts.critical ?? fallbackCounts.Critical ?? 0) || 0
  const high = Number(summary.high ?? severityCounts.High ?? severityCounts.high ?? fallbackCounts.High ?? 0) || 0
  const medium = Number(summary.medium ?? severityCounts.Medium ?? severityCounts.medium ?? fallbackCounts.Medium ?? 0) || 0
  const low = Number(summary.low ?? severityCounts.Low ?? severityCounts.low ?? fallbackCounts.Low ?? 0) || 0
  const info = Number(summary.info ?? severityCounts.Info ?? severityCounts.info ?? fallbackCounts.Info ?? 0) || 0
  const categories = Number(summary.categories ?? summary.owaspCategories ?? summary.categoryCount ?? new Set(findings.map(vuln => vuln.category).filter(Boolean)).size) || 0
  const withSuggestions = Number(summary.withSuggestions ?? summary.fixable ?? summary.actionable ?? findings.filter(vuln => vuln.suggestion || vuln.fixSnippet).length) || 0
  const actionableRate = Number(summary.actionableRate ?? summary.fixableRate ?? (total ? Math.round((withSuggestions / total) * 100) : 0)) || 0
  const securityScore = Number(summary.securityScore ?? summary.score ?? summary.healthScore ?? (total ? Math.max(0, 100 - (critical * 18) - (high * 10) - (medium * 5) - (low * 2)) : 100)) || 0

  return {
    total,
    critical,
    high,
    medium,
    low,
    info,
    categories,
    withSuggestions,
    actionableRate,
    securityScore,
    payload,
  }
}

const buildThreatFeed = (payload, findings) => {
  const feed = payload?.alerts || payload?.notifications || payload?.events || payload?.activity || payload?.feed

  if (Array.isArray(feed) && feed.length > 0) {
    return feed.slice(0, 4).map((item, index) => ({
      id: item.id || item.key || index,
      msg: item.msg || item.message || item.title || item.description || 'Backend alert received',
      severity: normalizeSeverity(item.severity || item.priority),
      time: item.time || item.timestamp || item.label || 'Live',
    }))
  }

  if (findings.length === 0) {
    return [
      {
        id: 'idle',
        msg: 'Awaiting scan results from /scan or /scan-local',
        severity: 'Info',
        time: 'Ready',
      },
    ]
  }

  return findings.slice(0, 4).map((finding, index) => ({
    id: finding.id || index,
    msg: `${finding.severity} ${finding.title}${finding.file ? ` in ${finding.file}${finding.line !== null ? `:${finding.line}` : ''}` : ''}`,
    severity: finding.severity,
    time: finding.category || finding.ruleId || 'Current scan',
  }))
}

const isLocalSource = (source) => {
  if (!source) return false
  return !/^https?:\/\//i.test(source) && !source.includes('github.com')
}

const buildScanEndpoints = (source, preferredMode) => {
  const preferredIsLocal = preferredMode === 'local' || (!preferredMode && isLocalSource(source))
  const primary = preferredIsLocal ? '/scan-local' : '/scan'
  const fallback = primary === '/scan' ? '/scan-local' : '/scan'
  return [primary, fallback]
}

const parseResponseBody = async (response) => {
  const text = await response.text()

  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

const fetchScanResults = async (source, signal, preferredMode) => {
  let lastError = null

  for (const endpoint of buildScanEndpoints(source, preferredMode)) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: source, repo_url: source, source, folder_path: source }),
        signal,
      })

      if (!response.ok) {
        const body = await parseResponseBody(response)
        throw new Error(body?.message || `Request failed with ${response.status}`)
      }

      const payload = await parseResponseBody(response)
      return {
        endpoint,
        findings: extractFindings(payload),
        payload,
      }
    } catch (error) {
      if (error.name === 'AbortError') throw error
      lastError = error
    }
  }

  throw lastError || new Error('Unable to load scan results.')
}

// ── Sub-components ───────────────────────────────────────────────────────────

const SeverityBadge = ({ severity }) => {
  const map = {
    Critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
    High: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    Low: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    Info: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  }
  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest ${map[severity] || 'bg-gray-500/20 text-gray-400'}`}>
      {severity}
    </span>
  )
}

const StatCard = ({ label, value, icon, color, trend, subtext }) => {
  const glowMap = { red: 'hover:shadow-red-500/10', blue: 'hover:shadow-blue-500/10', green: 'hover:shadow-green-500/10', orange: 'hover:shadow-orange-500/10' }
  const bgMap = { red: 'bg-red-500/10', blue: 'bg-blue-500/10', green: 'bg-green-500/10', orange: 'bg-orange-500/10' }
  const borderMap = { red: 'border-red-500/10', blue: 'border-blue-500/10', green: 'border-green-500/10', orange: 'border-orange-500/10' }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`gradient-border shimmer p-6 rounded-2xl border ${borderMap[color]} hover:shadow-lg ${glowMap[color]} transition-all duration-300 cursor-default`}
    >
      <div className="flex items-start justify-between mb-5">
        <div className={`p-2.5 rounded-xl ${bgMap[color]}`}>{icon}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs text-green-400 font-semibold">
            <TrendingUp size={12} />
            {trend}
          </div>
        )}
      </div>
      <div className="text-4xl font-black mb-1 tracking-tight">{value}</div>
      <div className="text-[11px] text-gray-500 uppercase font-bold tracking-widest">{label}</div>
      {subtext && <div className="text-xs text-gray-600 mt-1">{subtext}</div>}
    </motion.div>
  )
}

const NavItem = ({ icon, label, active = false, onClick, badge }) => (
  <motion.div
    onClick={onClick}
    whileHover={{ scale: 1.04, backgroundColor: 'rgba(37, 99, 235, 0.12)', boxShadow: '0 0 20px rgba(37, 99, 235, 0.08)' }}
    whileTap={{ scale: 0.97 }}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${active
        ? 'bg-blue-600 text-white glow-blue border-blue-400/40'
        : 'text-gray-400 border-transparent hover:text-white'
      }`}
  >
    <div className={active ? 'text-white' : 'text-gray-500'}>{icon}</div>
    <span className="font-semibold text-sm flex-1">{label}</span>
    {badge && (
      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badge}
      </span>
    )}
    {active && (
      <motion.div
        layoutId="nav-indicator"
        className="w-1 h-4 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
      />
    )}
  </motion.div>
)

const ThreatFeedTicker = ({ items = [] }) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!items.length) return undefined

    const t = setInterval(() => setIndex(i => (i + 1) % items.length), 4000)
    return () => clearInterval(t)
  }, [items])

  const item = items[index % (items.length || 1)] || {
    msg: 'Awaiting scan results from the backend',
    severity: 'Info',
    time: 'Ready',
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/3 border border-white/5 max-w-sm overflow-hidden">
      <div className="flex items-center gap-1.5 shrink-0">
        <Activity size={14} className="text-blue-400 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Live</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="text-xs text-gray-400 truncate"
        >
          {item.msg}
        </motion.p>
      </AnimatePresence>
      <SeverityBadge severity={item.severity} />
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

const Dashboard = ({ repoUrl, initialScanResult }) => {
  const [selectedVulnId, setSelectedVulnId] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [scanStatus, setScanStatus] = useState(initialScanResult ? 'success' : 'idle')
  const seedFindings = initialScanResult ? extractFindings(initialScanResult.payload) : []
  const [findings, setFindings] = useState(seedFindings)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [scanEndpoint, setScanEndpoint] = useState(initialScanResult?.endpoint || '')
  const [scanPayload, setScanPayload] = useState(initialScanResult?.payload || null)
  const [remoteRepoUrl, setRemoteRepoUrl] = useState(repoUrl || '')
  const [localFolderPath, setLocalFolderPath] = useState('')
  const [scanSource, setScanSource] = useState(repoUrl || '')
  const scanRequestIdRef = useRef(0)
  const abortRef = useRef(null)
  const initialResultRef = useRef(initialScanResult)


  const loadResults = useCallback(async ({ source = scanSource, preferredMode } = {}) => {
    const requestId = ++scanRequestIdRef.current
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller
    let timedOut = false
    const timeoutId = window.setTimeout(() => {
      timedOut = true
      controller.abort()
    }, SCAN_TIMEOUT_MS)

    setIsRefreshing(true)
    setIsLoading(true)
    setLoadError('')
    setScanStatus(source ? 'scanning' : 'idle')

    if (!source) {
      setFindings([])
      setScanEndpoint('')
      setScanPayload(null)
      setSelectedVulnId(null)
      setIsLoading(false)
      setIsRefreshing(false)
      setScanStatus('idle')
      window.clearTimeout(timeoutId)
      controller.abort()
      return
    }

    setFindings([])
    setScanEndpoint('')
    setScanPayload(null)
    setSelectedVulnId(null)

    try {
      setScanStatus('scanning')
      const { findings: nextFindings, endpoint, payload } = await fetchScanResults(source, controller.signal, preferredMode)
      if (requestId !== scanRequestIdRef.current) return
      setFindings(nextFindings)
      setScanEndpoint(endpoint)
      setScanPayload(payload)
      setScanStatus('success')
    } catch (error) {
      if (requestId === scanRequestIdRef.current && error.name !== 'AbortError') {
        setScanStatus('error')
        setLoadError(timedOut ? 'Scan timed out after 2 minutes. Large repositories can take 1 to 2 minutes.' : (error.message || 'Unable to load scan results.'))
        setFindings([])
        setScanEndpoint('')
        setScanPayload(null)
      }
    } finally {
      window.clearTimeout(timeoutId)
      if (requestId === scanRequestIdRef.current) {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
  }, [scanSource])

  const handleRefresh = () => {
    if (isRefreshing || scanStatus === 'submitting' || scanStatus === 'scanning') return
    setScanStatus('submitting')
    loadResults({ source: scanSource, preferredMode: scanEndpoint === '/scan-local' ? 'local' : 'remote' })
  }

  const handleRemoteSubmit = (event) => {
    event.preventDefault()
    if (isRefreshing || scanStatus === 'submitting' || scanStatus === 'scanning') return
    const nextSource = remoteRepoUrl.trim()
    if (!nextSource) return
    setScanSource(nextSource)
    setActiveTab('overview')
    setScanStatus('submitting')
    loadResults({ source: nextSource, preferredMode: 'remote' })
  }

  const handleLocalSubmit = (event) => {
    event.preventDefault()
    if (isRefreshing || scanStatus === 'submitting' || scanStatus === 'scanning') return
    const nextSource = localFolderPath.trim()
    if (!nextSource) return
    setScanSource(nextSource)
    setActiveTab('overview')
    setScanStatus('submitting')
    loadResults({ source: nextSource, preferredMode: 'local' })
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!repoUrl?.trim()) {
      setRemoteRepoUrl('')
      setScanSource('')
      setFindings([])
      setScanEndpoint('')
      setScanPayload(null)
      setIsLoading(false)
      setScanStatus('idle')
      setLoadError('')
      return
    }

    const nextRepoUrl = repoUrl.trim()
    setRemoteRepoUrl(nextRepoUrl)
    setScanSource(nextRepoUrl)
    setScanStatus('submitting')
    if (initialResultRef.current) {
      initialResultRef.current = null
      return
    }

    loadResults({ source: nextRepoUrl, preferredMode: 'remote' })
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [repoUrl, loadResults])
  /* eslint-enable react-hooks/set-state-in-effect */

  const repoName = scanSource?.split(/[\\/]/).filter(Boolean).slice(-2).join('/') || 'No scan selected'

  const filteredVulns = findings.filter(v =>
    !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedVuln = useMemo(() => {
    if (!findings.length) return null
    return findings.find(vuln => vuln.id === selectedVulnId) || findings[0]
  }, [findings, selectedVulnId])

  const overviewStats = useMemo(() => extractSummary(scanPayload, findings), [scanPayload, findings])
  const threatFeedItems = useMemo(() => buildThreatFeed(scanPayload, findings), [scanPayload, findings])

  const scanLabel = scanEndpoint === '/scan-local' ? 'Local scan' : scanEndpoint === '/scan' ? 'Remote scan' : 'Scan pending'
  const scanStatusText = {
    idle: 'Ready to scan',
    submitting: 'Submitting scan request',
    scanning: 'Scanning repository',
    success: 'Scan completed',
    error: 'Scan failed',
  }[scanStatus] || 'Ready to scan'
  const isScanInFlight = isRefreshing || scanStatus === 'submitting' || scanStatus === 'scanning'
  const hasSearchResults = filteredVulns.length > 0

  const navItems = [
    { id: 'overview', icon: <LayoutDashboard size={17} />, label: 'Overview' },
    { id: 'vulnerabilities', icon: <ShieldAlert size={17} />, label: 'Vulnerabilities', badge: overviewStats.critical || undefined },
    { id: 'notifications', icon: <Bell size={17} />, label: 'Notifications', badge: findings.length || undefined },
    { id: 'codebase', icon: <FileCode size={17} />, label: 'Codebase View' },
    { id: 'reports', icon: <BarChart size={17} />, label: 'Reports' },
  ]

  return (
    <div className="flex min-h-screen bg-[#080810] text-white">

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className="w-64 border-r border-white/5 p-6 flex flex-col gap-8 bg-gradient-to-b from-[#0e0e1a] to-[#080810] shrink-0">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ boxShadow: ['0 0 12px rgba(59,130,246,0.4)', '0 0 24px rgba(59,130,246,0.7)', '0 0 12px rgba(59,130,246,0.4)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center"
          >
            <Cpu size={18} className="text-white" />
          </motion.div>
          <div>
            <span className="font-black text-lg tracking-tight gradient-text">IBM Bob</span>
            <div className="text-[10px] text-gray-600 font-semibold tracking-widest uppercase">Security AI</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              badge={item.badge}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        {/* Repo Info */}
        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
          <div className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-2">Scanning</div>
          <div className="text-xs font-mono text-blue-300 truncate">{repoName}</div>
          <div className="mt-2 text-[10px] text-gray-500 uppercase tracking-[0.2em]">{scanLabel}</div>
          <div className={`mt-3 rounded-lg border px-3 py-2 text-[10px] uppercase tracking-[0.2em] ${scanStatus === 'error' ? 'border-red-500/20 bg-red-500/10 text-red-200' : scanStatus === 'success' ? 'border-green-500/20 bg-green-500/10 text-green-200' : 'border-white/5 bg-black/20 text-gray-400'}`}>
            {scanStatusText}
          </div>
        </div>

        {/* MCP Status */}
        <div className="mt-auto">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600/15 to-purple-600/10 border border-blue-500/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">MCP Connection</span>
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
            </div>
            <div className="text-[11px] text-green-400 font-semibold mb-3">Bob is Connected</div>
            <div className="space-y-1.5">
              {[
                { label: 'Findings', value: String(overviewStats.total) },
                { label: 'Critical', value: String(overviewStats.critical) },
                { label: 'Fixable', value: `${overviewStats.actionableRate}%` },
              ].map(m => (
                <div key={m.label} className="flex justify-between text-[10px]">
                  <span className="text-gray-600">{m.label}</span>
                  <span className="text-gray-400 font-mono">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-8 bg-[#080810]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-base font-bold">Project Analysis</h1>
              <div className="text-xs text-gray-500 font-mono">{repoName}</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              {scanLabel}
            </div>
            <ThreatFeedTicker items={threatFeedItems} />
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search vulnerabilities..."
                className="bg-white/5 border border-white/8 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 w-56 transition-all placeholder:text-gray-600"
              />
            </div>

            {/* Refresh */}
            <motion.button
              onClick={handleRefresh}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isScanInFlight}
              className="p-2 rounded-xl bg-white/5 border border-white/8 text-gray-400 hover:text-blue-400 hover:border-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </motion.button>

            {/* Bell */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-xl bg-white/5 border border-white/8 text-gray-400 hover:text-white transition-all"
            >
              <Bell size={16} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            </motion.button>

            {/* Filter */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl bg-white/5 border border-white/8 text-gray-400 hover:text-white transition-all"
            >
              <Filter size={16} />
            </motion.button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="mb-6 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 shadow-[0_0_40px_rgba(15,23,42,0.2)]">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 mb-2">Scan launcher</div>
                  <h2 className="text-lg font-bold text-white">Run a remote repo scan or a local folder scan</h2>
                  <p className="text-sm text-gray-500 mt-1">Remote inputs use <span className="text-gray-300">/scan</span>. Local folder paths use <span className="text-gray-300">/scan-local</span>.</p>
                  <p className="text-xs text-gray-500 mt-2">Scanning may take 1 to 2 minutes for large repos.</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 min-w-[170px]">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Total findings</div>
                  <div className="text-3xl font-black text-white">{overviewStats.total}</div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <form onSubmit={handleRemoteSubmit} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Remote scan</div>
                      <div className="text-sm text-gray-300 mt-1">Submit a repository URL</div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">POST /scan</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={remoteRepoUrl}
                      onChange={e => setRemoteRepoUrl(e.target.value)}
                      placeholder="https://github.com/org/repo"
                      className="flex-1 bg-black/20 border border-white/8 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                    />
                    <button
                      type="submit"
                      disabled={!remoteRepoUrl.trim() || isScanInFlight}
                      className="px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {scanStatus === 'submitting' ? 'Submitting...' : isScanInFlight ? 'Scanning...' : 'Scan'}
                    </button>
                  </div>
                </form>

                <form onSubmit={handleLocalSubmit} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Local test</div>
                      <div className="text-sm text-gray-300 mt-1">Submit a local folder path</div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">POST /scan-local</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={localFolderPath}
                      onChange={e => setLocalFolderPath(e.target.value)}
                      placeholder="C:\\Users\\appus\\Projects\\bobguard"
                      className="flex-1 bg-black/20 border border-white/8 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-gray-600"
                    />
                    <button
                      type="submit"
                      disabled={!localFolderPath.trim() || isScanInFlight}
                      className="px-4 py-3 rounded-xl bg-cyan-500 text-black text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {scanStatus === 'submitting' ? 'Submitting...' : isScanInFlight ? 'Scanning...' : 'Test'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4">Scan summary</div>
              <div className="space-y-3">
                {[
                  { label: 'Active source', value: scanSource || 'None selected' },
                  { label: 'Endpoint', value: scanEndpoint || 'Not started' },
                  { label: 'Severity groups', value: String(new Set(findings.map(item => item.severity).filter(Boolean)).size) },
                  { label: 'OWASP mappings', value: String(new Set(findings.map(item => item.category).filter(Boolean)).size) },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <span className="text-xs text-gray-500 uppercase tracking-[0.2em]">{item.label}</span>
                    <span className="text-sm font-semibold text-white truncate max-w-[180px] text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {loadError && findings.length > 0 && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-100 flex items-center justify-between gap-4">
              <span>Last scan returned an error while refreshing results: {loadError}</span>
              <button onClick={handleRefresh} className="px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/20 text-xs font-bold uppercase tracking-widest shrink-0">Retry</button>
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── Overview ── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                {/* Stat Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                  <StatCard label="Total Risks" value={String(overviewStats.total)} icon={<ShieldAlert size={20} className="text-red-400" />} color="red" trend={overviewStats.total ? `${overviewStats.high + overviewStats.critical}` : undefined} subtext="vs last scan" />
                  <StatCard label="OWASP Categories" value={String(overviewStats.categories)} icon={<BarChart size={20} className="text-blue-400" />} color="blue" />
                  <StatCard label="Ready to Fix" value={String(overviewStats.withSuggestions)} icon={<CheckCircle size={20} className="text-green-400" />} color="green" trend={overviewStats.actionableRate ? `${overviewStats.actionableRate}%` : undefined} />
                  <StatCard label="Critical Issues" value={String(overviewStats.critical)} icon={<AlertTriangle size={20} className="text-orange-400" />} color="orange" subtext="Immediate action" />
                </div>

                {/* Split View */}
                <div className="flex gap-6">
                  {/* Vuln List */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold">Identified Vulnerabilities</h3>
                      <span className="text-xs text-gray-500">{filteredVulns.length} found</span>
                    </div>
                    {isLoading && !findings.length ? (
                      <div className="space-y-3">
                        {[0, 1, 2].map(index => (
                          <div key={index} className="p-5 rounded-2xl border border-white/5 bg-white/2 animate-pulse">
                            <div className="h-4 w-40 rounded bg-white/10 mb-4" />
                            <div className="h-3 w-3/4 rounded bg-white/10 mb-3" />
                            <div className="h-3 w-1/2 rounded bg-white/10" />
                          </div>
                        ))}
                      </div>
                    ) : loadError && !findings.length ? (
                      <div className="p-6 rounded-3xl border border-red-500/20 bg-red-500/5 text-sm text-red-200">
                        <div className="font-semibold mb-2">Scan failed</div>
                        <p className="text-red-100/70 mb-4">{loadError}</p>
                        <button onClick={handleRefresh} className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/20 text-red-100 text-xs font-bold uppercase tracking-widest">
                          Retry scan
                        </button>
                      </div>
                    ) : hasSearchResults ? (
                      <motion.div
                        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
                        initial="hidden"
                        animate="show"
                        className="space-y-3"
                      >
                        {filteredVulns.map(vuln => (
                          <motion.div
                            key={vuln.id}
                            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
                            whileHover={{ scale: 1.01, x: 2 }}
                            onClick={() => setSelectedVulnId(vuln.id)}
                            className={`p-5 rounded-2xl border cursor-pointer group transition-all ${
                              selectedVuln?.id === vuln.id
                                ? 'bg-blue-600/8 border-blue-500/40 ring-1 ring-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.08)]'
                                : 'bg-white/2 border-white/5 hover:border-white/10 hover:bg-white/4'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2.5">
                              <div className="flex items-center gap-2.5">
                                <SeverityBadge severity={vuln.severity} />
                                <h4 className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors">{vuln.title}</h4>
                              </div>
                              <ChevronRight
                                size={16}
                                className={`text-gray-600 group-hover:text-gray-400 transition-all ${selectedVuln?.id === vuln.id ? 'rotate-90 text-blue-400' : ''}`}
                              />
                            </div>
                            <div className="flex flex-wrap items-center gap-5 text-xs text-gray-600 font-mono mb-3">
                              <span className="flex items-center gap-1.5"><Terminal size={12} /> {vuln.file}{vuln.line !== null ? `:${vuln.line}` : ''}</span>
                              <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> {vuln.category}</span>
                            </div>
                            <p className="text-sm text-gray-300/80 leading-relaxed mb-2">{vuln.description}</p>
                            {vuln.suggestion && (
                              <p className="text-xs text-blue-300/80 leading-relaxed">
                                Suggestion: {vuln.suggestion}
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="p-8 rounded-3xl border border-dashed border-white/10 bg-white/2 text-center text-gray-500">
                        <ShieldCheck size={32} className="mx-auto mb-3 opacity-60" />
                        <h4 className="text-base font-bold text-gray-300 mb-2">
                          {searchQuery ? 'No matching findings' : 'No findings yet'}
                        </h4>
                        <p className="text-sm max-w-md mx-auto leading-relaxed">
                          {searchQuery
                            ? 'Try a broader search term or clear the filter to inspect the full scan output.'
                            : 'The scan endpoint returned no actionable findings for this repository.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Detail Panel */}
                  <div className="w-[460px] shrink-0">
                    <AnimatePresence mode="wait">
                      {selectedVuln ? (
                        <motion.div
                          key={selectedVuln.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="p-7 rounded-3xl glass border-white/8 sticky top-0"
                        >
                          <VulnerabilityDetail
                            vulnerability={selectedVuln}
                            onApplyFix={v => console.log('Applying fix for:', v.title)}
                          />
                        </motion.div>
                      ) : isLoading && findings.length ? (
                        <div className="h-[520px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-white/8 bg-white/[0.02] text-gray-500">
                          <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-400 animate-spin mb-4" />
                          <h3 className="text-base font-bold mb-2 text-gray-300">Refreshing findings</h3>
                          <p className="text-sm max-w-[220px] leading-relaxed">Bob is updating the dashboard with the latest scan output.</p>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="h-[520px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-white/8 text-gray-600"
                        >
                          <div className="float mb-6">
                            <ShieldCheck size={56} className="opacity-15" />
                          </div>
                          <h3 className="text-base font-bold mb-2 text-gray-500">Detailed Analysis</h3>
                          <p className="text-sm max-w-[220px] leading-relaxed">Select a vulnerability to see Bob's context-aware fix and OWASP reasoning.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Vulnerabilities ── */}
            {activeTab === 'vulnerabilities' && (
              <motion.div key="vulnerabilities" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div className="flex gap-6">
                  <div className="flex-1 min-w-0">
                    {isLoading && !findings.length ? (
                      <div className="h-[420px] rounded-3xl border border-white/8 bg-white/[0.02] animate-pulse" />
                    ) : loadError && !findings.length ? (
                      <div className="p-8 rounded-3xl border border-red-500/20 bg-red-500/5 text-red-100">
                        <h3 className="text-lg font-bold mb-2">Unable to load scan results</h3>
                        <p className="text-sm text-red-100/70 mb-4">{loadError}</p>
                        <button onClick={handleRefresh} className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/20 text-xs font-bold uppercase tracking-widest">Retry</button>
                      </div>
                    ) : (
                      <Vulnerabilities vulnerabilities={filteredVulns} onSelect={vuln => setSelectedVulnId(vuln.id)} selectedId={selectedVuln?.id} />
                    )}
                  </div>
                  <div className="w-[460px] shrink-0">
                    <AnimatePresence mode="wait">
                      {selectedVuln ? (
                        <motion.div
                          key={selectedVuln.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="p-7 rounded-3xl glass border-white/8 sticky top-0"
                        >
                          <VulnerabilityDetail
                            vulnerability={selectedVuln}
                            onApplyFix={v => console.log('Applying fix for:', v.title)}
                          />
                        </motion.div>
                      ) : isLoading && findings.length ? (
                        <div className="h-[600px] rounded-3xl border border-white/8 bg-white/[0.02] animate-pulse" />
                      ) : (
                        <div className="h-[600px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-white/8 text-gray-600">
                          <div className="float mb-6"><ShieldCheck size={56} className="opacity-15" /></div>
                          <h3 className="text-base font-bold mb-2 text-gray-500">Vulnerability Analysis</h3>
                          <p className="text-sm max-w-[220px] leading-relaxed">Select a risk to see Bob's precision fix and OWASP reasoning.</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Codebase ── */}
            {activeTab === 'codebase' && (
              <motion.div key="codebase" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
                <CodebaseView />
              </motion.div>
            )}

            {/* ── Notifications ── */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <Notifications findings={findings} summary={overviewStats} loading={isLoading} error={loadError} source={scanSource} />
              </motion.div>
            )}

            {/* ── Reports ── */}
            {activeTab === 'reports' && (
              <motion.div key="reports" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <Reports findings={findings} summary={overviewStats} loading={isLoading} error={loadError} source={scanSource} />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
