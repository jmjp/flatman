package domain

// FieldInfo representa um campo de uma tabela/struct
type FieldInfo struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

// TypeInfo representa uma tabela ou struct no schema
type TypeInfo struct {
	Name   string      `json:"name"`
	Fields []FieldInfo `json:"fields"`
}

// SchemaInfo representa um arquivo .fbs carregado e seus metadados extraídos
type SchemaInfo struct {
	ID        string     `json:"id"`
	Path      string     `json:"path"`
	Types     []TypeInfo `json:"types"`     // Detalhes de cada tipo encontrado
	Namespace string     `json:"namespace"` // Ex: "com.flatman.api"
}

// SavedRequest define uma entrada no arquivo de configuração da coleção (flatman.json)
type SavedRequest struct {
	ID       string            `json:"id"`
	Name     string            `json:"name"`
	URL      string            `json:"url"`
	Method   string            `json:"method"`
	Schema   string            `json:"schema"`   // ID/Path do schema associado
	RootType string            `json:"rootType"` // Nome da tabela raiz
	Headers  map[string]string `json:"headers"`
	Payload  string            `json:"payload"` // Opcional: payload padrão
}

// Collection representa o agrupamento de requisições salvas
type Collection struct {
	Name     string         `json:"name"`
	Requests []SavedRequest `json:"requests"`
	FilePath string         `json:"filePath"` // Onde o JSON está salvo (injetado no carregamento)
}

// LoadResult é o envelope para o carregamento do workspace
type LoadResult struct {
	Schemas     []SchemaInfo `json:"schemas"`
	Collections []Collection `json:"collections"`
}
