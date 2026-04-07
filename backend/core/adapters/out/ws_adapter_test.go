package out

import (
	"context"
	"flatman/backend/core/ports"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

func TestWSAdapter_Lifecycle(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		defer c.Close()
		for {
			mt, message, err := c.ReadMessage()
			if err != nil {
				break
			}
			err = c.WriteMessage(mt, message)
			if err != nil {
				break
			}
		}
	}))
	defer ts.Close()

	wsURL := "ws" + strings.TrimPrefix(ts.URL, "http")

	adapter := NewWSAdapter()
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := adapter.Connect(ctx, wsURL, nil); err != nil {
		t.Fatalf("Connect failed: %v", err)
	}
	defer adapter.Close()

	msg := &ports.WSMessage{
		Type: websocket.TextMessage,
		Data: []byte("ping"),
	}

	if err := adapter.Send(ctx, msg); err != nil {
		t.Fatalf("Send failed: %v", err)
	}

	resp, err := adapter.Receive(ctx)
	if err != nil {
		t.Fatalf("Receive failed: %v", err)
	}

	if string(resp.Data) != "ping" {
		t.Errorf("Expected 'ping', got '%s'", string(resp.Data))
	}
}
