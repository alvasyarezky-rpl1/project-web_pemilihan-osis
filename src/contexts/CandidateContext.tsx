"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Candidate } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

interface CandidateContextType {
  candidates: Candidate[]
  loading: boolean
  addCandidate: (candidate: Omit<Candidate, 'id' | 'created_at' | 'update_at'>) => void
  updateCandidate: (id: number, candidate: Partial<Candidate>) => void
  deleteCandidate: (id: number) => void
  refreshCandidates: () => Promise<void>
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined)

export function CandidateProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('id, name, class, photo_url, vision, mission, votes, created_at, update_at')
        .order('id', { ascending: false })

      if (error) throw error
      setCandidates(data || [])
    } catch (error) {
      console.error('Error fetching candidates:', error)
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
