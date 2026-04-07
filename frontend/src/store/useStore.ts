import { create } from 'zustand';
import { domain } from '../../wailsjs/go/models';
// @ts-ignore
import { LoadSchemasFromDir, SelectDirectory, SaveCollection, ConnectWS, SendWS, DisconnectWS } from '../../wailsjs/go/main/App';
import * as WailsRuntime from '../../wailsjs/runtime';

export interface TabState {
  id: string; // ID da Request ou Path do Schema
  name: string;
  type: 'SCHEMA' | 'REQUEST';
  payload: string;
  response: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  schemaPath: string;
  rootType: string;
  executionTime: number | null;
  collectionName?: string; // Para vínculo com a coleção se for REQUEST
  wsLogs?: { type: 'in' | 'out' | 'info', data: string, time: string }[];
  wsConnected?: boolean;
}

export interface EnvVariable {
  key: string;
  value: string;
  enabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvVariable[];
}

const DEFAULT_HEADERS = {
  "Accept": "application/x-flatbuffers",
  "Content-Type": "application/json"
};

const DEFAULT_TAB_STATE = (id: string, name: string, type: 'SCHEMA' | 'REQUEST' = 'REQUEST'): TabState => ({
  id,
  name,
  type,
  payload: '{\n  "id": 1\n}',
  response: '',
  url: 'http://localhost:8080/api',
  method: 'POST',
  headers: { ...DEFAULT_HEADERS },
  schemaPath: '',
  rootType: '',
  executionTime: null,
  wsLogs: [],
  wsConnected: false
});

interface AppState {
  schemas: domain.SchemaInfo[];
  collections: domain.Collection[];
  activeTabId: string | null;
  openTabs: TabState[];
  dirPath: string;
  loading: boolean;

  // Environment State
  environments: Environment[];
  activeEnvironmentId: string | null;

  // Actions
  setActiveTab: (id: string | null) => void;
  updateActiveTabData: (data: Partial<TabState>) => void;
  setLoading: (loading: boolean) => void;
  
  openSchema: (schema: domain.SchemaInfo) => void;
  openRequest: (request: domain.SavedRequest, collectionName: string) => void;
  closeTab: (id: string) => void;
  
  generateTemplate: (schemaPath: string, typeName: string) => void;
  selectDirectory: () => Promise<void>;
  loadSchemas: (path?: string) => Promise<void>;

  // Collection Actions
  saveCurrentRequest: () => Promise<void>;
  createCollection: (name: string) => Promise<void>;
  addRequestToCollection: (collectionName: string) => Promise<void>;

  // Environment Actions
  addEnvironment: (name: string) => void;
  updateEnvironment: (id: string, env: Partial<Environment>) => void;
  deleteEnvironment: (id: string) => void;
  setActiveEnvironmentId: (id: string | null) => void;
  getInterpolatedText: (text: string) => string;

  // WS Actions
  connectWS: () => Promise<void>;
  sendWS: () => Promise<void>;
  disconnectWS: () => Promise<void>;
  clearWSLogs: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  schemas: [],
  collections: [],
  activeTabId: null,
  openTabs: [],
  dirPath: '',
  loading: false,

  environments: [
    { id: 'local', name: 'Local', variables: [{ key: 'baseUrl', value: 'http://localhost:8080/api', enabled: true }] }
  ],
  activeEnvironmentId: 'local',

  setActiveTab: (id) => set({ activeTabId: id }),
  
  updateActiveTabData: (data) => {
    const { activeTabId, openTabs } = get();
    if (!activeTabId) return;
    
    set({
      openTabs: openTabs.map(t => t.id === activeTabId ? { ...t, ...data } : t)
    });
  },

  setLoading: (loading) => set({ loading }),

  openSchema: (schema) => {
    const { openTabs } = get();
    const existing = openTabs.find(t => t.id === schema.path);
    
    if (!existing) {
      const newTab = DEFAULT_TAB_STATE(schema.path, schema.id, 'SCHEMA');
      newTab.schemaPath = schema.path;
      newTab.rootType = schema.types?.[0]?.name || '';
      set({ openTabs: [...openTabs, newTab] });
    }
    set({ activeTabId: schema.path });
  },

  openRequest: (req, collectionName) => {
    const { openTabs } = get();
    const tabId = `req-${collectionName}-${req.id}`;
    const existing = openTabs.find(t => t.id === tabId);
    
    if (!existing) {
      const newTab: TabState = {
        id: tabId,
        name: req.name,
        type: 'REQUEST',
        url: req.url,
        method: req.method,
        payload: req.payload || '{\n}',
        headers: req.headers || { ...DEFAULT_HEADERS },
        schemaPath: req.schema || '',
        rootType: req.rootType || '',
        response: '',
        executionTime: null,
        collectionName
      };
      set({ openTabs: [...openTabs, newTab] });
    }
    set({ activeTabId: tabId });
  },

  closeTab: (id) => {
    const { openTabs, activeTabId } = get();
    const newTabs = openTabs.filter(t => t.id !== id);
    set({ openTabs: newTabs });
    
    if (activeTabId === id) {
      set({ activeTabId: newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null });
    }
  },

  generateTemplate: (schemaPath, typeName) => {
    const { schemas } = get();
    const schema = schemas.find(s => s.path === schemaPath);
    if (!schema) return;

    const type = schema.types.find(t => t.name === typeName) || schema.types[0];
    if (!type) return;

    const obj: Record<string, any> = {};
    type.fields.forEach(f => {
       const lowType = f.type.toLowerCase();
       if (lowType.includes("int") || lowType.includes("float") || 
           lowType.includes("double") || lowType.includes("long") ||
           lowType.includes("byte") || lowType.includes("short")) {
         obj[f.name] = 0;
       } else if (lowType === "bool") {
         obj[f.name] = true;
       } else if (lowType.startsWith("[") && lowType.endsWith("]")) {
         obj[f.name] = [];
       } else {
         obj[f.name] = "";
       }
    });

    get().updateActiveTabData({ payload: JSON.stringify(obj, null, 2), rootType: type.name });
  },

  selectDirectory: async () => {
    try {
      const path = await SelectDirectory();
      if (path) {
        set({ dirPath: path });
        get().loadSchemas(path);
      }
    } catch (e) {
      console.error("Failed to select directory:", e);
    }
  },

  loadSchemas: async (path?: string) => {
    const targetPath = path || get().dirPath;
    if (!targetPath) return;

    try {
      const result = await LoadSchemasFromDir(targetPath) as unknown as domain.LoadResult;
      set({ 
        schemas: result.schemas || [], 
        collections: result.collections || [] 
      });
    } catch (e) {
      console.error("Failed to load schemas:", e);
    }
  },

  createCollection: async (name: string) => {
    const { dirPath, collections } = get();
    if (!dirPath) return;

    // Supõe que flatman.json ficará no dirPath
    const filePath = `${dirPath}/flatman.json`;
    const newCol = new domain.Collection({
        name,
        requests: []
    });
    // @ts-ignore
    newCol.filePath = filePath;

    try {
        await SaveCollection(newCol);
        await get().loadSchemas(dirPath);
    } catch (e) {
        console.error("Failed to create collection:", e);
    }
  },

  addRequestToCollection: async (collectionName: string) => {
    const { collections, dirPath } = get();
    const col = collections.find(c => c.name === collectionName);
    if (!col || !dirPath) return;

    const newReq: domain.SavedRequest = {
        id: crypto.randomUUID().slice(0, 8),
        name: "New Request",
        url: "http://localhost:8080/api",
        method: "POST",
        schema: "",
        rootType: "",
        headers: { ...DEFAULT_HEADERS },
        payload: "{\n}"
    };

    col.requests.push(newReq);
    const filePath = `${dirPath}/flatman.json`;
    // @ts-ignore
    col.filePath = filePath;

    try {
        await SaveCollection(col);
        await get().loadSchemas(dirPath);
        get().openRequest(newReq, collectionName);
    } catch (e) {
        console.error("Failed to add request:", e);
    }
  },

  saveCurrentRequest: async () => {
    const { activeTabId, openTabs, collections, dirPath } = get();
    if (!activeTabId || !dirPath) return;

    const tab = openTabs.find(t => t.id === activeTabId);
    if (!tab || tab.type !== 'REQUEST' || !tab.collectionName) return;

    const col = collections.find(c => c.name === tab.collectionName);
    if (!col) return;

    // Atualiza a request na coleção
    const reqIndex = col.requests.findIndex(r => `req-${tab.collectionName}-${r.id}` === tab.id);
    if (reqIndex === -1) return;

    col.requests[reqIndex] = {
        ...col.requests[reqIndex],
        url: tab.url,
        method: tab.method,
        payload: tab.payload,
        headers: tab.headers,
        schema: tab.schemaPath,
        rootType: tab.rootType,
        name: tab.name
    };

    const filePath = `${dirPath}/flatman.json`;
    // @ts-ignore
    col.filePath = filePath;

    try {
        await SaveCollection(col);
        // Não precisa dar reload em tudo, apenas atualizar a lista local se necessário
    } catch (e) {
        console.error("Failed to save request:", e);
    }
  },

  addEnvironment: (name) => {
    const newEnv: Environment = {
      id: crypto.randomUUID(),
      name,
      variables: []
    };
    set(state => ({ environments: [...state.environments, newEnv] }));
  },

  updateEnvironment: (id, data) => set(state => ({
    environments: state.environments.map(e => e.id === id ? { ...e, ...data } : e)
  })),

  deleteEnvironment: (id) => set(state => ({
    environments: state.environments.filter(e => e.id !== id),
    activeEnvironmentId: state.activeEnvironmentId === id ? null : state.activeEnvironmentId
  })),

  setActiveEnvironmentId: (id) => set({ activeEnvironmentId: id }),

  getInterpolatedText: (text) => {
    const { activeEnvironmentId, environments } = get();
    const activeEnv = environments.find(e => e.id === activeEnvironmentId);
    if (!activeEnv || !text) return text;

    let result = text;
    activeEnv.variables.forEach(v => {
      if (v.enabled) {
        const key = v.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, v.value);
      }
    });
    return result;
  },

  connectWS: async () => {
    const { activeTabId, openTabs, getInterpolatedText, updateActiveTabData } = get();
    const tab = openTabs.find(t => t.id === activeTabId);
    if (!tab) return;

    const url = getInterpolatedText(tab.url);
    const headers = {}; // Podemos interpolar também futuramente
    
    try {
        await ConnectWS(url, headers);
        updateActiveTabData({ 
            wsConnected: true,
            wsLogs: [...(tab.wsLogs || []), { type: 'info', data: `Connected to ${url}`, time: new Date().toLocaleTimeString() }]
        });
    } catch (e: any) {
        updateActiveTabData({ 
            wsLogs: [...(tab.wsLogs || []), { type: 'info', data: `Connection error: ${e}`, time: new Date().toLocaleTimeString() }]
        });
    }
  },

  sendWS: async () => {
    const { activeTabId, openTabs, updateActiveTabData } = get();
    const tab = openTabs.find(t => t.id === activeTabId);
    if (!tab || !tab.wsConnected) return;

    try {
        await SendWS(tab.schemaPath, tab.payload);
        updateActiveTabData({ 
            wsLogs: [...(tab.wsLogs || []), { type: 'out', data: tab.payload, time: new Date().toLocaleTimeString() }]
        });
    } catch (e: any) {
        updateActiveTabData({ 
            wsLogs: [...(tab.wsLogs || []), { type: 'info', data: `Send error: ${e}`, time: new Date().toLocaleTimeString() }]
        });
    }
  },

  disconnectWS: async () => {
    const { activeTabId, openTabs, updateActiveTabData } = get();
    const tab = openTabs.find(t => t.id === activeTabId);
    if (!tab) return;

    try {
        await DisconnectWS();
        updateActiveTabData({ 
            wsConnected: false,
            wsLogs: [...(tab.wsLogs || []), { type: 'info', data: "Disconnected", time: new Date().toLocaleTimeString() }]
        });
    } catch (e) {
        console.error("Disconnect error:", e);
    }
  },

  clearWSLogs: () => {
    get().updateActiveTabData({ wsLogs: [] });
  }
}));

// Setup Global Listeners
WailsRuntime.EventsOn("ws:message", (data: string) => {
    const { updateActiveTabData, activeTabId, openTabs } = useStore.getState();
    const tab = openTabs.find(t => t.id === activeTabId);
    if (tab) {
        updateActiveTabData({
            wsLogs: [...(tab.wsLogs || []), { type: 'in', data, time: new Date().toLocaleTimeString() }]
        });
    }
});

WailsRuntime.EventsOn("ws:error", (err: string) => {
    const { updateActiveTabData, activeTabId, openTabs } = useStore.getState();
    const tab = openTabs.find(t => t.id === activeTabId);
    if (tab) {
        updateActiveTabData({
            wsConnected: false, 
            wsLogs: [...(tab.wsLogs || []), { type: 'info', data: `WS ERROR: ${err}`, time: new Date().toLocaleTimeString() }]
        });
    }
});
