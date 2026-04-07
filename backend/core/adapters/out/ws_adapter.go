package out

import (
	"context"
	"errors"
	"flatman/backend/core/ports"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// WSAdapter é a implementação de WSClient usando Gorilla WebSocket
type WSAdapter struct {
	conn *websocket.Conn
	mu   sync.Mutex
}

// NewWSAdapter cria uma nova instância de adaptador WebSocket
func NewWSAdapter() *WSAdapter {
	return &WSAdapter{}
}

// Connect estabelece a conexão
func (a *WSAdapter) Connect(ctx context.Context, url string, headers map[string]string) error {
	a.mu.Lock()
	defer a.mu.Unlock()

	if a.conn != nil {
		a.conn.Close()
	}

	header := http.Header{}
	for k, v := range headers {
		header.Set(k, v)
	}

	dialer := websocket.DefaultDialer
	conn, _, err := dialer.DialContext(ctx, url, header)
	if err != nil {
		return err
	}

	a.conn = conn
	return nil
}

// Send envia uma mensagem
func (a *WSAdapter) Send(ctx context.Context, msg *ports.WSMessage) error {
	a.mu.Lock()
	defer a.mu.Unlock()

	if a.conn == nil {
		return errors.New("not connected")
	}

	return a.conn.WriteMessage(msg.Type, msg.Data)
}

// Receive recebe uma mensagem
func (a *WSAdapter) Receive(ctx context.Context) (*ports.WSMessage, error) {
	// Nota: conn.ReadMessage não respeita Context nativamente do Gorilla
	// Mas podemos gerenciar via Close se o context cancelar
	if a.conn == nil {
		return nil, errors.New("not connected")
	}

	msgType, data, err := a.conn.ReadMessage()
	if err != nil {
		return nil, err
	}

	return &ports.WSMessage{
		Type: msgType,
		Data: data,
	}, nil
}

// Close fecha a conexão
func (a *WSAdapter) Close() error {
	a.mu.Lock()
	defer a.mu.Unlock()

	if a.conn != nil {
		err := a.conn.Close()
		a.conn = nil
		return err
	}
	return nil
}
