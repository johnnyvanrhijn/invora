import type { Metadata } from 'next'
import { ComingSoon } from '@/components/app/coming-soon'

export const metadata: Metadata = { title: 'Diensten' }

export default function DienstenPage() {
  return (
    <ComingSoon
      title="Diensten"
      description="Je diensten bibliotheek. Wordt gebouwd in Fase 4."
    />
  )
}
