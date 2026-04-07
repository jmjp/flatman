package services

import (
	"encoding/json"
	"flatman/backend/core/domain"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// FBSLoader identifica e extrai metadados de arquivos .fbs
type FBSLoader struct{}

func NewFBSLoader() *FBSLoader {
	return &FBSLoader{}
}

// LoadFromDirectory lê um diretório e identifica arquivos de schema e coleções (flatman.json)
func (f *FBSLoader) LoadFromDirectory(dirPath string) (*domain.LoadResult, error) {
	files, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, err
	}

	result := &domain.LoadResult{
		Schemas:     []domain.SchemaInfo{},
		Collections: []domain.Collection{},
	}

	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".fbs") {
			fullPath := filepath.Join(dirPath, file.Name())
			content, err := os.ReadFile(fullPath)
			if err != nil {
				continue
			}

			info := f.parseFBS(string(content))
			info.Path = fullPath
			info.ID = filepath.Base(fullPath)
			result.Schemas = append(result.Schemas, *info)
		}

		// Carregar Coleções (flatman.json)
		if !file.IsDir() && file.Name() == "flatman.json" {
			fullPath := filepath.Join(dirPath, file.Name())
			content, err := os.ReadFile(fullPath)
			if err == nil {
				var col domain.Collection
				if err := json.Unmarshal(content, &col); err == nil {
					col.FilePath = fullPath
					result.Collections = append(result.Collections, col)
				} else {
					// Tentar unmarshal como array caso existam várias coleções
					var cols []domain.Collection
					if err := json.Unmarshal(content, &cols); err == nil {
						for i := range cols {
							cols[i].FilePath = fullPath
						}
						result.Collections = append(result.Collections, cols...)
					}
				}
			}
		}
	}

	return result, nil
}

// parseFBS extrai namespace e tipos com campos via Regex
func (f *FBSLoader) parseFBS(content string) *domain.SchemaInfo {
	info := &domain.SchemaInfo{
		Types: make([]domain.TypeInfo, 0),
	}

	// Regex para namespace
	nsRegex := regexp.MustCompile(`namespace\s+([a-zA-Z0-9.]+);`)
	if match := nsRegex.FindStringSubmatch(content); len(match) > 1 {
		info.Namespace = match[1]
	}

	// Regex para capturar blocos 'table Name { fields... }'
	tableBlockRegex := regexp.MustCompile(`table\s+([a-zA-Z0-9_]+)\s*\{([^}]*)\}`)
	tableMatches := tableBlockRegex.FindAllStringSubmatch(content, -1)
	
	fieldRegex := regexp.MustCompile(`\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_\[\]]+)\s*;`)

	for _, match := range tableMatches {
		if len(match) > 2 {
			tableName := match[1]
			tableContent := match[2]
			
			typeInfo := domain.TypeInfo{
				Name:   tableName,
				Fields: make([]domain.FieldInfo, 0),
			}

			// Extrair campos do conteúdo do bloco
			fieldMatches := fieldRegex.FindAllStringSubmatch(tableContent, -1)
			for _, fMatch := range fieldMatches {
				if len(fMatch) > 2 {
					typeInfo.Fields = append(typeInfo.Fields, domain.FieldInfo{
						Name: fMatch[1],
						Type: fMatch[2],
					})
				}
			}

			info.Types = append(info.Types, typeInfo)
		}
	}

	return info
}
