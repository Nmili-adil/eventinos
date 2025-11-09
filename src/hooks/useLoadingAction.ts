import { useLoading } from '@/contexts/LoadingContext'

/**
 * Custom hook to execute async actions with automatic loading state management
 * 
 * @example
 * const executeWithLoading = useLoadingAction()
 * 
 * // Use it
 * await executeWithLoading(
 *   () => fetchData(),
 *   'Loading data...'
 * )
 */
export function useLoadingAction() {
  const { setLoading } = useLoading()

  const executeWithLoading = async <T>(
    action: () => Promise<T>,
    loadingMessage: string = 'Chargement...'
  ): Promise<T> => {
    setLoading(true, loadingMessage)
    try {
      return await action()
    } finally {
      setLoading(false)
    }
  }

  return executeWithLoading
}

/**
 * Example usage:
 * 
 * function MyComponent() {
 *   const execute = useLoadingAction()
 *   
 *   const loadData = async () => {
 *     const data = await execute(
 *       () => fetchData(),
 *       'Loading data...'
 *     )
 *     console.log(data)
 *   }
 *   
 *   return <button onClick={loadData}>Load</button>
 * }
 */
