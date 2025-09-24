"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Candidate } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

interface CandidateContextType {
  candidates: Candidate[]
  loading: boolean
  error: string | null
  addCandidate: (candidate: Omit<Candidate, 'id' | 'created_at' | 'update_at'>) => void
  updateCandidate: (id: number, candidate: Partial<Candidate>) => void
  deleteCandidate: (id: number) => void
  refreshCandidates: () => Promise<void>
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined)

export function CandidateProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCandidates = async () => {
    try {
      setError(null)
      console.log('Starting to fetch candidates...')
      
      const { data, error } = await supabase
        .from('candidates')
        .select('id, name, class, photo_url, vision, mission, votes, created_at, update_at')
        .order('id', { ascending: false })

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Database error: ${error.message}`)
      }

      if (!data) {
        console.warn('No data returned from Supabase')
        setCandidates([])
        return
      }

      console.log('Successfully fetched candidates:', data.length, 'items')
      setCandidates(data)
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Unknown error: ${JSON.stringify(error)}`
      
      console.error('Error fetching candidates:', {
        error: errorMessage,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        stack: error instanceof Error ? error.stack : undefined
      })
      
      setError(errorMessage)
      setCandidates([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const addCandidate = (candidateData: Omit<Candidate, 'id' | 'created_at' | 'update_at'>) => {
    // Optimistic update agar terasa responsif
    const optimistic: Candidate = {
      ...candidateData,
      votes: (candidateData as Partial<Candidate>).votes ?? 0,
      id: Math.max(0, ...candidates.map(c => Number(c.id))) + 1,
      created_at: new Date().toISOString(),
      update_at: new Date().toISOString(),
    } as Candidate
    setCandidates(prev => [optimistic, ...prev])
  }

  const updateCandidate = (id: number, candidateData: Partial<Candidate>) => {
    setCandidates(prev => 
      prev.map(candidate => 
        Number(candidate.id) === Number(id) 
          ? { ...candidate, ...candidateData }
          : candidate
      )
    )
  }

  const deleteCandidate = (id: number) => {
    setCandidates(prev => prev.filter(candidate => Number(candidate.id) !== Number(id)))
  }

  const refreshCandidates = async () => {
    setLoading(true)
    await fetchCandidates()
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  return (
    <CandidateContext.Provider 
      value={{ 
        candidates, 
        loading, 
        error,
        addCandidate, 
        updateCandidate, 
        deleteCandidate, 
        refreshCandidates 
      }}
    >
      {children}
    </CandidateContext.Provider>
  )
}

export function useCandidates() {
  const context = useContext(CandidateContext)
  if (context === undefined) {
    throw new Error('useCandidates must be used within a CandidateProvider')
  }
  return context
}
