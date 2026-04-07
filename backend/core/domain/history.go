package domain

import "time"

// HistoryEntry representa uma requisição passada no Flatman
type HistoryEntry struct {
	ID           string    `json:"id"`
	Method       string    `json:"method"`
	URL          string    `json:"url"`
	TypeName     string    `json:"type_name"`
	PayloadJSON  string    `json:"payload_json"`
	ResponseJSON string    `json:"response_json"`
	IsWebSocket  bool      `json:"is_websocket"`
	CreatedAt    time.Time `json:"created_at"`
}
