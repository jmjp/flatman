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
      <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
        <div className="flex-row gap-4" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div className="flex-row gap-3">
            <div style={{ background: 'var(--primary)', color: '#fff', padding: '0.4rem', borderRadius: '4px' }}>
              <Terminal size={16} />
            </div>
            <div>
              <h1 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)' }}>Flatman</h1>
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
              <FolderOpen size={16} />
            </button>
          </div>
        </div>

        <div className="flex-row gap-2" style={{ 
          background: 'var(--bg-surface-lowest)',
          padding: '4px',
          borderRadius: '4px',
          border: '1px solid var(--border)'
        }}>
          <div className="flex-row gap-2 flex-1" style={{ paddingLeft: '8px' }}>
            <Globe size={12} className="text-dim" />
            <select 
              value={activeEnvironmentId || ''} 
              onChange={(e) => setActiveEnvironmentId(e.target.value)}
              style={{
                background: 'none', border: 'none', color: 'var(--on-surface)',
                fontSize: '0.75rem', fontWeight: 500, outline: 'none', cursor: 'pointer',
                flex: 1, padding: '4px 0'
              }}
            >
              {environments.map(env => (
                <option key={env.id} value={env.id} style={{ background: 'var(--bg-surface-lowest)' }}>{env.name}</option>
              ))}
              {environments.length === 0 && <option value="">No environments</option>}
            </select>
          </div>
          <button 
            onClick={onManageEnv}
            className="hover:bg-surface rounded transition-colors p-1 text-dim"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            title="Manage Environments"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      <nav className="sidebar-nav terminal-scroll" style={{ padding: '0 1rem' }}>
        {/* Render Collections */}
        <div className="flex-row" style={{ padding: '0.5rem', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)' }}>Collections</label>
          <button 
            onClick={() => setShowColInput(!showColInput)}
            className="flex-row gap-1 text-dim hover:text-on-surface transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}
          >
            <Plus size={14} />
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
            <div className="flex-row" style={{ padding: '0.25rem 0.5rem', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--on-surface)', fontWeight: 600 }}>
                  {col.name}
                </span>
                <button 
                    onClick={() => addRequestToCollection(col.name)}
                    className="text-dim hover:text-on-surface p-1"
                    title="Add Request"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <FilePlus size={14} />
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
                  style={{ padding: '0.25rem 0.5rem', paddingLeft: '1.5rem', borderRadius: '4px', margin: '2px 0', background: isActive ? 'var(--bg-surface)' : 'transparent' }}
                >
                  <div className="flex-row gap-3">
                    <span style={{ 
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: req.method === 'GET' ? '#22c55e' : req.method === 'POST' ? '#f59e0b' : '#3b82f6',
                        width: '36px'
                    }}>{req.method}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 400, color: isActive ? 'var(--on-surface)' : 'var(--text-dim)' }}>{req.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />

        <div className="flex-row" style={{ padding: '0.5rem', justifyContent: 'space-between' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)' }}>Schemas (.fbs)</label>
          <div className="flex-row gap-2">
            <button 
              onClick={() => loadSchemas()}
              className="text-xs font-medium text-dim hover:text-on-surface"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Refresh
            </button>
          </div>
        </div>

        {schemas.length === 0 ? (
          <div style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>No .fbs files found.</p>
          </div>
        ) : (
          schemas.map((schema) => (
            <div 
              key={schema.path}
              onClick={() => openSchema(schema)}
              className={`sidebar-item ${activeTabId === schema.path ? 'active-item' : ''}`}
              style={{ padding: '0.4rem 0.5rem', borderRadius: '4px', margin: '2px 0', background: activeTabId === schema.path ? 'var(--bg-surface)' : 'transparent' }}
            >
              <div className="flex-row gap-3" style={{ width: '100%', justifyContent: 'space-between' }}>
                <div className="flex-row gap-2">
                  <Database size={14} className="text-dim" />
                  <span style={{ fontSize: '0.8rem', color: activeTabId === schema.path ? 'var(--on-surface)' : 'var(--text-dim)' }}>{schema.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', padding: '1rem', background: 'var(--bg-surface-low)' }}>
        <div className="flex-row gap-3">
          <Database size={16} className="text-dim" />
          <div style={{ maxWidth: '160px', overflow: 'hidden' }}>
             <div className="text-xs text-dim" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={dirPath}>
               {dirPath || 'No workspace selected'}
             </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
