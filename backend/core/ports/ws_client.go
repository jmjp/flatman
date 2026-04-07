package ports

import (
	"context"
)

// WSMessage representa uma mensagem WebSocket
type WSMessage struct {
	Type int
	Data []byte
}

// WSClient é a porta de saída para comunicação via WebSockets
type WSClient interface {
	Connect(ctx context.Context, url string, headers map[string]string) error
	Send(ctx context.Context, msg *WSMessage) error
	Receive(ctx context.Context) (*WSMessage, error)
	Close() error
}
