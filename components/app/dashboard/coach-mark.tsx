'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const COACH_MARK_STORAGE_KEY = 'invora_coach_mark_seen'
const COACH_MARK_AUTO_DISMISS_MS = 10_000

export function useCoachMark() {
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get('coach') !== 'true') return
    let alreadySeen = false
    try {
      alreadySeen = localStorage.getItem(COACH_MARK_STORAGE_KEY) === 'true'
    } catch {
      // localStorage niet beschikbaar — toon coach mark eenmalig
    }
    if (alreadySeen) return

    setVisible(true)

    // Verwijder ?coach=true uit URL zonder navigatie
    const url = new URL(window.location.href)
    url.searchParams.delete('coach')
    window.history.replaceState({}, '', url.toString())
  }, [searchParams])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(dismiss, COACH_MARK_AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [visible])

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(COACH_MARK_STORAGE_KEY, 'true')
    } catch {
      // negeren
    }
  }

  return { visible, dismiss }
}

interface CoachMarkProps {
  visible: boolean
  onDismiss: () => void
}

/**
 * Mobiele bottomnav-versie: pulse-ring + tooltip rondom de centrale Nieuw knop.
 * De ring positioneert zich op de centrale knop (bottom-10, midden van het
 * scherm). Verbergen op desktop want daar is geen bottomnav.
 */
export function MobileCoachMark({ visible, onDismiss }: CoachMarkProps) {
  if (!visible) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-10 z-40 flex justify-center lg:hidden">
      <div className="relative size-14">
        <span
          className="bg-invora-primary animate-pulse-ring absolute inset-0 rounded-xl opacity-60"
          aria-hidden
        />
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-invora-text px-3 py-1.5 text-xs text-white shadow-md">
          Klik hier om je eerste factuur aan te maken
          <span
            aria-hidden
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{ borderTopColor: 'var(--color-invora-text)' }}
          />
        </div>
        {/* Onzichtbare click-target om dismissable te maken via tap */}
        <button
          type="button"
          onClick={onDismiss}
          className="pointer-events-auto absolute inset-0 cursor-pointer opacity-0"
          aria-label="Coach mark sluiten"
        />
      </div>
    </div>
  )
}

/**
 * Desktop-versie: ring rondom een DOM-element met een gegeven id.
 * Wordt gebruikt op de lege-staat CTA-knop in het dashboard.
 */
export function DesktopCoachMark({
  visible,
  targetId,
  onDismiss,
}: CoachMarkProps & { targetId: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!visible) {
      setRect(null)
      return
    }
    const update = () => {
      const el = document.getElementById(targetId)
      setRect(el ? el.getBoundingClientRect() : null)
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [visible, targetId])

  if (!visible || !rect) return null

  const padding = 8
  return (
    <div
      className="pointer-events-none fixed z-40 hidden lg:block"
      style={{
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }}
    >
      <span
        className="bg-invora-primary animate-pulse-ring absolute inset-0 rounded-xl opacity-60"
        aria-hidden
      />
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-invora-text px-3 py-1.5 text-xs text-white shadow-md">
        Klik hier om je eerste factuur aan te maken
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="pointer-events-auto absolute inset-0 cursor-pointer opacity-0"
        aria-label="Coach mark sluiten"
      />
    </div>
  )
}
