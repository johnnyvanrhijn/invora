import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Invora',
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-invora-background min-h-screen">{children}</div>
}
