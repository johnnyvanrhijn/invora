import type { Metadata } from 'next'
import { ComingSoon } from '@/components/app/coming-soon'

export const metadata: Metadata = { title: 'Nieuwe factuur' }

export default function NieuweFactuurPage() {
  return (
    <ComingSoon
      title="Nieuwe factuur"
      description="Factuur aanmaken. Wordt gebouwd in Fase 5."
    />
  )
}
