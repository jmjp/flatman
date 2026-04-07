import React, { useState } from 'react';
import {
  Plus, Send, FolderOpen, ChevronRight, FileCode, Play, Terminal,
  Clock, CheckCircle2, AlertCircle, Wand2, X, PlusCircle, Globe, Settings, Database, Search, ArrowRight, Activity, Copy, Zap, Info, ChevronDown,
  Link,
  Link2Off
} from 'lucide-react';
import { useStore } from './store/useStore';
import { ExecuteBinaryRequest } from '../wailsjs/go/main/App';
import { Sidebar } from './components/Sidebar';
import { EnvironmentManager } from './components/EnvironmentManager';
import { HeadersEditor } from './components/HeadersEditor';

import { Dashboard } from './components/Dashboard';

function App() {
  const {
    activeTabId, setActiveTab, openTabs, closeTab,
    updateActiveTabData, loading, setLoading, generateTemplate,
    getInterpolatedText,
    environments, activeEnvironmentId,
    schemas,
    connectWS,
    sendWS,
    disconnectWS,
    clearWSLogs
  } = useStore();

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: string } | null>(null);
  const [showEnvManager, setShowEnvManager] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const [activeRequestTab, setActiveRequestTab] = useState<'payload' | 'headers' | 'settings'>('payload');
  const [suggestion, setSuggestion] = useState<{ show: boolean, filter: string, targetId: 'url' | 'payload' } | null>(null);

  const currentTab = openTabs.find(t => t.id === activeTabId) || null;
  
  const activeEnv = environments.find(e => e.id === activeEnvironmentId);
  const availableVars = activeEnv?.variables.filter(v => v.enabled) || [];
  const filteredVars = suggestion 
    ? availableVars.filter(v => v.key.toLowerCase().includes(suggestion.filter.toLowerCase()))
    : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: 'url' | 'payload') => {
    const value = e.target.value;
    const cursor = (e.target as any).selectionStart || 0;
    const textBefore = value.substring(0, cursor);
    
    updateActiveTabData({ [field]: value });

    const match = textBefore.match(/{{([^}]*)$/);
    if (match) {
      setSuggestion({ show: true, filter: match[1], targetId: field });
    } else {
      setSuggestion(null);
    }
  };

  const applyVariable = (key: string) => {
    if (!suggestion || !currentTab) return;
    const field = suggestion.targetId;
    const currentValue = field === 'url' ? currentTab.url : currentTab.payload;
    
    const regex = /{{[^}]*$/;
    const newValue = currentValue.replace(regex, `{{${key}}}`);
    
    updateActiveTabData({ [field]: newValue });
    setSuggestion(null);
  };

  const handleSend = async () => {
    if (!currentTab || !currentTab.schemaPath) return;
    
    setLoading(true);
    const start = Date.now();
    try {
      const url = getInterpolatedText(currentTab.url);
      const payload = getInterpolatedText(currentTab.payload);
      
      const interpolatedHeaders: Record<string, string> = {};
      if (currentTab.headers) {
        Object.entries(currentTab.headers).forEach(([k, v]) => {
          interpolatedHeaders[k] = getInterpolatedText(v);
        });
      }

      const maxRetries = currentTab.retryEnabled ? (currentTab.maxRetries || 3) : 0;
      const delayMs = currentTab.retryEnabled ? (currentTab.delayMs || 1000) : 0;

      // @ts-ignore
      const result = await ExecuteBinaryRequest(
        currentTab.schemaPath, 
        url, 
        currentTab.method, 
        payload,
        interpolatedHeaders,
        maxRetries,
        delayMs
      );
      
      updateActiveTabData({ 
        response: result,
        executionTime: Date.now() - start
      });
    } catch (e: any) {
      updateActiveTabData({ 
        response: `Error: ${e.message || e}`,
        executionTime: Date.now() - start
      });
    } finally {
      setLoading(false);
    }
  };

  const currentSchema = schemas.find(s => s.path === currentTab?.schemaPath);

  return (
    <div className="app-container flex h-screen w-screen overflow-hidden text-on-surface bg-surface-deep">
      {showEnvManager && <EnvironmentManager onClose={() => setShowEnvManager(false)} />}
      <Sidebar onManageEnv={() => setShowEnvManager(true)} />

      <main className="main-layout">
        {/* TABS BAR (TOP) */}
        <div style={{ display: 'flex', height: '48px', backgroundColor: 'var(--bg-surface-lowest)', borderBottom: '1px solid var(--border)', overflowX: 'auto', flexShrink: 0 }} className="terminal-scroll">
          {openTabs.map(tab => (
            <div
              key={tab.id}
              onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.pageX, y: e.pageY, id: tab.id }); }}
              style={{
                display: 'flex', alignItems: 'center', height: '100%',
                borderRight: '1px solid var(--border)',
                background: activeTabId === tab.id ? 'var(--bg-surface-low)' : 'transparent',
                boxShadow: activeTabId === tab.id ? 'inset 0 2px 0 var(--primary)' : 'none'
              }}
            >
              <button
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', height: '100%',
                  fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1rem',
                  border: 'none', cursor: 'pointer', background: 'none',
                  color: activeTabId === tab.id ? 'var(--on-surface)' : 'var(--text-dim)',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: activeTabId === tab.id ? 'var(--primary)' : 'var(--bg-surface-highest)' }} />
                {tab.name}
                <span className="text-secondary" style={{ fontSize: '8px', opacity: 0.5 }}>{tab.type === 'SCHEMA' ? 'FBS' : 'REQ'}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                style={{ background: 'none', border: 'none', padding: '0 12px 0 0', cursor: 'pointer', color: 'var(--text-dim)', opacity: 0.3 }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>

        {!currentTab ? (
           <Dashboard />
        ) : (
          <>
            {/* REQUEST SETUP BAR (SCHEMA SELECTOR) */}
            <div className="flex-row gap-4 sticky top-0 z-20" style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--bg-surface-lowest)', borderBottom: '1px solid var(--border)' }}>
                <div className="flex-row gap-4 flex-1">
                    <div className="flex-row flex-1">
                        <input
                            type="text"
                            value={currentTab.name}
                            onChange={(e) => updateActiveTabData({ name: e.target.value })}
                            className="url-input"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', fontWeight: 600, background: 'transparent', border: '1px solid transparent', flex: 1, color: 'var(--on-surface)' }}
                            placeholder="Request Name"
                        />
                    </div>
                    <div className="flex-row gap-2">
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 500 }}>Schema:</span>
                        <select 
                            value={currentTab.schemaPath} 
                            onChange={(e) => updateActiveTabData({ schemaPath: e.target.value, rootType: '' })}
                            className="url-input"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--bg-surface-low)', flex: 1 }}
                        >
                            <option value="">Select definition...</option>
                            {schemas.map(s => <option key={s.path} value={s.path}>{s.id}</option>)}
                        </select>
                    </div>

                    <div className="flex-row gap-2">
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 500 }}>Root Type:</span>
                        <select 
                            value={currentTab.rootType} 
                            onChange={(e) => updateActiveTabData({ rootType: e.target.value })}
                            className="url-input"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--bg-surface-low)', flex: 1 }}
                            disabled={!currentSchema}
                        >
                            <option value="">Select Root Type...</option>
                            {currentSchema?.types.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* URL BAR */}
            <div className="url-bar-container">
              <select
                value={currentTab.method}
                onChange={(e) => updateActiveTabData({ method: e.target.value })}
                className="method-tag"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="WS">WS</option>
              </select>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                <input
                  type="text"
                  value={currentTab.url}
                  onChange={(e) => handleInputChange(e, 'url')}
                  placeholder="Enter request URL"
                  className="url-input"
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 400, background: 'transparent', padding: '0.5rem 1rem' }}
                />
                {suggestion?.targetId === 'url' && suggestion.show && (
                  <div style={{ position: 'absolute', top: '100%', left: '0', marginTop: '4px', zIndex: 3000 }}>
                    <SuggestionList items={filteredVars} onSelect={applyVariable} />
                  </div>
                )}
              </div>

              {currentTab.method === 'WS' ? (
                !currentTab.wsConnected ? (
                  <button
                    onClick={connectWS}
                    className="btn-primary"
                    style={{ margin: '4px', background: '#22c55e', color: 'white' }}
                  >
                    Connect WS
                  </button>
                ) : (
                  <div className="flex-row" style={{ margin: '4px', gap: '4px' }}>
                      <button
                      onClick={sendWS}
                      className="btn-primary"
                    >
                      Send
                    </button>
                    <button
                      onClick={disconnectWS}
                      className="btn-secondary"
                      style={{ borderColor: '#ef4444', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, background: 'transparent' }}
                    >
                      Abort
                    </button>
                  </div>
                )
              ) : (
                <button
                  onClick={handleSend}
                  disabled={loading || !currentTab.schemaPath || !currentTab.rootType}
                  className="btn-primary"
                  style={{ margin: '4px' }}
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              )}
            </div>
    
            {/* EDITOR PANEL WITH TABS */}
            <div className="editor-panes" style={{ flex: 1 }}>
              {/* REQUEST SECTION */}
              <div className="pane" style={{ flex: 1.2 }}>
                <div className="tab-container">
                  <div 
                    className={`tab-item ${activeRequestTab === 'payload' ? 'active' : ''}`}
                    onClick={() => setActiveRequestTab('payload')}
                  >
                    Body
                  </div>
                  <div 
                    className={`tab-item ${activeRequestTab === 'headers' ? 'active' : ''}`}
                    onClick={() => setActiveRequestTab('headers')}
                  >
                    Headers ({Object.keys(currentTab.headers).length})
                  </div>
                  <div 
                    className={`tab-item ${activeRequestTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveRequestTab('settings')}
                  >
                    Settings
                  </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
                  {activeRequestTab === 'payload' && (
                    <>
                      <header className="pane-header" style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="flex-row gap-2">
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>JSON Payload</span>
                        </div>
                        <div className="flex-row gap-4">
                          <button
                            onClick={() => generateTemplate(currentTab.schemaPath, currentTab.rootType)}
                            disabled={!currentTab.schemaPath}
                            style={{
                              fontSize: '0.75rem', fontWeight: 600,
                              background: 'none', border: 'none',
                              color: currentTab.schemaPath ? 'var(--primary)' : 'var(--text-dim)',
                              cursor: currentTab.schemaPath ? 'pointer' : 'not-allowed',
                              display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <FileCode size={14} /> Generate
                          </button>
                          <Copy size={14} className="text-dim hover:text-on-surface transition-colors cursor-pointer" />
                        </div>
                      </header>
                      <div className="flex-1 relative p-4">
                        <textarea
                          value={currentTab.payload}
                          onChange={(e) => handleInputChange(e, 'payload')}
                          className="payload-editor terminal-scroll"
                          placeholder="Enter JSON payload..."
                          style={{ width: '100%', height: '100%', background: 'none', border: 'none', outline: 'none', resize: 'none', fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--on-surface)' }}
                        />
                        {suggestion?.targetId === 'payload' && suggestion.show && (
                          <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 3000 }}>
                            <SuggestionList items={filteredVars} onSelect={applyVariable} />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activeRequestTab === 'headers' && (
                    <div className="p-4 overflow-y-auto flex-1 terminal-scroll">
                      <HeadersEditor 
                          headers={currentTab.headers} 
                          onChange={(h) => updateActiveTabData({ headers: h })} 
                      />
                    </div>
                  )}

                  {activeRequestTab === 'settings' && (
                    <div className="flex-1 p-6 overflow-y-auto terminal-scroll text-on-surface">
                      <div className="mb-6">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={currentTab.retryEnabled || false}
                            onChange={(e) => updateActiveTabData({ retryEnabled: e.target.checked })}
                          />
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>Enable Retry Policy</span>
                        </label>
                      </div>

                      {currentTab.retryEnabled && (
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Max Retries</label>
                            <input
                              type="number"
                              value={currentTab.maxRetries || 0}
                              onChange={(e) => updateActiveTabData({ maxRetries: parseInt(e.target.value) || 0 })}
                              min={1}
                              max={10}
                              style={{
                                background: 'var(--bg-deep)',
                                border: '1px solid var(--border)',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                color: 'var(--on-surface)',
                                width: '120px'
                              }}
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Delay (ms)</label>
                            <input
                              type="number"
                              value={currentTab.delayMs || 0}
                              onChange={(e) => updateActiveTabData({ delayMs: parseInt(e.target.value) || 0 })}
                              min={0}
                              step={100}
                              style={{
                                background: 'var(--bg-deep)',
                                border: '1px solid var(--border)',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                color: 'var(--on-surface)',
                                width: '120px'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RESPONSE SECTION */}
              <div className="pane">
                <header className="pane-header">
                  <div className="flex-row gap-2">
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Response</span>
                  </div>
                  <div className="flex-row gap-4">
                    {currentTab.response && !loading && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', borderLeft: '1px solid var(--border)', paddingLeft: '1rem', display: 'flex', gap: '1rem' }}>
                        <span style={{ color: '#22c55e' }}>200 OK</span>
                        <span>{currentTab.executionTime}ms</span>
                      </div>
                    )}
                    <Copy size={14} className="text-dim cursor-pointer" />
                  </div>
                </header>
                <div className="flex-1 p-4 overflow-auto terminal-scroll">
                  <pre style={{ 
                      fontSize: '13px', fontFamily: 'var(--font-mono)', lineHeight: 1.6, 
                      color: currentTab.response?.startsWith('Error') ? '#ef4444' : 'var(--on-surface)',
                      whiteSpace: 'pre-wrap'
                   }}>
                    {currentTab.response || 'No response available.'}
                  </pre>
                </div>
              </div>
            </div>

            {/* STATUS FOOTER */}
            <div style={{ height: '32px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-lowest)', borderTop: '1px solid var(--border)' }}>
              <div className="flex-row gap-6">
                <div className="flex-row gap-2 text-xs text-dim" style={{ fontWeight: 500 }}>
                  <Database size={12} />
                  <span>{currentTab.schemaPath || 'No schema'}</span>
                </div>
                <div className="flex-row gap-2 text-xs text-dim" style={{ fontWeight: 500 }}>
                  <Activity size={12} />
                  <span>{currentTab.rootType || 'No root type'}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {contextMenu && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setContextMenu(null)} />
          <div
            className="glass-panel"
            style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 1000, padding: '4px', minWidth: '160px' }}
          >
            <button className="context-menu-item" onClick={() => { closeTab(contextMenu.id); setContextMenu(null); }}>Close Tab</button>
          </div>
        </>
      )}
    </div>
  );
}

const SuggestionList = ({ items, onSelect }: { items: any[], onSelect: (key: string) => void }) => {
  if (items.length === 0) return null;
  return (
    <div className="glass-panel suggestion-popover animate-in fade-in zoom-in-95 duration-75" style={{ 
      minWidth: '240px', border: '1px solid var(--primary)', borderRadius: '0.75rem', 
      padding: '4px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      background: 'rgba(25, 25, 30, 0.95)', backdropFilter: 'blur(10px)'
    }}>
      <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-dim)', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', letterSpacing: '0.1em' }}>ENVIRONMENT VARIABLES</div>
      {items.map(v => (
        <button 
          key={v.key} 
          onClick={() => onSelect(v.key)}
          style={{ 
            width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', 
            border: 'none', color: 'var(--on-surface)', fontSize: '12px', cursor: 'pointer', 
            borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '2px'
          }}
          className="hover:bg-primary/20 transition-colors"
        >
          <div style={{ fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Globe size={10} /> {v.key}
          </div>
          <div style={{ opacity: 0.5, fontSize: '10px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{v.value}</div>
        </button>
      ))}
    </div>
  );
};

export default App;
