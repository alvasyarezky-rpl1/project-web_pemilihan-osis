"use client"

import { useEffect, useState } from 'react'
import { supabase, DEMO_MODE } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TestSupabaseConnection() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')
  const [candidatesCount, setCandidatesCount] = useState<number>(0)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      console.log('🔧 DEMO_MODE:', DEMO_MODE)
      console.log('🔧 SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      if (DEMO_MODE) {
        setConnectionStatus('❌ DEMO MODE - Tidak menggunakan Supabase')
        return
      }

      // Test koneksi ke Supabase
      const { data, error } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('❌ Supabase error:', error)
        setError(error.message)
        setConnectionStatus('❌ Error: ' + error.message)
        return
      }

      console.log('✅ Supabase connection successful')
      setConnectionStatus('✅ Terhubung ke Supabase')
      setCandidatesCount(data?.length || 0)
    } catch (err) {
      console.error('❌ Connection test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setConnectionStatus('❌ Connection failed')
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Test Supabase Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <strong>Status:</strong> {connectionStatus}
        </div>
        <div>
          <strong>DEMO_MODE:</strong> {DEMO_MODE ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}
        </div>
        <div>
          <strong>Candidates Count:</strong> {candidatesCount}
        </div>
        {error && (
          <div className="text-red-600">
            <strong>Error:</strong> {error}
          </div>
        )}
        <button 
          onClick={testConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Again
        </button>
      </CardContent>
    </Card>
  )
}
