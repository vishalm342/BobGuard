import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Terminal, ShieldCheck, AlertTriangle } from 'lucide-react'

const SeverityBadge = ({ severity }) => {
  const colors = {
    'Critical': 'bg-red-500 text-white',
    'High': 'bg-orange-500 text-white',
    'Medium': 'bg-yellow-500 text-black',
    'Low': 'bg-blue-500 text-white'
  }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${colors[severity] || 'bg-gray-500'}`}>
      {severity}
    </span>
  )
}

const Vulnerabilities = ({ vulnerabilities, onSelect, selectedId }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-white">Identified Vulnerabilities</h2>
          <p className="text-gray-500 text-sm">Prioritized security risks detected by Bob's MCP scan.</p>
        </div>
        <div className="flex gap-2">
          {['Critical', 'High', 'Medium', 'Low'].map(sev => (
            <div key={sev} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
               <div className={`w-1.5 h-1.5 rounded-full ${
                 sev === 'Critical' ? 'bg-red-500' : 
                 sev === 'High' ? 'bg-orange-500' : 
                 sev === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
               }`} />
               {sev}
            </div>
          ))}
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4"
      >
        {vulnerabilities.map((vuln) => (
          <motion.div 
            key={vuln.id}
            variants={itemVariants}
            onClick={() => onSelect(vuln)}
            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
            className={`p-6 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between ${
              selectedId === vuln.id 
              ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.1)]' 
              : 'bg-white/2 border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <SeverityBadge severity={vuln.severity} />
                <h4 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                  {vuln.title}
                </h4>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 font-mono">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-blue-500/60" />
                  <span>{vuln.file} <span className="text-gray-700">:</span> {vuln.line}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-cyan-500/60" />
                  <span>{vuln.category}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 italic">
                  {vuln.description.substring(0, 60)}...
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               {vuln.severity === 'Critical' && (
                 <motion.div
                   animate={{ opacity: [0.4, 1, 0.4] }}
                   transition={{ duration: 2, repeat: Infinity }}
                 >
                   <AlertTriangle size={18} className="text-red-500" />
                 </motion.div>
               )}
               <ChevronRight 
                 size={20} 
                 className={`text-gray-600 group-hover:text-blue-400 transition-all ${
                   selectedId === vuln.id ? 'rotate-90 translate-x-1' : ''
                 }`} 
               />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default Vulnerabilities
