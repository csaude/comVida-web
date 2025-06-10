import { useSwal } from 'src/composables/shared/dialog/dialog'
import { extractApiErrorMessage } from 'src/utils/errorUtils'

export function useApiErrorHandler() {
  const { alertError } = useSwal()

  const handleApiError = (err: any, contextMessage: string) => {
    console.error(`${contextMessage}:`, err)
    const apiMessage = extractApiErrorMessage(err)
    alertError(`${contextMessage}: ${apiMessage}`)
  }

  return {
    handleApiError
  }
}
