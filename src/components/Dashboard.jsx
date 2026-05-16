import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  FileCode,
  Terminal,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  GitPullRequest,
  Search,
  Filter,
  BarChart,
  Activity,
  Zap,
  Lock,
  Eye,
  Bell,
  Settings,
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

// ── Data ────────────────────────────────────────────────────────────────────

const VULNERABILITIES = [
  {
    id: 1,
    title: 'SQL Injection in user login',
    severity: 'Critical',
    category: 'A03:2021-Injection',
    file: 'src/auth/login.js',
    line: 45,
    description: 'The query concatenates user input directly into the SQL string, allowing for potential data extraction or bypass.',
    fix: 'Use parameterized queries with the database driver.',
    codeSnippet: "const query = `SELECT * FROM users WHERE email = '${email}'`;",
    fixSnippet: "const query = 'SELECT * FROM users WHERE email = ?';\nconst results = await db.execute(query, [email]);",
    reasoning: "By using parameterized queries (also known as prepared statements), we separate the SQL code from the data. This ensures that the user-provided 'email' is always treated as data and never as executable code, directly addressing OWASP A03:2021-Injection."
  },
  {
    id: 2,
    title: 'Broken Access Control on profile update',
    severity: 'High',
    category: 'A01:2021-Broken Access Control',
    file: 'src/api/user.py',
    line: 112,
    description: 'The endpoint does not verify if the requesting user has permission to modify the target profile ID.',
    fix: 'Implement ownership validation middleware.',
    codeSnippet: "def update_profile(user_id, data):\n    db.update('users', data, id=user_id)",
    fixSnippet: "def update_profile(current_user, target_id, data):\n    if current_user.id != target_id and not current_user.is_admin:\n        raise Unauthorized()\n    db.update('users', data, id=target_id)",
    reasoning: "This fix implements a mandatory access control check satisfying OWASP A01:2021, preventing insecure direct object references (IDOR)."
  },
  {
    id: 3,
    title: 'Sensitive Data Exposure in logs',
    severity: 'Medium',
    category: 'A02:2021-Cryptographic Failures',
    file: 'src/config/logger.ts',
    line: 22,
    description: 'Application secrets and API keys are being logged in plain text during initialization.',
    fix: 'Use a sanitization helper to mask sensitive fields before logging.',
    codeSnippet: "logger.info('Connected with config: ' + JSON.stringify(config));",
    fixSnippet: "logger.info('Connected with config: ' + maskSecrets(config));",
    reasoning: "Masking secrets before logging complies with OWASP A02:2021, ensuring PII and credentials remain confidential."
  },
  {
    id: 4,
    title: 'Outdated vulnerable dependency',
    severity: 'Low',
    category: 'A06:2021-Vulnerable and Outdated Components',
    file: 'package.json',
    line: 14,
    description: 'The version of "axios" being used has a known SSRF vulnerability.',
    fix: 'Update axios to version 1.6.0 or higher.',
    codeSnippet: '"axios": "0.21.1"',
    fixSnippet: '"axios": "^1.6.0"',
    reasoning: "Updating axios patches a critical SSRF flaw, satisfying OWASP A06:2021."
  }
]

const THREAT_FEED = [
  { id: 1, msg: 'New CVE-2024-3094 detected in xz-utils dependency', severity: 'Critical', time: '2m ago' },
  { id: 2, msg: 'OWASP Top 10 2025 draft published — 3 new categories', severity: 'Info', time: '1h ago' },
  { id: 3, msg: 'GitHub Secret Scanning blocked 2 commits', severity: 'High', time: '3h ago' },
  { id: 4, msg: 'Dependency audit complete — 4 issues found', severity: 'Medium', time: '5h ago' },
]

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

const ThreatFeedTicker = () => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % THREAT_FEED.length), 4000)
    return () => clearInterval(t)
  }, [])

  const item = THREAT_FEED[index]

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

const Dashboard = ({ repoUrl }) => {
  const [selectedVuln, setSelectedVuln] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1200)
  }

  const repoName = repoUrl?.split('/').slice(-2).join('/') || 'Unknown Repo'

  const filteredVulns = VULNERABILITIES.filter(v =>
    !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const navItems = [
    { id: 'overview', icon: <LayoutDashboard size={17} />, label: 'Overview' },
    { id: 'vulnerabilities', icon: <ShieldAlert size={17} />, label: 'Vulnerabilities', badge: VULNERABILITIES.filter(v => v.severity === 'Critical').length },
    { id: 'notifications', icon: <Bell size={17} />, label: 'Notifications', badge: 4 },
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
                { label: 'Files Indexed', value: '1,284' },
                { label: 'Functions Mapped', value: '9,471' },
                { label: 'OWASP Coverage', value: '94%' },
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
            <ThreatFeedTicker />
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
              className="p-2 rounded-xl bg-white/5 border border-white/8 text-gray-400 hover:text-blue-400 hover:border-blue-500/30 transition-all"
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
          <AnimatePresence mode="wait">

            {/* ── Overview ── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                {/* Stat Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                  <StatCard label="Total Risks" value="12" icon={<ShieldAlert size={20} className="text-red-400" />} color="red" trend="+2" subtext="vs last scan" />
                  <StatCard label="OWASP Categories" value="6" icon={<BarChart size={20} className="text-blue-400" />} color="blue" />
                  <StatCard label="Ready to Fix" value="8" icon={<CheckCircle size={20} className="text-green-400" />} color="green" trend="67%" />
                  <StatCard label="Critical Issues" value="2" icon={<AlertTriangle size={20} className="text-orange-400" />} color="orange" subtext="Immediate action" />
                </div>

                {/* Split View */}
                <div className="flex gap-6">
                  {/* Vuln List */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold">Identified Vulnerabilities</h3>
                      <span className="text-xs text-gray-500">{filteredVulns.length} found</span>
                    </div>
                    {filteredVulns.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-dashed border-green-500/30 bg-green-500/5 mt-4"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="mb-6 p-4 rounded-full bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                        >
                          <ShieldCheck size={48} className="text-green-400" />
                        </motion.div>
                        <h3 className="text-xl font-bold mb-2 text-green-400">No vulnerabilities detected!</h3>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-[280px]">
                          Your repository is secure. We couldn't find any critical or high-severity issues. Keep up the great work!
                        </p>
                      </motion.div>
                    ) : (
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
                            onClick={() => setSelectedVuln(vuln)}
                            className={`p-5 rounded-2xl border cursor-pointer group transition-all ${selectedVuln?.id === vuln.id
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
                            <div className="flex items-center gap-5 text-xs text-gray-600 font-mono">
                              <span className="flex items-center gap-1.5"><Terminal size={12} /> {vuln.file}:{vuln.line}</span>
                              <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> {vuln.category}</span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
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
                    <Vulnerabilities vulnerabilities={filteredVulns} onSelect={setSelectedVuln} selectedId={selectedVuln?.id} />
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
                <Notifications />
              </motion.div>
            )}

            {/* ── Reports ── */}
            {activeTab === 'reports' && (
              <motion.div key="reports" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <Reports />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
