import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, BellOff, CheckCircle, AlertTriangle,
  ShieldAlert, Info, Clock, Filter, X, ChevronDown,
  Shield, Database, Bug, ServerCrash, RefreshCw
} from 'lucide-react'

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
  Medium: {
    border: 'border-l-yellow-500',
    bg: 'bg-yellow-500/[0.03]',
    hoverBg: 'hover:bg-yellow-500/[0.06]',
    badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
    icon: 'text-yellow-300',
    glow: 'shadow-yellow-500/5',
    dot: 'bg-yellow-500',
  },
  Low: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/[0.03]',
    hoverBg: 'hover:bg-blue-500/[0.06]',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    icon: 'text-blue-400',
    glow: 'shadow-blue-500/5',
    dot: 'bg-blue-500',
  },
  Info: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/[0.03]',
    hoverBg: 'hover:bg-blue-500/[0.06]',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    icon: 'text-blue-400',
    glow: 'shadow-blue-500/5',
    dot: 'bg-blue-500',
  },
}

const PRIORITY_ORDER = ['Critical', 'High', 'Medium', 'Low', 'Info']

const iconForPriority = (priority) => {
  switch (priority) {
    case 'Critical':
      return <ShieldAlert size={18} />
    case 'High':
      return <Shield size={18} />
    case 'Medium':
      return <AlertTriangle size={18} />
    case 'Low':
      return <Database size={18} />
    default:
      return <Info size={18} />
  }
}

const buildNotificationsFromFindings = (findings = []) => {
  return findings.map((finding, index) => {
    const priority = finding.severity || 'Info'
    const fileLabel = finding.file ? `${finding.file}${finding.line !== null && finding.line !== undefined ? `:${finding.line}` : ''}` : null

    return {
      id: finding.id || `${finding.ruleId || finding.title || 'finding'}-${index}`,
      title: finding.title,
      description: finding.description || finding.suggestion || 'No description returned by the backend scan.',
      priority,
      category: finding.category || 'Uncategorized',
      owasp: finding.ruleId || finding.category || null,
      file: fileLabel,
      timestamp: finding.ruleId ? `Rule ${finding.ruleId}` : 'Current scan',
      read: false,
      icon: iconForPriority(priority),
    }
  })
}

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

const Notifications = ({ findings = [], summary = {}, loading = false, error = '', source = '' }) => {
  const [notifications, setNotifications] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const colorMap = {
    red: { dot: 'bg-red-500', text: 'text-red-400' },
    orange: { dot: 'bg-orange-500', text: 'text-orange-400' },
    yellow: { dot: 'bg-yellow-400', text: 'text-yellow-300' },
    blue: { dot: 'bg-blue-500', text: 'text-blue-400' },
  }

  useEffect(() => {
    setNotifications(buildNotificationsFromFindings(findings))
  }, [findings])

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
  const criticalCount = Number(summary.critical ?? notifications.filter(n => n.priority === 'Critical' && !n.read).length) || 0

  // Priority counts for summary
  const counts = {
    Critical: Number(summary.critical ?? notifications.filter(n => n.priority === 'Critical').length) || 0,
    High: Number(summary.high ?? notifications.filter(n => n.priority === 'High').length) || 0,
    Medium: Number(summary.medium ?? notifications.filter(n => n.priority === 'Medium').length) || 0,
    Low: Number(summary.low ?? notifications.filter(n => n.priority === 'Low').length) || 0,
    Info: Number(summary.info ?? notifications.filter(n => n.priority === 'Info').length) || 0,
  }

  const categories = ['All', ...new Set(notifications.map(n => n.category).filter(Boolean))]

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Notifications & Alerts
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Loading current scan alerts…' : error && !notifications.length ? error : `${unreadCount} unread · ${criticalCount} critical requiring attention`}
          </p>
        </div>
        <motion.button
          onClick={markAllRead}
          disabled={!notifications.length}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="text-xs font-bold text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:bg-white/[0.03] disabled:border-white/[0.06] bg-blue-500/10 hover:bg-blue-500/15 px-4 py-2.5 rounded-xl border border-blue-500/20 transition-all"
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
          { label: 'Medium', count: counts.Medium, color: 'yellow' },
          { label: 'Info', count: counts.Info, color: 'blue' },
        ].map(item => (
          (() => {
            const palette = colorMap[item.color] || colorMap.blue
            return (
          <div
            key={item.label}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.025] border border-white/[0.06]`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${palette.dot}`} />
            <span className="text-xs text-gray-400 font-semibold">{item.label}</span>
            <span className={`text-sm font-black ${palette.text}`}>{item.count}</span>
          </div>
            )
          })()
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
                {categories.map(cat => (
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
        {loading && !notifications.length ? (
          <div className="space-y-3">
            {[0, 1, 2].map(index => (
              <div key={index} className="p-5 rounded-2xl border border-white/[0.05] bg-white/[0.02] animate-pulse">
                <div className="h-4 w-1/3 rounded bg-white/10 mb-3" />
                <div className="h-3 w-2/3 rounded bg-white/10 mb-2" />
                <div className="h-3 w-1/2 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : error && !notifications.length ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-100">
            <AlertTriangle size={32} className="mx-auto mb-3 text-red-300" />
            <h3 className="text-base font-bold mb-2">Unable to load alerts</h3>
            <p className="text-sm text-red-100/70">{error || 'The backend did not return notification data for this scan.'}</p>
          </div>
        ) : filtered.length > 0 ? (
          <AnimatePresence>
            {filtered.map(n => (
              <NotificationCard
                key={n.id}
                notification={n}
                onToggleRead={toggleRead}
                onDismiss={dismiss}
              />
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.02]"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
              <Bell size={28} className="text-gray-700" />
            </div>
            <h3 className="text-base font-bold text-gray-300 mb-1.5">No alerts for this scan</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              {source ? 'The backend scan did not return any alerts. Try a different repository or local folder.' : 'Connect a repository or run a local scan to populate alerts.'}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default Notifications
