import type { Metadata } from 'next'
import { ComingSoon } from '@/components/app/coming-soon'

export const metadata: Metadata = { title: 'Facturen' }

export default function FacturenPage() {
  return (
    <ComingSoon
      title="Facturen"
      description="Hier komen al je facturen. Wordt gebouwd in Fase 5."
    />
  )
}
