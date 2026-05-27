'use client'

import { useEffect, useState } from 'react'
import type { DashboardStats } from '@/types'
import { Greeting } from '@/components/app/dashboard/greeting'
import { KpiCards } from '@/components/app/dashboard/kpi-cards'
import { RevenueChart } from '@/components/app/dashboard/revenue-chart'
import { EmptyState } from '@/components/app/dashboard/empty-state'
import { DashboardSkeleton } from '@/components/app/dashboard/skeleton'
import {
  DesktopCoachMark,
  MobileCoachMark,
  useCoachMark,
} from '@/components/app/dashboard/coach-mark'

interface DashboardClientProps {
  firstName: string
}

export function DashboardClient({ firstName }: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { visible: coachVisible, dismiss: dismissCoach } = useCoachMark()

  useEffect(() => {
    let cancelled = false
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats', { cache: 'no-store' })
        if (!response.ok) {
          if (!cancelled) {
            setError('Kon dashboard gegevens niet laden. Probeer het opnieuw.')
            setLoading(false)
          }
          return
        }
        const data = (await response.json()) as DashboardStats
        if (!cancelled) {
          setStats(data)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('Er is een fout opgetreden. Probeer het opnieuw.')
          setLoading(false)
        }
      }
    }
    fetchStats()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <Greeting firstName={firstName} />
        <div
          role="alert"
          className="bg-destructive/10 text-destructive border-destructive/20 rounded-md border px-4 py-3 text-sm"
        >
          {error ?? 'Er is iets misgegaan bij het laden van het dashboard.'}
        </div>
      </div>
    )
  }

  const isEmpty =
    stats.omzet_deze_maand === 0 &&
    stats.openstaand_bedrag === 0 &&
    stats.laatste_facturen.length === 0

  return (
    <>
      <div className="space-y-6">
        <Greeting firstName={firstName} />

        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            <KpiCards
              omzetDezeMaand={stats.omzet_deze_maand}
              openstaandBedrag={stats.openstaand_bedrag}
              laatsteFacturen={stats.laatste_facturen}
            />
            <RevenueChart data={stats.omzet_per_maand} />
          </>
        )}
      </div>

      {/* Coach mark voor mobiele bottomnav */}
      <MobileCoachMark visible={coachVisible} onDismiss={dismissCoach} />

      {/* Coach mark voor desktop — wijst naar de empty-state CTA als die zichtbaar is */}
      {isEmpty && (
        <DesktopCoachMark
          visible={coachVisible}
          targetId="empty-state-cta"
          onDismiss={dismissCoach}
        />
      )}
    </>
  )
}
