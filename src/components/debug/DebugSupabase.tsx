"use client"

import { useEffect, useState } from "react"
import { supabase, DEMO_MODE } from "@/lib/supabase"

export function DebugSupabase() {
  const [status, setStatus] = useState<string>("Checking...")
  const [envVars, setEnvVars] = useState<any>({})

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      DEMO_MODE: DEMO_MODE
    })

    // Test database connection
    const testConnection = async () => {
      try {
        if (DEMO_MODE) {
          setStatus("❌ DEMO_MODE - Tidak terhubung ke database real")
          return
        }

        const { data, error } = await supabase
          .from('candidates')
          .select('count')
          .limit(1)

        if (error) {
          setStatus(`❌ Error: ${error.message}`)
        } else {
          setStatus("✅ Terhubung ke database dengan benar!")
        }
      } catch (err) {
        setStatus(`❌ Connection Error: ${err}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold text-lg mb-2">🔧 Debug Supabase Connection</h3>
      
      <div className="space-y-2">
        <p><strong>Status:</strong> {status}</p>
        
        <div>
          <strong>Environment Variables:</strong>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Solusi:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Buat file <code>.env.local</code> di root project</li>
            <li>Isi dengan URL dan Key dari Supabase Dashboard</li>
            <li>Restart development server</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
