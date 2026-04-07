import React, { useState } from 'react';
import { useStore, Environment, EnvVariable } from '../store/useStore';
import { X, Plus, Trash2, Globe } from 'lucide-react';

export function EnvironmentManager({ onClose }: { onClose: () => void }) {
  const { environments, addEnvironment, updateEnvironment, deleteEnvironment } = useStore();
  const [editingEnv, setEditingEnv] = useState<Environment | null>(environments[0] || null);

  const handleAddVar = () => {
    if (!editingEnv) return;
    const newVars = [...editingEnv.variables, { key: '', value: '', enabled: true }];
    updateEnvironment(editingEnv.id, { variables: newVars });
    setEditingEnv({ ...editingEnv, variables: newVars });
  };

  const handleUpdateVar = (index: number, data: Partial<EnvVariable>) => {
    if (!editingEnv) return;
    const newVars = editingEnv.variables.map((v, i) => i === index ? { ...v, ...data } : v);
    updateEnvironment(editingEnv.id, { variables: newVars });
    setEditingEnv({ ...editingEnv, variables: newVars });
  };

  const handleDeleteVar = (index: number) => {
    if (!editingEnv) return;
    const newVars = editingEnv.variables.filter((_, i) => i !== index);
    updateEnvironment(editingEnv.id, { variables: newVars });
    setEditingEnv({ ...editingEnv, variables: newVars });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)'
    }}>
      <div className="glass-panel" style={{
        width: '640px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', 
        padding: 0, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)'
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 700 }}>
             <Globe className="text-secondary" size={20} />
             Environment Manager
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '8px' }}>
            <X size={20} />
          </button>
        </header>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* List */}
          <div style={{ width: '200px', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {environments.map(env => (
              <button
                key={env.id}
                onClick={() => setEditingEnv(env)}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px', borderRadius: '8px', fontSize: '12px', border: 'none', cursor: 'pointer',
                  backgroundColor: editingEnv?.id === env.id ? 'var(--primary)' : 'transparent',
                  color: editingEnv?.id === env.id ? 'var(--bg-deep)' : 'var(--text-dim)',
                  fontWeight: editingEnv?.id === env.id ? 700 : 400,
                  transition: 'all 0.2s'
                }}
              >
                {env.name}
              </button>
            ))}
            <button
              onClick={() => addEnvironment("New Env")}
              style={{
                marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', fontSize: '10px',
                textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, color: 'var(--primary)',
                background: 'rgba(201, 147, 255, 0.05)', border: 'none', borderRadius: '8px', cursor: 'pointer'
              }}
            >
              <Plus size={14} /> Add New
            </button>
          </div>

          {/* Editor */}
          <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }} className="terminal-scroll">
            {editingEnv ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                   <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 900, marginBottom: '8px', display: 'block' }}>Name</label>
                   <input
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px', padding: '12px', width: '100%', outline: 'none', color: 'var(--on-surface)',
                      fontSize: '14px'
                    }}
                    value={editingEnv.name}
                    onChange={(e) => {
                      updateEnvironment(editingEnv.id, { name: e.target.value });
                      setEditingEnv({ ...editingEnv, name: e.target.value });
                    }}
                   />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 900 }}>Variables</label>
                    <button onClick={handleAddVar} style={{ fontSize: '10px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>+ ADD VARIABLE</button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {editingEnv.variables.map((v, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <input 
                          type="checkbox" checked={v.enabled} 
                          onChange={(e) => handleUpdateVar(i, { enabled: e.target.checked })}
                          style={{ cursor: 'pointer' }}
                        />
                        <input 
                          placeholder="Key" value={v.key}
                          onChange={(e) => handleUpdateVar(i, { key: e.target.value })}
                          style={{ background: 'none', border: 'none', color: 'var(--on-surface)', fontSize: '12px', width: '80px', borderBottom: '1px solid transparent', outline: 'none' }}
                        />
                        <input 
                          placeholder="Value" value={v.value}
                          onChange={(e) => handleUpdateVar(i, { value: e.target.value })}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', opacity: 0.8, fontSize: '12px', flex: 1, borderBottom: '1px solid transparent', outline: 'none' }}
                        />
                        <button onClick={() => handleDeleteVar(i)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', opacity: 0.3, cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {editingEnv.variables.length === 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>No variables defined</div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                  <button 
                    onClick={() => { deleteEnvironment(editingEnv.id); setEditingEnv(null); }}
                    style={{ fontSize: '10px', color: '#ef4444', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={12} /> Delete Environment
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '14px', fontStyle: 'italic' }}>
                Select an environment to edit
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
