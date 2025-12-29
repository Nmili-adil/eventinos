/**
 * TEST COMPONENT - Error Handling Demo
 * 
 * This component demonstrates how the global error handling works.
 * You can add this to a route temporarily to test the error handling.
 * 
 * DO NOT USE IN PRODUCTION - FOR TESTING ONLY
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { api } from '@/lib/apiClient'
import { handleAsyncError, isServerError } from '@/hooks/useGlobalErrorHandler'
import { AlertTriangle, Bug, ServerCrash, Zap } from 'lucide-react'

const ErrorHandlingTestPage = () => {
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Test 1: Simulate a component error (will be caught by ErrorBoundary)
  const [throwError, setThrowError] = useState(false)
  if (throwError) {
    throw new Error('Test component error - This should be caught by ErrorBoundary')
  }

  // Test 2: Simulate a 500 API error
  const testServerError = async () => {
    try {
      addResult('Testing 500 server error...')
      // This will fail because the endpoint doesn't exist
      // In reality, your backend would return a 500 error
      await api.get('/test-endpoint-that-returns-500')
    } catch (error: any) {
      addResult(`Caught error: ${error.message}`)
      
      if (isServerError(error)) {
        addResult('Correctly identified as server error')
      } else {
        addResult('Not a server error (404 or other)')
      }
      
      handleAsyncError(error, 'Test 500 error triggered')
    }
  }

  // Test 3: Simulate a client error
  const testClientError = async () => {
    try {
      addResult('Testing client error...')
      throw new Error('This is a client-side error')
    } catch (error: any) {
      addResult(`Caught error: ${error.message}`)
      handleAsyncError(error, 'Test client error triggered')
    }
  }

  // Test 4: Test promise rejection
  const testUnhandledRejection = () => {
    addResult('Testing unhandled promise rejection...')
    Promise.reject(new Error('Unhandled promise rejection test'))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-6 w-6" />
            Error Handling Test Page
          </CardTitle>
          <CardDescription>
            Test the global error handling system. Try different error scenarios below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Test 1: Component Error */}
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Test 1: Component Error
                </CardTitle>
                <CardDescription>
                  Throws an error that will be caught by ErrorBoundary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setThrowError(true)}
                  variant="destructive"
                  className="w-full"
                >
                  Trigger Component Error
                </Button>
              </CardContent>
            </Card>

            {/* Test 2: Server Error */}
            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ServerCrash className="h-5 w-5 text-red-600" />
                  Test 2: Server Error (500)
                </CardTitle>
                <CardDescription>
                  Simulates an API call that returns a 500 error
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testServerError}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Trigger 500 Error
                </Button>
              </CardContent>
            </Card>

            {/* Test 3: Client Error */}
            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Test 3: Client Error
                </CardTitle>
                <CardDescription>
                  Triggers a client-side error with toast notification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testClientError}
                  variant="outline"
                  className="w-full border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                >
                  Trigger Client Error
                </Button>
              </CardContent>
            </Card>

            {/* Test 4: Unhandled Rejection */}
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-purple-600" />
                  Test 4: Promise Rejection
                </CardTitle>
                <CardDescription>
                  Creates an unhandled promise rejection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testUnhandledRejection}
                  variant="outline"
                  className="w-full border-purple-600 text-purple-700 hover:bg-purple-100"
                >
                  Trigger Promise Rejection
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Test Results Log */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Test Results Log</CardTitle>
              <CardDescription>
                Watch the console and this log for error handling behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-auto">
                {testResults.length === 0 ? (
                  <div className="text-gray-500">No tests run yet. Click a test button above.</div>
                ) : (
                  testResults.map((result, index) => (
                    <div key={index} className="mb-1">
                      {result}
                    </div>
                  ))
                )}
              </div>
              {testResults.length > 0 && (
                <Button
                  onClick={() => setTestResults([])}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Clear Log
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Component Error:</strong> Will display the ServerErrorPage
              </p>
              <p>
                <strong>Server Error (500):</strong> Will show a toast notification and log the error
              </p>
              <p>
                <strong>Client Error:</strong> Will show a regular error toast
              </p>
              <p>
                <strong>Promise Rejection:</strong> Will be caught by global handler if configured
              </p>
              <p className="pt-2 border-t border-blue-300 mt-3">
                <strong>Note:</strong> Check the browser console for detailed error logs
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

export default ErrorHandlingTestPage
