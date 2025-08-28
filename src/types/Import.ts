// Tipos auxiliares (opcional: podes mover para um ficheiro types)
type ImportRowPayload = {
  name: string
  surname: string
  username: string
  integratedSystem?: string | null
  idOnIntegratedSystem?: string | null
  email?: string | null
  phone?: string | null
}

type ValidateImportResult = {
  errors: Array<{
    index: number        // índice 0-based da linha enviada
    username?: string    // username daquela linha (se enviado)
    messages: string[]   // mensagens de validação
  }>
}