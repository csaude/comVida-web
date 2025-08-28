export class DateUtils {
  /**
   * Converte um valor em um objeto `Date` válido ou retorna `null`.
   * @param input Pode ser Date, string, objeto com estrutura `_custom`, ou nulo.
   */
  static toDate(input: any): Date | null {
    if (!input) return null

    // Caso seja um Date já válido
    if (input instanceof Date && !isNaN(input.getTime())) return input

    // Caso seja uma string padrão ISO
    if (typeof input === 'string') {
      const date = new Date(input)
      return isNaN(date.getTime()) ? null : date
    }

    // Caso seja do tipo `{ _custom: { value: '2024-01-01T00:00:00.000' } }`
    if (typeof input === 'object' && input._custom?.value) {
      const date = new Date(input._custom.value)
      return isNaN(date.getTime()) ? null : date
    }

    return null
  }

  /**
   * Retorna uma string formatada a partir de uma data, no formato local.
   */
  static formatToLocalDateString(input: any): string {
    const date = DateUtils.toDate(input)
    return date ? date.toLocaleDateString() : ''
  }

  /**
   * Retorna uma string ISO (YYYY-MM-DD) de uma data.
   */
  static formatToISODate(input: any): string {
    const date = DateUtils.toDate(input)
    return date ? date.toISOString().split('T')[0] : ''
  }

  /**
   * Retorna uma string ISO com data e hora completa.
   */
  static formatToISODateTime(input: any): string {
    const date = DateUtils.toDate(input)
    return date ? date.toISOString() : ''
  }

  static formatDateToDDMMYYYY(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // janeiro = 0
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  static toISODate(val: string): string {
    if (!val || val === '-') return ''
    const [day, month, year] = val.split('-')
    return `${year}-${month}-${day}`
  }
}
