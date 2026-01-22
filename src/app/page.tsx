import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get recent entries for stats
  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const technicalTrades = entries?.filter(e => e.type === 'technical' && e.result) || []
  const wins = technicalTrades.filter(t => t.result === 'win').length
  const totalTrades = technicalTrades.length
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0
  const totalPnL = technicalTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)

  return (
    <DashboardClient
      user={user}
      stats={{
        totalTrades,
        winRate,
        totalPnL,
        totalEntries: entries?.length || 0
      }}
    />
  )
}
