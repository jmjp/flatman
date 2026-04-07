package services

import (
	"os"
	"path/filepath"
	"testing"
)

func TestFBSLoader_LoadFromDirectory(t *testing.T) {
	// Setup: Criar um diret\u00f3rio tempor\u00e1rio com um arquivo .fbs fake
	tmpDir, err := os.MkdirTemp("", "flatman_test")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	fbsPath := filepath.Join(tmpDir, "user.fbs")
	fbsContent := `
		namespace com.flatman.test;
		table User {
			name:string;
			age:int;
		}
		root_type User;
	`
	if err := os.WriteFile(fbsPath, []byte(fbsContent), 0644); err != nil {
		t.Fatal(err)
	}

	loader := NewFBSLoader()
	result, err := loader.LoadFromDirectory(tmpDir)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if len(result.Schemas) != 1 {
		t.Errorf("Expected 1 schema, got %d", len(result.Schemas))
	}

	if result.Schemas[0].Namespace != "com.flatman.test" {
		t.Errorf("Expected namespace com.flatman.test, got %s", result.Schemas[0].Namespace)
	}
}
