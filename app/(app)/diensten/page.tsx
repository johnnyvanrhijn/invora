import type { Metadata } from 'next'
import { DienstenClient } from './diensten-client'

export const metadata: Metadata = { title: 'Diensten' }

export default function DienstenPage() {
  return <DienstenClient />
}
