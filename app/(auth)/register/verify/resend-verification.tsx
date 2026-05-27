'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const COOLDOWN_SECONDS = 60

export function ResendVerification() {
  const [email, setEmail] = useState<string>('')
  const [needsEmailInput, setNeedsEmailInput] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('invora_pending_email')
      if (stored) {
        setEmail(stored)
      } else {
        setNeedsEmailInput(true)
      }
    } catch {
      setNeedsEmailInput(true)
    }
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleResend() {
    if (!email) {
      setNeedsEmailInput(true)
      return
    }
    setLoading(true)
    setStatus('idle')

    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (error) {
      setStatus('error')
      return
    }

    setStatus('sent')
    setCooldown(COOLDOWN_SECONDS)
  }

  return (
    <div className="space-y-3">
      {needsEmailInput && (
        <Input
          type="email"
          placeholder="E-mailadres waarop je je hebt aangemeld"
          className="h-11"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      )}

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full"
        disabled={loading || cooldown > 0 || !email}
        onClick={handleResend}
      >
        {cooldown > 0
          ? `Opnieuw versturen in ${cooldown}s`
          : loading
            ? 'Versturen…'
            : 'Bevestigingsmail opnieuw sturen'}
      </Button>

      {status === 'sent' && (
        <p className="text-invora-success text-xs">E-mail verstuurd. Controleer je inbox.</p>
      )}
      {status === 'error' && (
        <p className="text-destructive text-xs">
          Versturen mislukt. Controleer het e-mailadres en probeer opnieuw.
        </p>
      )}
    </div>
  )
}
