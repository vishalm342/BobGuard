import React, { useState } from 'react'
import { Folder, File, FileJson, FileCode, ChevronDown, ChevronRight, Monitor, Cpu } from 'lucide-react'
import './CodebaseView.css'

const CodebaseView = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [expandedFolders, setExpandedFolders] = useState(['src'])

  const fileTree = [
    {
      name: 'src',
      type: 'folder',
      children: [
        { 
          name: 'auth', 
          type: 'folder', 
          children: [{ name: 'login.js', type: 'file', content: "import { db } from '../database';\n\nexport const login = async (email, password) => {\n  // VULNERABLE: Direct concatenation\n  const query = `SELECT * FROM users WHERE email = '${email}'`;\n  const user = await db.query(query);\n  \n  if (user && user.password === password) {\n    return { success: true, user };\n  }\n  return { success: false };\n};" }] 
        },
        { 
          name: 'api', 
          type: 'folder', 
          children: [{ name: 'user.py', type: 'file', content: "from flask import Blueprint, request\nfrom .db import database\n\nuser_bp = Blueprint('user', __name__)\n\n@user_bp.route('/update', methods=['POST'])\ndef update_profile():\n    data = request.json\n    user_id = data.get('id')\n    # VULNERABLE: No ownership check\n    database.update('users', data, id=user_id)\n    return {'status': 'success'}" }] 
        },
        { name: 'App.jsx', type: 'file', content: "import React from 'react';\nimport Dashboard from './components/Dashboard';\n\nfunction App() {\n  return <Dashboard />;\n}\n\nexport default App;" }
      ]
    },
    { name: 'package.json', type: 'file', content: "{\n  \"name\": \"frontend\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"axios\": \"0.21.1\"\n  }\n}" },
    { name: 'README.md', type: 'file', content: "# IBM Bob Security Dashboard\n\nThis project leverages MCP to perform deep codebase scanning." }
  ]

  const toggleFolder = (name) => {
    setExpandedFolders(prev => 
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    )
  }

  const renderTree = (items, path = '') => {
    return items.map(item => {
      const currentPath = `${path}/${item.name}`
      const isExpanded = expandedFolders.includes(item.name)

      if (item.type === 'folder') {
        return (
          <div key={currentPath}>
            <div 
              className="tree-item tree-folder" 
              onClick={() => toggleFolder(item.name)}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Folder size={16} className="text-blue-400" />
              {item.name}
            </div>
            {isExpanded && (
              <div className="pl-4">
                {renderTree(item.children, currentPath)}
              </div>
            )}
          </div>
        )
      }

      return (
        <div 
          key={currentPath}
          className={`tree-item ${selectedFile?.name === item.name ? 'active' : ''}`}
          onClick={() => setSelectedFile(item)}
        >
          {item.name.endsWith('.json') ? <FileJson size={16} /> : <FileCode size={16} />}
          {item.name}
        </div>
      )
    })
  }

  const highlightCode = (code) => {
    if (!code) return null
    return code.split('\n').map((line, i) => (
      <div key={i} className="code-line">
        <span className="line-number">{i + 1}</span>
        <span className="line-text" dangerouslySetInnerHTML={{ 
          __html: line
            .replace(/\b(const|let|var|function|export|import|from|async|await|if|return|def|class)\b/g, '<span class="syntax-keyword">$1</span>')
            .replace(/('.*?'|".*?"|`.*?`)/g, '<span class="syntax-string">$1</span>')
            .replace(/\b([a-zA-Z0-9_]+)(?=\()/g, '<span class="syntax-function">$1</span>')
            .replace(/(\/\/.*|#.*)/g, '<span class="syntax-comment">$1</span>')
        }} />
      </div>
    ))
  }

  return (
    <div className="codebase-view">
      <div className="file-explorer">
        <div className="explorer-header">Explorer</div>
        <div className="tree-container">
          {renderTree(fileTree)}
        </div>
      </div>

      <div className="code-editor-window">
        {selectedFile ? (
          <>
            <div className="editor-header">
              <FileCode size={14} />
              {selectedFile.name}
              <span className="ml-auto text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase tracking-tighter">
                Bob is Analyzing...
              </span>
            </div>
            <div className="editor-content custom-scrollbar">
              {highlightCode(selectedFile.content)}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Monitor size={64} />
            <p>Select a file to inspect the source code via MCP context</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CodebaseView
