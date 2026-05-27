import type { Metadata } from 'next'
import { ComingSoon } from '@/components/app/coming-soon'

export const metadata: Metadata = { title: 'Cliënten' }

export default function ClientenPage() {
  return (
    <ComingSoon
      title="Cliënten"
      description="Beheer je cliënten. Wordt gebouwd in Fase 4."
    />
  )
}
