import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  LayoutGrid, Database, Terminal, Settings, ChevronRight, 
  Activity, FolderOpen, Globe, Plus, FolderPlus, FilePlus, Save 
} from 'lucide-react';

export const Sidebar = ({ onManageEnv }: { onManageEnv: () => void }) => {
  const { 
    schemas, 
    activeTabId,
    openSchema, 
    loadSchemas, 
    dirPath, 
    selectDirectory,
    activeEnvironmentId,
    setActiveEnvironmentId,
    environments,
    collections,
    openRequest,
    createCollection,
    addRequestToCollection,
    saveCurrentRequest
  } = useStore();

  const [showColInput, setShowColInput] = useState(false);
  const [newColName, setNewColName] = useState('');

  useEffect(() => {
    loadSchemas();
  }, []);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    await createCollection(newColName);
    setNewColName('');
    setShowColInput(false);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="flex-row gap-4" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div className="flex-row gap-4">
            <div className="btn-primary" style={{ padding: '0.6rem' }}>
              <Terminal size={18} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>Flatman</h1>
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Pro Studio</span>
            </div>
          </div>
          <div className="flex-row gap-2">
            <button 
              onClick={() => saveCurrentRequest()}
              className="text-dim hover:text-primary transition-colors p-1"
              title="Save Request"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Save size={16} />
            </button>
            <button 
              onClick={() => selectDirectory()}
              className="text-dim hover:text-on-surface transition-colors p-1" 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              title="Open Directory"
            >
              <FolderOpen size={18} />
            </button>
          </div>
        </div>

        <div className="flex-row gap-2" style={{ 
          background: 'rgba(255,255,255,0.03)', 
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div className="flex-row gap-3 flex-1" style={{ paddingLeft: '12px' }}>
            <Globe size={14} className="text-secondary" />
            <select 
              value={activeEnvironmentId || ''} 
              onChange={(e) => setActiveEnvironmentId(e.target.value)}
              style={{
                background: 'none', border: 'none', color: 'var(--on-surface)',
                fontSize: '11px', fontWeight: 800, outline: 'none', cursor: 'pointer',
                flex: 1, padding: '4px 0'
              }}
            >
              {environments.map(env => (
                <option key={env.id} value={env.id} style={{ background: 'var(--bg-deep)' }}>{env.name}</option>
              ))}
              {environments.length === 0 && <option value="">No environments</option>}
            </select>
          </div>
          <button 
            onClick={onManageEnv}
            className="hover:bg-white/5 rounded-lg transition-colors p-2 text-dim"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            title="Manage Environments"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      <nav className="sidebar-nav terminal-scroll">
        {/* Render Collections */}
        <div className="flex-row" style={{ padding: '1.5rem 1.5rem 0.5rem', justifyContent: 'space-between' }}>
          <label className="text-xs uppercase tracking-widest text-dim" style={{ opacity: 0.5, fontWeight: 900 }}>Collections</label>
          <button 
            onClick={() => setShowColInput(!showColInput)}
            className="flex-row gap-2 text-[10px] font-black uppercase text-primary hover:text-on-surface transition-colors mt-1"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={12} /> New Collection
          </button>
        </div>

        {showColInput && (
          <form onSubmit={handleCreateCollection} style={{ padding: '0.5rem 1.5rem' }}>
            <input 
              autoFocus
              className="url-input"
              style={{ fontSize: '11px', padding: '6px' }}
              placeholder="Collection name..."
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onBlur={() => !newColName && setShowColInput(false)}
            />
          </form>
        )}

        {collections.map(col => (
          <div key={col.name}>
            <div className="flex-row" style={{ padding: '0.5rem 1.5rem', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', opacity: 0.7 }}>
                  {col.name}
                </span>
                <button 
                    onClick={() => addRequestToCollection(col.name)}
                    className="text-dim hover:text-on-surface p-1"
                    title="Add Request"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <FilePlus size={12} />
                </button>
            </div>
            {col.requests.map(req => {
              const tabId = `req-${col.name}-${req.id}`;
              const isActive = activeTabId === tabId;
              
              return (
                <div 
                  key={req.id}
                  onClick={() => openRequest(req, col.name)}
                  className={`sidebar-item ${isActive ? 'active-item' : ''}`}
                  style={{ paddingLeft: '2rem' }}
                >
                  <div className="flex-row gap-4">
                    <span style={{ 
                        fontSize: '9px', 
                        fontWeight: 900, 
                        color: req.method === 'GET' ? '#4ade80' : req.method === 'POST' ? '#60a5fa' : '#fbbf24', 
                        opacity: 0.8,
                        width: '32px'
                    }}>{req.method}</span>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: isActive ? 'var(--on-surface)' : 'var(--text-dim)' }}>{req.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '1rem 1.5rem' }} />

        <div className="flex-row" style={{ padding: '1rem 1.5rem 0.75rem', justifyContent: 'space-between' }}>
          <label className="text-xs uppercase tracking-widest text-dim" style={{ opacity: 0.5, fontWeight: 900 }}>Schemas (.fbs)</label>
          <div className="flex-row gap-2">
            <button 
              onClick={() => loadSchemas()}
              className="text-xs font-bold text-dim hover:text-on-surface" 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Refresh
            </button>
          </div>
        </div>

        {schemas.length === 0 ? (
          <div style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', color: 'var(--text-dim)', opacity: 0.5 }}>No .fbs files found.</p>
          </div>
        ) : (
          schemas.map((schema) => (
            <div 
              key={schema.path}
              onClick={() => openSchema(schema)}
              className={`sidebar-item ${activeTabId === schema.path ? 'active-item' : ''}`}
            >
              <div className="left-glow" />
              <div className="flex-row gap-4" style={{ width: '100%', justifyContent: 'space-between' }}>
                <div className="flex-row gap-4">
                  <div style={{ 
                    width: '6px', 
                    height: '4px', 
                    borderRadius: '2px', 
                    backgroundColor: activeTabId === schema.path ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: activeTabId === schema.path ? 'var(--on-surface)' : 'var(--text-dim)' }}>{schema.id}</span>
                </div>
                <Database size={10} style={{ opacity: 0.2 }} />
              </div>
            </div>
          ))
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="flex-row gap-4">
          <div style={{ width: '32px', height: '32px', borderRadius: '12px', background: 'var(--primary)', display: 'grid', placeItems: 'center', color: 'var(--bg-deep)' }}>
            <Database size={16} />
          </div>
          <div style={{ maxWidth: '160px', overflow: 'hidden' }}>
             <div style={{ fontSize: '11px', fontWeight: 800 }}>Project Source</div>
             <div className="text-xs text-dim" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
               {dirPath || 'No folder selected'}
             </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
