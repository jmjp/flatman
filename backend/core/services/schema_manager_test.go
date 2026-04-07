package services

import (
	"testing"
)

func TestSchemaManager_Initialization(t *testing.T) {
	sm := NewSchemaManager() // Ainda n\u00e3o existe, o teste deve falhar (RED)
	if sm == nil {
		t.Fatal("SchemaManager should not be nil")
	}
	if len(sm.LoadedSchemas) != 0 {
		t.Errorf("Expected 0 schemas, got %d", len(sm.LoadedSchemas))
	}
}
