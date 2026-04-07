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
    const { selectDirectory, dirPath, schemas, collections } = useStore();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-y-auto terminal-scroll" style={{ background: 'var(--bg-main)' }}>
            <div className="max-w-4xl w-full">
                <header className="mb-12 text-center">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '1rem' }}>
                        Flatman
                    </h1>
                    <p className="text-dim text-base max-w-xl mx-auto" style={{ lineHeight: 1.6 }}>
                        The ultimate workbench for Flatbuffers-based APIs.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* STEP 1: LOAD DIR / COLLECTION */}
                    <div className="glass-panel p-6 flex flex-col gap-4 hover:border-primary transition-all cursor-pointer" onClick={() => selectDirectory()} style={{ background: 'var(--bg-surface-lowest)' }}>
                        <div className="flex items-center gap-3 text-primary">
                            <FolderPlus size={24} />
                            <h3 className="text-lg font-semibold m-0 text-on-surface">Workspace</h3>
                        </div>
                        <p className="text-sm text-dim leading-relaxed flex-1">
                            Select a directory containing your <code>.fbs</code> schemas and <code>flatman.json</code> collections.
                        </p>
                        <div className="flex items-center gap-2 text-sm font-medium text-primary mt-auto">
                            {dirPath ? 'Directory Selected' : 'Choose Directory'} <ArrowRight size={14} />
                        </div>
                    </div>

                    {/* STEP 2: SCHEMAS */}
                    <div className="glass-panel p-6 flex flex-col gap-4" style={{ background: 'var(--bg-surface-lowest)' }}>
                        <div className="flex items-center gap-3 text-secondary">
                            <Database size={24} />
                            <h3 className="text-lg font-semibold m-0 text-on-surface">Schemas</h3>
                        </div>
                        <p className="text-sm text-dim leading-relaxed flex-1">
                            {schemas.length > 0
                                ? `${schemas.length} schemas loaded successfully. You can now use them in requests.`
                                : 'Import your Flatbuffers definitions to enable serialization and code generation.'}
                        </p>
                        <div className="text-sm font-medium text-dim mt-auto">
                            {schemas.length > 0 ? 'Definitions Active' : 'Waiting for Workspace'}
                        </div>
                    </div>

                    {/* STEP 3: ENDPOINTS */}
                    <div className="glass-panel p-6 flex flex-col gap-4" style={{ background: 'var(--bg-surface-lowest)' }}>
                        <div className="flex items-center gap-3 text-on-surface opacity-80">
                            <PlusCircle size={24} />
                            <h3 className="text-lg font-semibold m-0 text-on-surface">Endpoints</h3>
                        </div>
                        <p className="text-sm text-dim leading-relaxed flex-1">
                            Create collections and requests. Map each request to a Flatbuffer schema and root type.
                        </p>
                        <div className="text-sm font-medium text-dim mt-auto">
                            {collections.length} Collections Active
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
