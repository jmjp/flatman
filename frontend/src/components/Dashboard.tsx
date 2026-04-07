import React from 'react';
import { 
  FolderPlus, 
  Database, 
  PlusCircle, 
  ArrowRight,
  Zap,
  LayoutGrid,
  FileCode
} from 'lucide-react';
import { useStore } from '../store/useStore';

export const Dashboard = () => {
    const { selectDirectory, dirPath, schemas, collections, createCollection } = useStore();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-y-auto terminal-scroll" style={{ background: 'radial-gradient(circle at center, rgba(201, 147, 255, 0.05) 0%, transparent 70%)' }}>
            <div className="max-w-4xl w-full">
                <header className="mb-12 text-center">
                    <div className="inline-block p-4 rounded-2xl bg-primary/10 mb-6 animate-pulse-slow">
                        <Zap size={48} className="text-primary" />
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1rem' }}>
                        Flatman <span className="text-primary">Studio</span>
                    </h1>
                    <p className="text-dim text-lg max-w-xl mx-auto" style={{ lineHeight: 1.6 }}>
                        The ultimate workbench for Flatbuffers-based APIs. 
                        Follow the steps below to start your mission.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* STEP 1: LOAD DIR / COLLECTION */}
                    <div className="glass-panel p-8 flex flex-col gap-6 hover:border-primary/30 transition-all group cursor-pointer" onClick={() => selectDirectory()}>
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <FolderPlus size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/50">Step 01</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Workspace</h3>
                            <p className="text-xs text-dim leading-relaxed">
                                Select a directory containing your <code>.fbs</code> schemas and <code>flatman.json</code> collections.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-primary">
                            {dirPath ? 'Directory Selected' : 'Choose Directory'} <ArrowRight size={14} />
                        </div>
                    </div>

                    {/* STEP 2: SCHEMAS */}
                    <div className="glass-panel p-8 flex flex-col gap-6 opacity-60 hover:opacity-100 transition-all group">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-secondary/10 text-secondary group-hover:scale-110 transition-transform">
                                <Database size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary/50">Step 02</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Schemas</h3>
                            <p className="text-xs text-dim leading-relaxed">
                                {schemas.length > 0 
                                    ? `${schemas.length} schemas loaded successfully. You can now use them in requests.`
                                    : 'Import your Flatbuffers definitions to enable serialization and code generation.'}
                            </p>
                        </div>
                        <div className="text-[10px] font-mono text-secondary/50 uppercase tracking-tighter">
                            {schemas.length > 0 ? 'Definitions Active' : 'Waiting for Workspace'}
                        </div>
                    </div>

                    {/* STEP 3: ENDPOINTS */}
                    <div className="glass-panel p-8 flex flex-col gap-6 opacity-60 hover:opacity-100 transition-all group">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-white/5 text-white group-hover:scale-110 transition-transform">
                                <PlusCircle size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Step 03</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Endpoints</h3>
                            <p className="text-xs text-dim leading-relaxed">
                                Create collections and requests. Map each request to a Flatbuffer schema and root type.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-white/50">
                            {collections.length} Collections Active
                        </div>
                    </div>
                </div>

                <footer className="mt-16 flex flex-wrap gap-12 justify-center border-t border-white/5 pt-12">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-dim">
                            <FileCode size={18} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-dim uppercase tracking-widest">Serialization</div>
                            <div className="text-xs font-bold">Auto-FB-Mapping</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-dim">
                            <LayoutGrid size={18} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-dim uppercase tracking-widest">Interface</div>
                            <div className="text-xs font-bold">Side-by-Side Sync</div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};
