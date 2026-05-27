import type { Metadata } from 'next'
import { ComingSoon } from '@/components/app/coming-soon'

export const metadata: Metadata = { title: 'Rapporten' }

export default function RapportenPage() {
  return (
    <ComingSoon
      title="Rapporten"
      description="Omzet en urenrapporten. Wordt gebouwd in Fase 10."
    />
  )
}
