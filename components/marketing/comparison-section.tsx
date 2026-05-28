import { Check, X, Minus } from 'lucide-react'

type Cell = 'yes' | 'no' | 'sometimes' | string

interface ComparisonRow {
  feature: string
  invora: Cell
  generic: Cell
  excel: Cell
}

const ROWS: ComparisonRow[] = [
  { feature: 'Speciaal voor zorgprofessionals', invora: 'yes', generic: 'no', excel: 'no' },
  { feature: 'BTW-vrijstelling automatisch', invora: 'yes', generic: 'no', excel: 'no' },
  { feature: 'iDEAL betaallink', invora: 'yes', generic: 'sometimes', excel: 'no' },
  { feature: 'Automatische herinneringen', invora: 'yes', generic: 'sometimes', excel: 'no' },
  { feature: 'Urenregistratie', invora: 'yes', generic: 'sometimes', excel: 'no' },
  { feature: 'Professionele PDF facturen', invora: 'yes', generic: 'yes', excel: 'no' },
  { feature: 'Eenvoudig te gebruiken', invora: 'yes', generic: 'no', excel: 'no' },
  { feature: 'Prijs', invora: '€12/mnd', generic: '€15–35/mnd', excel: 'Gratis' },
]

function CellIcon({ value, highlight }: { value: Cell; highlight?: boolean }) {
  if (value === 'yes') {
    return (
      <Check
        className={highlight ? 'text-invora-primary mx-auto size-5' : 'text-invora-text-muted mx-auto size-5'}
        strokeWidth={3}
      />
    )
  }
  if (value === 'no') {
    return <X className="text-invora-error/70 mx-auto size-5" strokeWidth={3} />
  }
  if (value === 'sometimes') {
    return (
      <span className="text-invora-text-muted inline-flex items-center gap-1 text-xs">
        <Minus className="size-3.5" />
        Soms
      </span>
    )
  }
  return (
    <span className={highlight ? 'text-invora-primary text-sm font-semibold' : 'text-invora-text-muted text-sm'}>
      {value}
    </span>
  )
}

export function ComparisonSection() {
  return (
    <section className="bg-invora-surface">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-invora-text text-3xl font-bold tracking-tight sm:text-4xl">
            Waarom zorgprofessionals kiezen voor Invora
          </h2>
          <p className="text-invora-text-muted mt-4 text-base sm:text-lg">
            Een eerlijke vergelijking met andere opties.
          </p>
        </div>

        <div className="mt-12 overflow-x-auto">
          <table className="mx-auto min-w-[560px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="text-invora-text-muted px-4 py-4 text-left text-xs font-medium uppercase tracking-wide">
                  Functie
                </th>
                <th className="bg-invora-primary-light/60 border-invora-primary rounded-t-xl border-2 border-b-0 px-4 py-4 text-center">
                  <div className="font-heading text-invora-primary-dark text-base font-bold">
                    Invora
                  </div>
                </th>
                <th className="text-invora-text-muted px-4 py-4 text-center text-sm font-medium">
                  Generieke factuurapp
                </th>
                <th className="text-invora-text-muted px-4 py-4 text-center text-sm font-medium">
                  Excel
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, index) => {
                const last = index === ROWS.length - 1
                return (
                  <tr key={row.feature}>
                    <td className="text-invora-text border-border border-t px-4 py-3.5 font-medium">
                      {row.feature}
                    </td>
                    <td
                      className={
                        'bg-invora-primary-light/40 border-invora-primary border-x-2 border-t border-t-invora-primary/30 px-4 py-3.5 text-center ' +
                        (last ? 'rounded-b-xl border-b-2' : '')
                      }
                    >
                      <CellIcon value={row.invora} highlight />
                    </td>
                    <td className="border-border border-t px-4 py-3.5 text-center">
                      <CellIcon value={row.generic} />
                    </td>
                    <td className="border-border border-t px-4 py-3.5 text-center">
                      <CellIcon value={row.excel} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-invora-text-muted mt-4 text-center text-xs sm:hidden">
          ← Sleep horizontaal om alle kolommen te zien
        </p>
      </div>
    </section>
  )
}
