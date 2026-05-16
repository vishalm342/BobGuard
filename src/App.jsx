import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import SignUp from './components/SignUp'
import SignIn from './components/SignIn'
import Connect from './components/Connect'
import Scanner from './components/Scanner'
import Dashboard from './components/Dashboard'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

// 4. Error State Component
const ErrorState = ({ onRetry }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white p-4"
  >
    <div className="max-w-md w-full p-8 rounded-3xl border border-red-500/20 bg-red-500/5 text-center flex flex-col items-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="p-4 rounded-full bg-red-500/10 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
      >
        <AlertTriangle size={48} className="text-red-500" />
      </motion.div>
      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Scan Failed</h3>
      <p className="text-gray-400 text-sm mb-8 leading-relaxed">
        We encountered an error while analyzing the repository. The connection to the MCP server might have timed out or the repository is inaccessible.
      </p>
      <button
        onClick={onRetry}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
      >
        Try Again
      </button>
    </div>
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');

  // 1. Auth State Management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    navigate('/connect');
  };

  const handleConnect = (url) => {
    setRepoUrl(url);
    setHasError(false);
    navigate('/scanning');

    // Simulate a scan process. 10% chance to simulate an error for demonstration.
    setTimeout(() => {
      if (Math.random() > 0.9) {
        setHasError(true);
      } else {
        navigate('/dashboard');
      }
    }, 4500);
  };

  const handleRetry = () => {
    setHasError(false);
    navigate('/connect');
  }

  // Protect routes component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      // Elegant redirection for unauthorized access
      return <Navigate to="/signin" replace />;
    }
    return children;
  };

  if (hasError) {
    return <ErrorState onRetry={handleRetry} />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.45 }}>
            <SignUp onSignUp={handleAuthSuccess} />
          </motion.div>
        } />

        <Route path="/signin" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.45 }}>
            <SignIn onSignIn={handleAuthSuccess} />
          </motion.div>
        } />

        <Route path="/signup" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.45 }}>
            <SignUp onSignUp={handleAuthSuccess} />
          </motion.div>
        } />

        <Route path="/connect" element={
          <ProtectedRoute>
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.45 }}>
              <Connect onConnect={handleConnect} />
            </motion.div>
          </ProtectedRoute>
        } />

        {/* 2. Loading State: Scanner component provides the highly visual analyzing transition */}
        <Route path="/scanning" element={
          <ProtectedRoute>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <Scanner repoUrl={repoUrl} />
            </motion.div>
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
              <Dashboard repoUrl={repoUrl} />
            </motion.div>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-[#0B0E14] text-white selection:bg-blue-500/30">
      <Router>
        <AnimatedRoutes />
      </Router>
    </div>
  )
}

export default App