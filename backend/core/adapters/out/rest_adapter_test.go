package out

import (
	"context"
	"flatman/backend/core/ports"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRESTAdapter_Do(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		if string(body) == "ping" {
			w.Header().Set("X-Test", "pong")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("pong"))
		} else {
			w.WriteHeader(http.StatusBadRequest)
		}
	}))
	defer ts.Close()

	adapter := NewRESTAdapter()
	ctx := context.Background()

	req := &ports.HTTPRequest{
		Method: "POST",
		URL:    ts.URL,
		Body:   []byte("ping"),
		Headers: map[string]string{
			"Content-Type": "application/x-flatbuffers",
		},
	}

	resp, err := adapter.Do(ctx, req)
	if err != nil {
		t.Fatalf("Do failed: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200, got %d", resp.StatusCode)
	}

	if string(resp.Body) != "pong" {
		t.Errorf("Expected 'pong', got '%s'", string(resp.Body))
	}

	if resp.Headers["X-Test"] != "pong" {
		t.Errorf("Header mismatch")
	}
}
