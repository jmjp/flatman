package services

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestFBConverter_JSONToBinary(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "fb_conv_test")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	fbsPath := filepath.Join(tmpDir, "simple.fbs")
	fbsContent := `
		namespace test;
		table Person {
			name:string;
			age:int;
		}
		root_type Person;
	`
	if err := os.WriteFile(fbsPath, []byte(fbsContent), 0644); err != nil {
		t.Fatal(err)
	}

	conv := NewFBConverter()
	jsonStr := `{"name": "Alice", "age": 30}`
	bin, err := conv.JSONToBinary(fbsPath, jsonStr)
	if err != nil {
		t.Fatalf("Failed to convert JSON to binary: %v", err)
	}

	if len(bin) == 0 {
		t.Error("Generated binary is empty")
	}

	// Agora decodifica de volta
	dec, err := conv.BinaryToJSON(fbsPath, bin)
	if err != nil {
		t.Fatalf("Failed to convert binary to JSON: %v", err)
	}

	// Verifica se cont\u00e9m os dados originais (pode ter formata\u00e7\u00e3o diferente)
	if !strings.Contains(dec, "Alice") || !strings.Contains(dec, "30") {
		t.Errorf("Decoded JSON mismatch. Got: %s", dec)
	}
}
