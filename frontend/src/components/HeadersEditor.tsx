import React from 'react';
import { X, Plus, Key } from 'lucide-react';

interface HeadersEditorProps {
  headers: Record<string, string>;
  onChange: (headers: Record<string, string>) => void;
}

export const HeadersEditor: React.FC<HeadersEditorProps> = ({ headers, onChange }) => {
  const addHeader = () => {
    onChange({ ...headers, '': '' });
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    const newHeaders = { ...headers };
    if (oldKey !== newKey) {
      delete newHeaders[oldKey];
    }
    newHeaders[newKey] = value;
    onChange(newHeaders);
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...headers };
    delete newHeaders[key];
    onChange(newHeaders);
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex-row gap-2 mb-4" style={{ justifyContent: 'space-between' }}>
        <h3 className="text-xs uppercase tracking-widest font-black text-dim">HTTP Headers</h3>
        <button 
          onClick={addHeader}
          className="btn-primary" 
          style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '10px' }}
        >
          <Plus size={12} /> Add Header
        </button>
      </div>

      <div className="flex flex-col gap-2 terminal-scroll overflow-auto" style={{ maxHeight: '200px' }}>
        {Object.entries(headers).length === 0 && (
          <div className="text-xs text-dim italic opacity-50 p-4 text-center">No custom headers defined.</div>
        )}
        
        {Object.entries(headers).map(([key, value], idx) => (
          <div key={idx} className="flex-row gap-2" style={{ 
            background: 'rgba(255,255,255,0.02)', 
            padding: '6px', 
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <Key size={12} className="text-primary opacity-50" />
            <input 
              className="url-input"
              style={{ flex: 1, fontSize: '11px', padding: '4px' }}
              placeholder="Header Key"
              value={key}
              onChange={(e) => updateHeader(key, e.target.value, value)}
            />
            <span className="text-dim opacity-30">:</span>
            <input 
              className="url-input"
              style={{ flex: 2, fontSize: '11px', padding: '4px' }}
              placeholder="Header Value"
              value={value}
              onChange={(e) => updateHeader(key, key, e.target.value)}
            />
            <button 
                onClick={() => removeHeader(key)}
                className="text-dim hover:text-red-400 p-1"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
                <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
