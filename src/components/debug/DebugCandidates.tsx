"use client"

import { useState, useEffect } from "react"
import { supabase, DEMO_MODE } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugCandidates() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<string>("")

  const fetchCandidates = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (DEMO_MODE) {
        setError("❌ Masih dalam DEMO_MODE - Cek environment variables")
        return
      }

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('tanggal_dibuat', { ascending: false })

      if (error) {
        setError(`❌ Database Error: ${error.message}`)
      } else {
        setCandidates(data || [])
        setError(null)
      }
    } catch (err: any) {
      setError(`❌ Connection Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testInsert = async () => {
    setLoading(true)
    setTestResult("")
    
    try {
      if (DEMO_MODE) {
        setTestResult("❌ Masih dalam DEMO_MODE")
        return
      }

      const testData = {
        nama: `Test Kandidat ${Date.now()}`,
        visi: "Test visi dari debug component",
        misi: "Test misi dari debug component",
        program_kerja: "Test program kerja dari debug component"
      }

      const { data, error } = await supabase
        .from('candidates')
        .insert(testData)

      if (error) {
        setTestResult(`❌ Insert Error: ${error.message}`)
      } else {
        setTestResult(`✅ Insert Berhasil! Data tersimpan`)
        fetchCandidates() // Refresh data
      }
    } catch (err: any) {
      setTestResult(`❌ Insert Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">🔧 Debug Candidates Database</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Status Koneksi:</h4>
            <p className="text-sm">
              {DEMO_MODE ? "❌ DEMO_MODE" : "✅ Database Mode"}
            </p>
            <p className="text-sm">
              Environment: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not Set"}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Actions:</h4>
            <div className="space-x-2">
              <Button onClick={fetchCandidates} disabled={loading} size="sm">
                {loading ? "Loading..." : "Refresh Data"}
              </Button>
              <Button onClick={testInsert} disabled={loading} size="sm" variant="outline">
                Test Insert
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        {testResult && (
          <div className="p-3 bg-blue-100 border border-blue-300 rounded text-blue-800 text-sm">
            {testResult}
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-2">Data Kandidat ({candidates.length}):</h4>
          <div className="max-h-40 overflow-y-auto">
            {candidates.length === 0 ? (
              <p className="text-gray-500 text-sm">Tidak ada data</p>
            ) : (
              <div className="space-y-1">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="text-xs bg-white p-2 rounded border">
                    <strong>{candidate.nama}</strong> - {candidate.visi?.substring(0, 50)}...
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
