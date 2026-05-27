import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Invora',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Formulier kant — altijd zichtbaar */}
      <div className="bg-invora-background flex flex-1 flex-col justify-center px-6 py-12 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <span className="text-invora-primary text-2xl font-bold">Invora</span>
          </div>
          {children}
        </div>
      </div>

      {/* Decoratief paneel — alleen desktop */}
      <div className="from-invora-primary to-invora-primary-dark hidden bg-gradient-to-br p-12 lg:flex lg:flex-1 lg:flex-col lg:justify-between">
        <div />
        <div className="space-y-4">
          <p className="text-4xl leading-tight font-bold text-white">
            Factureren zonder gedoe.
          </p>
          <p className="text-lg text-white/80">
            Speciaal gebouwd voor therapeuten en zorgprofessionals in Nederland.
          </p>
        </div>
        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} Invora — Work Remote
        </p>
      </div>
    </div>
  )
}
