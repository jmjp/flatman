package main

import (
	"context"
	"flatman/backend/core/adapters/out"
	"flatman/backend/core/domain"
	"flatman/backend/core/services"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx     context.Context
	service *services.AppService
}

// NewApp creates a new App application struct
func NewApp() *App {
	// Inicializa dependências
	loader := services.NewFBSLoader()
	manager := services.NewSchemaManager()
	converter := services.NewFBConverter()
	rest := out.NewRESTAdapter()
	ws := out.NewWSAdapter()

	// Inicializa o serviço principal
	service := services.NewAppService(loader, manager, converter, rest, ws)

	return &App{
		service: service,
	}
}

// startup is called when the app starts.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// LoadSchemasFromDir carrega todos os arquivos .fbs de um diretório e coleções
func (a *App) LoadSchemasFromDir(dirPath string) (*domain.LoadResult, error) {
	return a.service.LoadSchemas(a.ctx, dirPath)
}

// SelectDirectory abre o seletor de pastas nativo e retorna o caminho
func (a *App) SelectDirectory() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Selecionar Pasta de Schemas (.fbs)",
	})
}

// ExecuteBinaryRequest envia um JSON que será serializado para Flatbuffers via Wails com Headers
func (a *App) ExecuteBinaryRequest(schemaPath, url, method, jsonPayload string, headers map[string]string) (string, error) {
	resp, err := a.service.ExecuteRequest(a.ctx, schemaPath, url, method, jsonPayload, headers)
	if err != nil {
		return "", err
	}

	// Decodifica resposta para JSON se possível
	decoded, err := a.service.DecodeResponse(a.ctx, schemaPath, resp.Body)
	if err != nil {
		return fmt.Sprintf("Binary Response (%d bytes): %v", len(resp.Body), err), nil
	}

	return decoded, nil
}

// SaveCollection salva as alterações em uma coleção
func (a *App) SaveCollection(col domain.Collection) error {
	return a.service.SaveCollection(a.ctx, col)
}

// ConnectWS estabelece conexão ws
func (a *App) ConnectWS(url string, headers map[string]string) error {
	return a.service.ConnectWS(a.ctx, url, headers, func(msg string, err error) {
		if err != nil {
			runtime.EventsEmit(a.ctx, "ws:error", err.Error())
			return
		}
		runtime.EventsEmit(a.ctx, "ws:message", msg)
	})
}

// SendWS envia mensagem binária via ws
func (a *App) SendWS(schemaPath, jsonPayload string) error {
	return a.service.SendWS(a.ctx, schemaPath, jsonPayload)
}

// DisconnectWS encerra ws
func (a *App) DisconnectWS() error {
	return a.service.DisconnectWS()
}
