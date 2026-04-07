package out

import (
	"bytes"
	"context"
	"flatman/backend/core/ports"
	"io"
	"net/http"
)

// RESTAdapter é a implementação de HTTPClient usando a stdlib do Go
type RESTAdapter struct {
	client *http.Client
}

// NewRESTAdapter cria uma nova instância do adaptador REST
func NewRESTAdapter() *RESTAdapter {
	return &RESTAdapter{
		client: &http.Client{},
	}
}

// Do executa a requisição HTTP e retorna a resposta
func (a *RESTAdapter) Do(ctx context.Context, req *ports.HTTPRequest) (*ports.HTTPResponse, error) {
	httpReq, err := http.NewRequestWithContext(ctx, req.Method, req.URL, bytes.NewReader(req.Body))
	if err != nil {
		return nil, err
	}

	for k, v := range req.Headers {
		httpReq.Header.Set(k, v)
	}

	resp, err := a.client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	headers := make(map[string]string)
	for k, v := range resp.Header {
		if len(v) > 0 {
			headers[k] = v[0]
		}
	}

	return &ports.HTTPResponse{
		StatusCode: resp.StatusCode,
		Headers:    headers,
		Body:       body,
	}, nil
}
