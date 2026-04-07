package ports

import (
	"context"
	"flatman/backend/core/domain"
)

// Repository define as operações de persistência do Flatman
type Repository interface {
	SaveSchema(ctx context.Context, schema *domain.SchemaInfo) error
	GetSchemas(ctx context.Context) ([]*domain.SchemaInfo, error)
	DeleteSchema(ctx context.Context, id string) error
	
	AddToHistory(ctx context.Context, entry *domain.HistoryEntry) error
	GetHistory(ctx context.Context, limit int) ([]*domain.HistoryEntry, error)
}
