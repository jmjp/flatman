-- backend/scripts/migrations/001_initial_schema.sql
CREATE TABLE IF NOT EXISTS loaded_schemas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS request_history (
    id TEXT PRIMARY KEY,
    method TEXT NOT NULL,
    url TEXT NOT NULL,
    type_name TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    response_json TEXT,
    is_websocket BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
