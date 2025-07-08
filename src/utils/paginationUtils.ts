export function paginateArray<T>(array: T[], size: number): Record<number, T[]> {
  const pages: Record<number, T[]> = {}
  for (let i = 0; i < array.length; i += size) {
    const page = Math.floor(i / size)
    pages[page] = array.slice(i, i + size)
  }
  return pages
}

export function flattenPages<T>(pages: Record<number, T[]>): T[] {
  return Object.values(pages).flat()
}
