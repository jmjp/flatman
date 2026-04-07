package ports

import (
	"context"
)

// HTTPRequest representa uma requisição HTTP customizada para Flatbuffers
type HTTPRequest struct {
	Method  string
	URL     string
	Headers map[string]string
	Body    []byte
}

// HTTPResponse representa a resposta do servidor
type HTTPResponse struct {
	StatusCode int
	Headers    map[string]string
	Body       []byte
}

// HTTPClient é a porta de saída para realizar requisições HTTP
type HTTPClient interface {
	Do(ctx context.Context, req *HTTPRequest) (*HTTPResponse, error)
}
