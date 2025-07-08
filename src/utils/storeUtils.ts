/**
 * Substitui ou insere um item em uma lista de forma segura,
 * utilizando UUID como chave principal, com fallback por campo alternativo.
 */
export function replaceOrInsert<T extends { uuid?: string }>(
  list: T[],
  newItem: T,
  fallbackKey?: keyof T
): T[] {
  // 1. Tenta localizar por uuid
  let index = newItem.uuid
    ? list.findIndex(item => item.uuid === newItem.uuid)
    : -1

  // 2. Fallback por outro campo (ex: name, code, healthFacility, etc)
  if (index === -1 && fallbackKey && newItem[fallbackKey]) {
    index = list.findIndex(item => item[fallbackKey] === newItem[fallbackKey])
  }

  // 3. Substitui ou adiciona
  if (index !== -1) {
    list[index] = newItem
  } else {
    list.push(newItem)
  }

  // 4. Retorna cópia para manter reatividade
  return [...list]
}
