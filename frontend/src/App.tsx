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
            <div className="flex-row gap-6 sticky top-0 z-20" style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--bg-surface-lowest)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
                <div className="flex-row gap-4 flex-1">
                    <div className="flex-row gap-3 p-1.5 rounded-xl bg-white/5 border border-white/10 flex-1">
                        <input
                            type="text"
                            value={currentTab.name}
                            onChange={(e) => updateActiveTabData({ name: e.target.value })}
                            className="url-input"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 'bold', background: 'transparent', border: 'none', flex: 1, color: 'var(--on-surface)' }}
                            placeholder="Request Name"
                        />
                    </div>
                    <div className="flex-row gap-3 p-1.5 rounded-xl bg-primary/5 border border-primary/20 flex-1">
                        <Database size={12} className="text-primary" />
                        <span className="text-tiny font-black uppercase text-primary/80 tracking-widest">Schema:</span>
                        <select 
                            value={currentTab.schemaPath} 
                            onChange={(e) => updateActiveTabData({ schemaPath: e.target.value, rootType: '' })}
                            className="url-input"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', background: 'var(--bg-deep)', borderRadius: '6px', border: 'none', flex: 1 }}
                        >
                            <option value="">Select a Flatbuffer definition...</option>
                            {schemas.map(s => <option key={s.path} value={s.path}>{s.id}</option>)}
                        </select>
                    </div>

                    <div className="flex-row gap-3 p-1.5 rounded-xl bg-secondary/5 border border-secondary/20 flex-1">
                        <Wand2 size={12} className="text-secondary" />
                        <span className="text-tiny font-black uppercase text-secondary/80 tracking-widest">Root Type:</span>
                        <select 
                            value={currentTab.rootType} 
                            onChange={(e) => updateActiveTabData({ rootType: e.target.value })}
                            className="url-input"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', background: 'var(--bg-deep)', borderRadius: '6px', border: 'none', flex: 1 }}
                            disabled={!currentSchema}
                        >
                            <option value="">Select Root Type...</option>
                            {currentSchema?.types.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* URL BAR */}
            <div style={{ padding: '1rem 1.5rem', flexShrink: 0, display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="url-bar-container" style={{ margin: 0, flex: 1, height: '48px' }}>
                <select
                  value={currentTab.method}
                  onChange={(e) => updateActiveTabData({ method: e.target.value })}
                  className="method-tag"
                  style={{ border: 'none' }}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="WS">WS</option>
                </select>
    
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem', position: 'relative' }}>
                  <Globe size={14} style={{ color: 'var(--primary)', opacity: 0.4 }} />
                  <input
                    type="text"
                    value={currentTab.url}
                    onChange={(e) => handleInputChange(e, 'url')}
                    placeholder="URL (ex: {{baseUrl}}/users)"
                    className="url-input"
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.75rem', fontWeight: 500, background: 'transparent' }}
                  />
                  {suggestion?.targetId === 'url' && suggestion.show && (
                    <div style={{ position: 'absolute', top: '100%', left: '0', marginTop: '4px', zIndex: 3000 }}>
                      <SuggestionList items={filteredVars} onSelect={applyVariable} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-row gap-3">
                {currentTab.method === 'WS' ? (
                  !currentTab.wsConnected ? (
                    <button
                      onClick={connectWS}
                      className="btn-primary flex-row gap-2"
                      style={{ background: 'var(--success)', color: 'white' }}
                    >
                      <Link size={14} strokeWidth={3} />
                      Connect WS
                    </button>
                  ) : (
                    <div className="flex-row gap-2">
                       <button
                        onClick={sendWS}
                        className="btn-primary flex-row gap-2"
                      >
                        <Play size={14} fill="currentColor" />
                        Send Frame
                      </button>
                      <button
                        onClick={disconnectWS}
                        className="btn-secondary flex-row gap-2"
                        style={{ borderColor: 'var(--error)', color: 'var(--error)', padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontSize: '11px', fontWeight: 900, background: 'transparent' }}
                      >
                        <Link2Off size={14} strokeWidth={3} />
                        Abort
                      </button>
                    </div>
                  )
                ) : (
                  <button 
                    onClick={handleSend}
                    disabled={loading || !currentTab.schemaPath || !currentTab.rootType}
                    className="btn-primary flex-row gap-3 animate-pulse-slow"
                  >
                    {loading ? <Zap size={14} className="animate-spin" /> : <Send size={14} strokeWidth={3} />}
                    <span>Execute Service</span>
                  </button>
                )}
              </div>
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
                      <header className="pane-header" style={{ borderBottom: 'none' }}>
                        <div className="flex-row gap-2">
                          <Terminal size={14} style={{ opacity: 0.6 }} />
                          <span className="text-[10px] uppercase tracking-widest font-black">JSON Payload</span>
                        </div>
                        <div className="flex-row gap-4">
                          <button
                            onClick={() => generateTemplate(currentTab.schemaPath, currentTab.rootType)}
                            disabled={!currentTab.schemaPath}
                            style={{
                              fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
                              background: 'none', border: 'none',
                              color: currentTab.schemaPath ? 'var(--primary)' : 'var(--text-dim)',
                              cursor: currentTab.schemaPath ? 'pointer' : 'not-allowed',
                            }}
                          >
                            <Wand2 size={10} /> Generate
                          </button>
                          <Copy size={12} className="text-dim hover:text-on-surface transition-colors cursor-pointer" />
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
                    <Activity size={14} style={{ opacity: 0.6 }} />
                    <span className="text-[10px] uppercase tracking-widest font-black">Response</span>
                  </div>
                  <div className="flex-row gap-4">
                    {currentTab.response && !loading && (
                      <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-dim)', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem', display: 'flex', gap: '1rem' }}>
                        <span style={{ color: '#4ade80' }}>200 OK</span>
                        <span>{currentTab.executionTime}ms</span>
                      </div>
                    )}
                    <Copy size={12} className="text-dim cursor-pointer" />
                  </div>
                </header>
                <div className="flex-1 p-6 overflow-auto terminal-scroll">
                  <pre style={{ 
                      fontSize: '13px', fontFamily: 'var(--font-mono)', lineHeight: 1.6, 
                      color: currentTab.response?.startsWith('Error') ? '#f87171' : 'var(--primary)', 
                      whiteSpace: 'pre-wrap', opacity: 0.9 
                   }}>
                    {currentTab.response || '// Output will appear here...'}
                  </pre>
                </div>
              </div>
            </div>

            {/* STATUS FOOTER */}
            <div style={{ height: '36px', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border)' }}>
              <div className="flex-row gap-6">
                <div className="flex-row gap-2 text-xs uppercase tracking-widest text-dim" style={{ fontWeight: 800 }}>
                  <Database size={10} />
                  Schema: <span style={{ color: 'var(--primary)' }}>{currentTab.schemaPath || 'none'}</span>
                </div>
                <div className="flex-row gap-2 text-xs uppercase tracking-widest text-dim" style={{ fontWeight: 800 }}>
                  <Activity size={10} />
                  Type: <span style={{ color: 'var(--secondary)' }}>{currentTab.rootType || 'unspecified'}</span>
                </div>
              </div>
              <div className="text-xs text-dim" style={{ fontWeight: 800, opacity: 0.3, letterSpacing: '0.1em' }}>
                FLATMAN ENGINE V2
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
