import type { Metadata } from 'next'
import { ComingSoon } from '@/components/app/coming-soon'

export const metadata: Metadata = { title: 'Uren' }

export default function UrenPage() {
  return (
    <ComingSoon
      title="Uren"
      description="Registreer je uren. Wordt gebouwd in Fase 7."
    />
  )
}
