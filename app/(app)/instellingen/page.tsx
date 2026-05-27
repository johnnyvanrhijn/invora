import type { Metadata } from 'next'
import { ComingSoon } from '@/components/app/coming-soon'

export const metadata: Metadata = { title: 'Instellingen' }

export default function InstellingenPage() {
  return (
    <ComingSoon
      title="Instellingen"
      description="Account en factuurinstellingen. Wordt gebouwd in Fase 9."
    />
  )
}
