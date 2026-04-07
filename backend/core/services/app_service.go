package services

import (
	"context"
	"encoding/json"
	"flatman/backend/core/domain"
	"flatman/backend/core/ports"
	"fmt"
	"os"
	"time"
)

// AppService é a fachada principal do backend para o Wails
type AppService struct {
	loader     *FBSLoader
	manager    *SchemaManager
	converter  *FBConverter
	httpClient ports.HTTPClient
	wsClient   ports.WSClient
}

// NewAppService cria uma nova instância do serviço principal
func NewAppService(
	loader *FBSLoader,
	manager *SchemaManager,
	converter *FBConverter,
	httpClient ports.HTTPClient,
	wsClient ports.WSClient,
) *AppService {
	return &AppService{
		loader:     loader,
		manager:    manager,
		converter:  converter,
		httpClient: httpClient,
		wsClient:   wsClient,
	}
}

// LoadSchemas carrega arquivos .fbs de um diretório e coleções flatman.json
func (s *AppService) LoadSchemas(ctx context.Context, dirPath string) (*domain.LoadResult, error) {
	result, err := s.loader.LoadFromDirectory(dirPath)
	if err != nil {
		return nil, err
	}

	for _, sc := range result.Schemas {
		s.manager.AddSchema(&sc)
	}

	return result, nil
}

// ExecuteRequest executa uma requisição REST com Flatbuffers e Headers customizados, incluindo suporte a retry.
func (s *AppService) ExecuteRequest(ctx context.Context, schemaPath string, url string, method string, jsonPayload string, headers map[string]string, maxRetries int, delayMs int) (*ports.HTTPResponse, error) {
	// 1. Converte JSON para Binário
	bin, err := s.converter.JSONToBinary(schemaPath, jsonPayload)
	if err != nil {
		return nil, fmt.Errorf("serialization error: %w", err)
	}

	// 2. Mesclar Headers padrão com customizados
	reqHeaders := map[string]string{
		"Content-Type": "application/x-flatbuffers",
		"Accept":       "application/x-flatbuffers, application/json",
	}
	for k, v := range headers {
		reqHeaders[k] = v
	}

	// 3. Envia requisição (com retry)
	req := &ports.HTTPRequest{
		Method:  method,
		URL:     url,
		Body:    bin,
		Headers: reqHeaders,
	}

	var resp *ports.HTTPResponse
	var reqErr error

	if maxRetries < 0 {
		maxRetries = 0
	}

	for i := 0; i <= maxRetries; i++ {
		resp, reqErr = s.httpClient.Do(ctx, req)

		// Verifica se a requisição foi bem-sucedida
		if reqErr == nil && resp.StatusCode >= 200 && resp.StatusCode < 400 {
			return resp, nil // Sucesso, não precisa de retry
		}

		if i < maxRetries {
			// Aguarda antes do próximo retry (respeitando o Contexto)
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(time.Duration(delayMs) * time.Millisecond):
			}
		}
	}

	if reqErr != nil {
		return nil, fmt.Errorf("http error after %d retries: %w", maxRetries, reqErr)
	}

	// Retorna a última resposta (com falha), caso reqErr seja nulo mas StatusCode > 400
	return resp, nil
}

// DecodeResponse decodifica um corpo binário para JSON
func (s *AppService) DecodeResponse(ctx context.Context, schemaPath string, binaryData []byte) (string, error) {
	return s.converter.BinaryToJSON(schemaPath, binaryData)
}

// SaveCollection persiste uma coleção no disco (flatman.json)
func (s *AppService) SaveCollection(ctx context.Context, col domain.Collection) error {
	if col.FilePath == "" {
		return fmt.Errorf("file path is required")
	}

	data, err := json.MarshalIndent(col, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal collection: %w", err)
	}

	return os.WriteFile(col.FilePath, data, 0644)
}

// ConnectWS estabelece uma conexão WebSocket e inicia o monitoramento de mensagens
func (s *AppService) ConnectWS(ctx context.Context, url string, headers map[string]string, onMessage func(jsonMsg string, err error)) error {
	err := s.wsClient.Connect(ctx, url, headers)
	if err != nil {
		return err
	}

	// Goroutine de recebimento
	go func() {
		for {
			msg, err := s.wsClient.Receive(ctx)
			if err != nil {
				onMessage("", err)
				return
			}
			
			// Tentativa de decodificação genérica (usando o último schema gerenciado ou o que estiver configurado no manager)
			// Nota: No futuro, o WS pode precisar de um schemaPath fixo por conexão.
			// Por enquanto, tentamos decodificar com o que estiver disponível se for binário.
			jsonMsg, err := s.converter.BinaryToJSON("", msg.Data)
			if err != nil {
				// Se falhar a decodificação, enviamos como string ou hexa se possível
				onMessage(string(msg.Data), nil)
			} else {
				onMessage(jsonMsg, nil)
			}
		}
	}()

	return nil
}

// SendWS envia um JSON serializado para Flatbuffer via WebSocket
func (s *AppService) SendWS(ctx context.Context, schemaPath string, jsonPayload string) error {
	bin, err := s.converter.JSONToBinary(schemaPath, jsonPayload)
	if err != nil {
		return fmt.Errorf("serialization error: %w", err)
	}

	return s.wsClient.Send(ctx, &ports.WSMessage{
		Type: 2, // Binary Message
		Data: bin,
	})
}

// DisconnectWS encerra a conexão WebSocket
func (s *AppService) DisconnectWS() error {
	return s.wsClient.Close()
}
