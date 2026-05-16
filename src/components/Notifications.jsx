import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, BellOff, CheckCircle, AlertTriangle,
  ShieldAlert, Info, Clock, Filter, X, ChevronDown,
  Shield, Database, Bug, ServerCrash, RefreshCw
} from 'lucide-react'

// ── Notification Data ────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'SQL Injection Detected in Authentication Module',
    description: 'A critical SQL injection vulnerability was found in src/auth/login.js at line 45. User input is directly concatenated into the SQL query string, allowing potential data extraction or authentication bypass.',
    priority: 'Critical',
    category: 'SQL Injection',
    owasp: 'A03:2021-Injection',
    file: 'src/auth/login.js:45',
    timestamp: '2 minutes ago',
    read: false,
    icon: <ShieldAlert size={18} />,
  },
  {
    id: 2,
    title: 'Broken Access Control on Profile Update Endpoint',
    description: 'The /api/user/profile endpoint does not verify if the requesting user has permission to modify the target profile ID. Any authenticated user can modify other users\' profiles.',
    priority: 'High',
    category: 'Broken Access Control',
    owasp: 'A01:2021-Broken Access Control',
    file: 'src/api/user.py:112',
    timestamp: '18 minutes ago',
    read: false,
    icon: <Shield size={18} />,
  },
  {
    id: 3,
    title: 'Privilege Escalation via Role Parameter Tampering',
    description: 'The user registration API accepts a "role" field in the request body without validation. An attacker can set their role to "admin" during sign-up.',
    priority: 'Critical',
    category: 'Broken Access Control',
    owasp: 'A01:2021-Broken Access Control',
    file: 'src/api/register.js:28',
    timestamp: '34 minutes ago',
    read: false,
    icon: <ShieldAlert size={18} />,
  },
  {
    id: 4,
    title: 'System Scan Completed Successfully',
    description: 'Full codebase security scan finished. 1,284 files analyzed across 47 directories. 4 vulnerabilities detected, 2 critical, 1 high, 1 medium.',
    priority: 'System',
    category: 'System Updates',
    owasp: null,
    file: null,
    timestamp: '1 hour ago',
    read: true,
    icon: <CheckCircle size={18} />,
  },
  {
    id: 5,
    title: 'Sensitive Data Exposure in Application Logs',
    description: 'Application secrets and API keys are being logged in plain text during initialization in the logger configuration module.',
    priority: 'High',
    category: 'Cryptographic Failures',
    owasp: 'A02:2021-Cryptographic Failures',
    file: 'src/config/logger.ts:22',
    timestamp: '2 hours ago',
    read: false,
    icon: <Database size={18} />,
  },
  {
    id: 6,
    title: 'Outdated Dependency with Known SSRF Vulnerability',
    description: 'The version of "axios" (0.21.1) being used has a known SSRF vulnerability (CVE-2023-45857). Update to version 1.6.0 or higher.',
    priority: 'High',
    category: 'Vulnerable Components',
    owasp: 'A06:2021-Vulnerable Components',
    file: 'package.json:14',
    timestamp: '3 hours ago',
    read: true,
    icon: <Bug size={18} />,
  },
  {
    id: 7,
    title: 'OWASP Top 10 2025 Draft Published',
    description: 'The OWASP Foundation has released a new draft of the Top 10 for 2025 with 3 updated categories. Bob has been updated to reflect these changes.',
    priority: 'System',
    category: 'System Updates',
    owasp: null,
    file: null,
    timestamp: '5 hours ago',
    read: true,
    icon: <Info size={18} />,
  },
  {
    id: 8,
    title: 'Server-Side Request Forgery in Webhook Handler',
    description: 'The webhook processing endpoint accepts arbitrary URLs without validation, enabling SSRF attacks against internal services.',
    priority: 'Critical',
    category: 'SQL Injection',
    owasp: 'A10:2021-SSRF',
    file: 'src/webhooks/handler.ts:67',
    timestamp: '6 hours ago',
    read: false,
    icon: <ServerCrash size={18} />,
  },
  {
    id: 9,
    title: 'MCP Connection Re-established',
    description: 'The Model Context Protocol connection to GitHub was temporarily interrupted and has been automatically re-established. No data loss occurred.',
    priority: 'System',
    category: 'System Updates',
    owasp: null,
    file: null,
    timestamp: '8 hours ago',
    read: true,
    icon: <RefreshCw size={18} />,
  },
]

// ── Priority Config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  Critical: {
    border: 'border-l-red-500',
    bg: 'bg-red-500/[0.04]',
    hoverBg: 'hover:bg-red-500/[0.07]',
    badge: 'bg-red-500/15 text-red-400 border-red-500/25',
    icon: 'text-red-400',
    glow: 'shadow-red-500/5',
    dot: 'bg-red-500',
  },
  High: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-500/[0.03]',
    hoverBg: 'hover:bg-orange-500/[0.06]',
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    icon: 'text-orange-400',
    glow: 'shadow-orange-500/5',
    dot: 'bg-orange-500',
  },
  System: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/[0.03]',
    hoverBg: 'hover:bg-blue-500/[0.06]',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    icon: 'text-blue-400',
    glow: 'shadow-blue-500/5',
    dot: 'bg-blue-500',
  },
}

// ── Category options for filter ──────────────────────────────────────────────

const CATEGORIES = [
  'All',
  'SQL Injection',
  'Broken Access Control',
  'Cryptographic Failures',
  'Vulnerable Components',
  'System Updates',
]

// ── Sub-components ───────────────────────────────────────────────────────────

const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.System
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border ${cfg.badge}`}>
      {priority}
    </span>
  )
}

const ReadToggle = ({ isRead, onToggle }) => (
  <motion.button
    onClick={(e) => { e.stopPropagation(); onToggle() }}
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.9 }}
    className={`p-1.5 rounded-lg transition-all ${
      isRead
        ? 'text-gray-600 hover:text-gray-400 hover:bg-white/5'
        : 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
    }`}
    title={isRead ? 'Mark as unread' : 'Mark as read'}
  >
    {isRead ? <BellOff size={15} /> : <Bell size={15} />}
  </motion.button>
)

// ── Notification Card ────────────────────────────────────────────────────────

const NotificationCard = ({ notification, onToggleRead, onDismiss }) => {
  const [expanded, setExpanded] = useState(false)
  const cfg = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.System

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
      whileHover={{ scale: 1.005, x: 2 }}
      onClick={() => setExpanded(e => !e)}
      className={`
        relative rounded-2xl border-l-[3px] border border-white/[0.05]
        ${cfg.border} ${notification.read ? 'bg-white/[0.015]' : cfg.bg}
        ${cfg.hoverBg} cursor-pointer transition-all duration-200
        hover:shadow-lg ${cfg.glow} hover:border-white/[0.08]
        ${notification.read ? 'opacity-70' : 'opacity-100'}
      `}
    >
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            {/* Icon */}
            <div className={`mt-0.5 ${cfg.icon} shrink-0`}>
              {notification.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <PriorityBadge priority={notification.priority} />
                {!notification.read && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-2 h-2 rounded-full ${cfg.dot} shadow-[0_0_6px_currentColor]`}
                  />
                )}
              </div>
              <h4 className={`text-sm font-bold leading-snug ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                {notification.title}
              </h4>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <ReadToggle isRead={notification.read} onToggle={() => onToggleRead(notification.id)} />
            <motion.button
              onClick={(e) => { e.stopPropagation(); onDismiss(notification.id) }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Dismiss"
            >
              <X size={14} />
            </motion.button>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 ml-[30px] flex-wrap">
          <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
            <Clock size={11} />
            {notification.timestamp}
          </span>
          {notification.owasp && (
            <span className="text-[10px] font-mono text-gray-600 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.05]">
              {notification.owasp}
            </span>
          )}
          {notification.file && (
            <span className="text-[10px] font-mono text-gray-600">
              {notification.file}
            </span>
          )}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            className="ml-auto text-gray-600"
          >
            <ChevronDown size={14} />
          </motion.div>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 ml-[30px] pt-4 border-t border-white/[0.05]">
                <p className="text-sm text-gray-400 leading-relaxed mb-3">
                  {notification.description}
                </p>
                {notification.category !== 'System Updates' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 px-4 py-2 rounded-lg border border-blue-500/20 transition-all"
                  >
                    View Details & Fix →
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Main Notifications Component ─────────────────────────────────────────────

const Notifications = () => {
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  const toggleRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: !n.read } : n)
    )
  }

  const dismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      const matchesSearch = !searchQuery ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.owasp && n.owasp.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesFilter = activeFilter === 'All' || n.category === activeFilter
      return matchesSearch && matchesFilter
    })
  }, [notifications, searchQuery, activeFilter])

  const unreadCount = notifications.filter(n => !n.read).length
  const criticalCount = notifications.filter(n => n.priority === 'Critical' && !n.read).length

  // Priority counts for summary
  const counts = {
    Critical: notifications.filter(n => n.priority === 'Critical').length,
    High: notifications.filter(n => n.priority === 'High').length,
    System: notifications.filter(n => n.priority === 'System').length,
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Notifications & Alerts
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount} unread · {criticalCount} critical requiring attention
          </p>
        </div>
        <motion.button
          onClick={markAllRead}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 px-4 py-2.5 rounded-xl border border-blue-500/20 transition-all"
        >
          <span className="flex items-center gap-2">
            <CheckCircle size={13} />
            Mark All Read
          </span>
        </motion.button>
      </div>

      {/* ── Summary Pills ── */}
      <div className="flex items-center gap-3">
        {[
          { label: 'Critical', count: counts.Critical, color: 'red' },
          { label: 'High', count: counts.High, color: 'orange' },
          { label: 'System', count: counts.System, color: 'blue' },
        ].map(item => (
          <div
            key={item.label}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.025] border border-white/[0.06]`}
          >
            <div className={`w-2.5 h-2.5 rounded-full bg-${item.color}-500`} />
            <span className="text-xs text-gray-400 font-semibold">{item.label}</span>
            <span className={`text-sm font-black text-${item.color}-400`}>{item.count}</span>
          </div>
        ))}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.025] border border-white/[0.06] ml-auto">
          <span className="text-xs text-gray-400 font-semibold">Total</span>
          <span className="text-sm font-black text-white">{notifications.length}</span>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by vulnerability type, OWASP ID…"
            className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/[0.04] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all placeholder:text-gray-600 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <motion.button
            onClick={() => setShowFilterMenu(f => !f)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
              activeFilter !== 'All'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-white/[0.03] border-white/[0.07] text-gray-400 hover:text-white hover:border-white/[0.12]'
            }`}
          >
            <Filter size={14} />
            {activeFilter === 'All' ? 'Filter' : activeFilter}
            <ChevronDown size={13} className={`transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-[#12141c] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden backdrop-blur-xl"
              >
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveFilter(cat); setShowFilterMenu(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all ${
                      activeFilter === cat
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Notification List ── */}
      <motion.div layout className="space-y-3">
        <AnimatePresence>
          {filtered.length > 0 ? (
            filtered.map(n => (
              <NotificationCard
                key={n.id}
                notification={n}
                onToggleRead={toggleRead}
                onDismiss={dismiss}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
                <Bell size={28} className="text-gray-700" />
              </div>
              <h3 className="text-base font-bold text-gray-500 mb-1.5">No matching alerts</h3>
              <p className="text-sm text-gray-600 max-w-xs">
                Try adjusting your search query or filter to find what you're looking for.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Notifications
