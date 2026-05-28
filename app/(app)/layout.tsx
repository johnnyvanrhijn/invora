import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getSidebarCollapsedFromCookie, SIDEBAR_COOKIE_NAME } from '@/lib/sidebar'
import { AppSidebar } from '@/components/app/app-sidebar'
import { BottomNav } from '@/components/app/bottom-nav'
import { MobileLayoutWrapper } from '@/components/app/mobile-layout-wrapper'
import { SubscriptionBanner } from '@/components/app/subscription-banner'

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000
const ONE_DAY_MS = 24 * 60 * 60 * 1000

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('first_name, subscription_status, trial_ends_at, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  if (!profile.onboarding_completed) redirect('/welcome')

  // Sidebar voorkeur uit cookie zodat we de juiste breedte direct serven
  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get(SIDEBAR_COOKIE_NAME)
  const defaultCollapsed = getSidebarCollapsedFromCookie(sidebarCookie?.value)

  const isReadOnly =
    profile.subscription_status === 'trial_expired' ||
    profile.subscription_status === 'cancelled'

  const now = Date.now()
  const trialEndsAtMs = profile.trial_ends_at ? new Date(profile.trial_ends_at).getTime() : 0
  const trialEndsSoon =
    profile.subscription_status === 'trial' &&
    trialEndsAtMs > 0 &&
    trialEndsAtMs - now <= FIVE_DAYS_MS

  const trialDaysLeft = trialEndsAtMs > 0 ? Math.max(0, Math.ceil((trialEndsAtMs - now) / ONE_DAY_MS)) : 0

  return (
    <div className="bg-invora-background flex h-screen overflow-hidden">
      <AppSidebar firstName={profile.first_name} defaultCollapsed={defaultCollapsed} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileLayoutWrapper firstName={profile.first_name} />

        <SubscriptionBanner
          isReadOnly={isReadOnly}
          trialEndsSoon={trialEndsSoon}
          trialDaysLeft={trialDaysLeft}
          subscriptionStatus={profile.subscription_status}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 pb-24 md:p-6 lg:p-8 lg:pb-8">{children}</div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
