import type { Metadata } from 'next'
import { ClientenClient } from './clienten-client'

export const metadata: Metadata = { title: 'Cliënten' }

export default function ClientenPage() {
  return <ClientenClient />
}
