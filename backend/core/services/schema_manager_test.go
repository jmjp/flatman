package services

import (
	"flatman/backend/core/domain"
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

func TestSchemaManager_AddSchema(t *testing.T) {
	sm := NewSchemaManager()

	schema1 := &domain.SchemaInfo{
		ID:   "1",
		Path: "/path/to/schema1.fbs",
	}

	schema2 := &domain.SchemaInfo{
		ID:   "2",
		Path: "/path/to/schema2.fbs",
	}

	// Test adding first schema
	sm.AddSchema(schema1)
	if len(sm.LoadedSchemas) != 1 {
		t.Errorf("Expected 1 schema, got %d", len(sm.LoadedSchemas))
	}
	if sm.LoadedSchemas[schema1.Path] != schema1 {
		t.Errorf("Schema 1 was not correctly added to the map")
	}

	// Test adding second schema
	sm.AddSchema(schema2)
	if len(sm.LoadedSchemas) != 2 {
		t.Errorf("Expected 2 schemas, got %d", len(sm.LoadedSchemas))
	}
	if sm.LoadedSchemas[schema2.Path] != schema2 {
		t.Errorf("Schema 2 was not correctly added to the map")
	}

	// Test overwriting existing schema
	schema1Updated := &domain.SchemaInfo{
		ID:   "1-updated",
		Path: "/path/to/schema1.fbs",
	}
	sm.AddSchema(schema1Updated)
	if len(sm.LoadedSchemas) != 2 {
		t.Errorf("Expected 2 schemas after update, got %d", len(sm.LoadedSchemas))
	}
	if sm.LoadedSchemas[schema1.Path] != schema1Updated {
		t.Errorf("Schema 1 was not correctly updated in the map")
	}
}
