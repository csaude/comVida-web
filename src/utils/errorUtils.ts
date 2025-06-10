export function extractApiErrorMessage(err: any): string {
  // Caso tenha violations (ex: validação do Micronaut / Bean Validation)
  const violations = err?.response?.data?.violations
  if (Array.isArray(violations) && violations.length > 0) {
    // Mapeia e junta as mensagens
    const messages = violations.map((v: any) => {
      if (v.field && v.message) {
        return `${v.field}: ${v.message}`
      }
      return v.message || ''
    })
    return messages.join(' | ')
  }

  // Tenta pegar message, detail ou error
  return (
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    err?.response?.data?.error ||
    err?.message ||
    'Erro desconhecido'
  )
}
