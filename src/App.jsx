import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SignUp from './components/SignUp'
import SignIn from './components/SignIn'
import Connect from './components/Connect'
import Scanner from './components/Scanner'
import Dashboard from './components/Dashboard'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -16 },
}

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');

  const handleAuthSuccess = () => navigate('/connect');

  const handleConnect = (url) => {
    setRepoUrl(url);
    navigate('/scanning');
  };

  const handleScanComplete = () => navigate('/dashboard');

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
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.45 }}>
            <Connect onConnect={handleConnect} />
          </motion.div>
        } />

        <Route path="/scanning" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Scanner repoUrl={repoUrl} onComplete={handleScanComplete} />
          </motion.div>
        } />

        <Route path="/dashboard" element={
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
            <Dashboard repoUrl={repoUrl} />
          </motion.div>
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