package services

import (
	"flatman/backend/core/domain"
	"sync"
)

// SchemaManager gerencia o estado global dos schemas carregados
type SchemaManager struct {
	LoadedSchemas map[string]*domain.SchemaInfo
	mu            sync.RWMutex
}

// NewSchemaManager cria uma nova instância do gerenciador
func NewSchemaManager() *SchemaManager {
	return &SchemaManager{
		LoadedSchemas: make(map[string]*domain.SchemaInfo),
	}
}

// AddSchema adiciona um schema carregado ao estado global
func (s *SchemaManager) AddSchema(schema *domain.SchemaInfo) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.LoadedSchemas[schema.Path] = schema
}
