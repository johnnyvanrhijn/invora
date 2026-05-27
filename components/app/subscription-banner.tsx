'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const TRIAL_BANNER_DISMISS_KEY = 'invora_trial_banner_dismissed'

interface SubscriptionBannerProps {
  isReadOnly: boolean
  trialEndsSoon: boolean
  trialDaysLeft: number
  subscriptionStatus: string
}

export function SubscriptionBanner({
  isReadOnly,
  trialEndsSoon,
  trialDaysLeft,
}: SubscriptionBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!trialEndsSoon) return
    try {
      setDismissed(sessionStorage.getItem(TRIAL_BANNER_DISMISS_KEY) === 'true')
    } catch {
      // sessionStorage niet beschikbaar — banner blijft zichtbaar
    }
  }, [trialEndsSoon])

  function dismiss() {
    setDismissed(true)
    try {
      sessionStorage.setItem(TRIAL_BANNER_DISMISS_KEY, 'true')
    } catch {
      // negeren
    }
  }

  if (isReadOnly) {
    return (
      <div
        role="alert"
        className="border-invora-warning/20 bg-invora-warning/10 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6"
      >
        <p className="text-invora-text text-sm">
          Je proefperiode is verlopen. Activeer je abonnement om door te gaan met factureren.
        </p>
        <Link
          href="/instellingen#abonnement"
          className="text-invora-primary hover:text-invora-primary-dark text-sm font-semibold underline"
        >
          Activeer abonnement →
        </Link>
      </div>
    )
  }

  if (trialEndsSoon && !dismissed) {
    const dagTekst = trialDaysLeft === 1 ? 'dag' : 'dagen'
    return (
      <div
        role="status"
        className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6"
      >
        <p className="text-sm text-amber-900">
          Je proefperiode verloopt over <strong>{trialDaysLeft}</strong> {dagTekst}. Activeer je
          abonnement om door te blijven werken.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/instellingen#abonnement"
            className="text-sm font-semibold text-amber-900 underline hover:text-amber-700"
          >
            Abonnement activeren →
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Banner sluiten"
            className="text-amber-700 transition-colors hover:text-amber-900"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    )
  }

  return null
}
