package services

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// FBConverter orquestra a convers\u00e3o entre JSON e Flatbuffers usando o flatc
type FBConverter struct{}

func NewFBConverter() *FBConverter {
	return &FBConverter{}
}

// JSONToBinary converte uma string JSON para um []byte do Flatbuffers
func (c *FBConverter) JSONToBinary(schemaPath string, jsonStr string) ([]byte, error) {
	tmpDir, err := os.MkdirTemp("", "flatman_conv")
	if err != nil {
		return nil, err
	}
	defer os.RemoveAll(tmpDir)

	jsonPath := "data.json"
	if err := os.WriteFile(filepath.Join(tmpDir, jsonPath), []byte(jsonStr), 0644); err != nil {
		return nil, err
	}

	// Copiar schema para o diret\u00f3rio tempor\u00e1rio para facilitar o uso do flatc
	schemaBase := filepath.Base(schemaPath)
	schemaRaw, err := os.ReadFile(schemaPath)
	if err != nil {
		return nil, err
	}
	if err := os.WriteFile(filepath.Join(tmpDir, schemaBase), schemaRaw, 0644); err != nil {
		return nil, err
	}

	// Executa flatc --binary -o . <schema> <data.json>
	cmd := exec.Command("flatc", "--binary", "-o", ".", schemaBase, jsonPath)
	cmd.Dir = tmpDir
	out, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Serialization Debug:\nCMD: flatc --binary -o . %s %s\nDIR: %s\nERR: %v\nOUT: %s\n", schemaBase, jsonPath, tmpDir, err, string(out))
		return nil, fmt.Errorf("flatc error: %v", err)
	}

	binPath := filepath.Join(tmpDir, "data.bin") // flatc por padr\u00e3o usa o nome do json
	return os.ReadFile(binPath)
}

// BinaryToJSON decodifica um []byte do Flatbuffers de volta para JSON
func (c *FBConverter) BinaryToJSON(schemaPath string, binData []byte) (string, error) {
	tmpDir, err := os.MkdirTemp("", "flatman_dec")
	if err != nil {
		return "", err
	}
	defer os.RemoveAll(tmpDir)

	binBase := "data.bin"
	if err := os.WriteFile(filepath.Join(tmpDir, binBase), binData, 0644); err != nil {
		return "", err
	}

	// Copiar schema
	schemaBase := filepath.Base(schemaPath)
	schemaRaw, err := os.ReadFile(schemaPath)
	if err != nil {
		return "", err
	}
	if err := os.WriteFile(filepath.Join(tmpDir, schemaBase), schemaRaw, 0644); err != nil {
		return "", err
	}

	// Executa flatc -t --raw-binary <schema> -- <data.bin>
	cmd := exec.Command("flatc", "-t", "--raw-binary", schemaBase, "--", binBase)
	cmd.Dir = tmpDir
	out, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Decoding Debug:\nCMD: flatc -t --raw-binary %s -- %s\nDIR: %s\nERR: %v\nOUT: %s\n", schemaBase, binBase, tmpDir, err, string(out))
		return "", fmt.Errorf("flatc decode error: %v", err)
	}

	jsonPath := filepath.Join(tmpDir, "data.json")
	res, err := os.ReadFile(jsonPath)
	return string(res), err
}

func (c *FBConverter) listDir(path string) []string {
	files, _ := os.ReadDir(path)
	names := make([]string, 0, len(files))
	for _, f := range files {
		names = append(names, f.Name())
	}
	return names
}
