'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import EntryList from '@/components/journal/EntryList'
import EntryEditor from '@/components/journal/EntryEditor'
import { JournalEntry } from '@/types/database.types'
import { Plus, Search, List, Grid3X3 } from 'lucide-react'
import { User } from '@supabase/supabase-js'

export default function JournalPage() {
    const [user, setUser] = useState<User | null>(null)
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showEditor, setShowEditor] = useState(false)
    const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const [filterType, setFilterType] = useState<'all' | 'simple' | 'technical'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const supabase = createClient()
    const router = useRouter()

    const loadEntries = async (userId: string) => {
        setIsLoading(true)
        const { data } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (data) {
            setEntries(data as JournalEntry[])
        }
        setIsLoading(false)
    }

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)
            loadEntries(user.id)
        }
        getUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSaveEntry = async (entryData: Record<string, any>) => {
        if (!user) return

        try {
            if (editingEntry) {
                // Update existing entry
                const { error } = await supabase
                    .from('journal_entries')
                    .update({
                        type: entryData.type,
                        title: entryData.title,
                        content: entryData.content,
                        sentiment: entryData.sentiment,
                        pair: entryData.pair,
                        entry_price: entryData.entry_price,
                        exit_price: entryData.exit_price,
                        stop_loss: entryData.stop_loss,
                        take_profit: entryData.take_profit,
                        lot_size: entryData.lot_size,
                        result: entryData.result,
                        pnl: entryData.pnl,
                        image_url: entryData.image_url,
                        updated_at: new Date().toISOString()
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any)
                    .eq('id', editingEntry.id)

                if (error) throw error
            } else {
                // Create new entry
                const { error } = await supabase
                    .from('journal_entries')
                    .insert({
                        user_id: user.id,
                        type: entryData.type || 'simple',
                        title: entryData.title || '',
                        content: entryData.content,
                        sentiment: entryData.sentiment,
                        pair: entryData.pair,
                        entry_price: entryData.entry_price,
                        exit_price: entryData.exit_price,
                        stop_loss: entryData.stop_loss,
                        take_profit: entryData.take_profit,
                        lot_size: entryData.lot_size,
                        result: entryData.result,
                        pnl: entryData.pnl,
                        image_url: entryData.image_url,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any)

                if (error) throw error
            }

            loadEntries(user.id)
            setShowEditor(false)
            setEditingEntry(null)
        } catch (error) {
            console.error('Error saving entry:', error)
        }
    }

    const handleDeleteEntry = async (id: string) => {
        if (!user || !confirm('Are you sure you want to delete this entry?')) return

        try {
            const { error } = await supabase
                .from('journal_entries')
                .delete()
                .eq('id', id)

            if (error) throw error
            loadEntries(user.id)
        } catch (error) {
            console.error('Error deleting entry:', error)
        }
    }

    const handleEditEntry = (entry: JournalEntry) => {
        setEditingEntry(entry)
        setShowEditor(true)
    }

    const filteredEntries = entries.filter(entry => {
        const matchesType = filterType === 'all' || entry.type === filterType
        const matchesSearch = searchQuery === '' ||
            entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.pair?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
    })

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content">
                <Header
                    user={user}
                    title="Trading Journal"
                    subtitle="Document your trading journey"
                />

                <div className="journal-content">
                    {/* Toolbar */}
                    <div className="journal-toolbar glass-card">
                        <div className="toolbar-left">
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    setEditingEntry(null)
                                    setShowEditor(true)
                                }}
                            >
                                <Plus size={18} />
                                New Entry
                            </button>

                            {/* Filters */}
                            <div className="filter-group">
                                <button
                                    className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilterType('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`filter-btn ${filterType === 'simple' ? 'active' : ''}`}
                                    onClick={() => setFilterType('simple')}
                                >
                                    📝 Simple
                                </button>
                                <button
                                    className={`filter-btn ${filterType === 'technical' ? 'active' : ''}`}
                                    onClick={() => setFilterType('technical')}
                                >
                                    📊 Technical
                                </button>
                            </div>
                        </div>

                        <div className="toolbar-right">
                            {/* Search */}
                            <div className="search-wrapper">
                                <Search size={16} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search entries..."
                                    className="search-input"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* View Toggle */}
                            <div className="view-toggle">
                                <button
                                    className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <List size={18} />
                                </button>
                                <button
                                    className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3X3 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Banner */}
                    <div className="stats-banner">
                        <div className="stat-item">
                            <span className="stat-value">{entries.length}</span>
                            <span className="stat-label">Total Entries</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">{entries.filter(e => e.type === 'simple').length}</span>
                            <span className="stat-label">Reflections</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">{entries.filter(e => e.type === 'technical').length}</span>
                            <span className="stat-label">Trade Logs</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value wins">
                                {entries.filter(e => e.result === 'win').length}
                            </span>
                            <span className="stat-label">Wins</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value losses">
                                {entries.filter(e => e.result === 'loss').length}
                            </span>
                            <span className="stat-label">Losses</span>
                        </div>
                    </div>

                    {/* Entries List */}
                    <div className="entries-container">
                        {isLoading ? (
                            <div className="loading-state">
                                <div className="skeleton-card"></div>
                                <div className="skeleton-card"></div>
                                <div className="skeleton-card"></div>
                            </div>
                        ) : (
                            <EntryList
                                entries={filteredEntries}
                                onEdit={handleEditEntry}
                                onDelete={handleDeleteEntry}
                            />
                        )}
                    </div>
                </div>

                {/* Entry Editor Modal */}
                {showEditor && user && (
                    <EntryEditor
                        onClose={() => {
                            setShowEditor(false)
                            setEditingEntry(null)
                        }}
                        onSave={handleSaveEntry}
                        initialData={editingEntry}
                        userId={user.id}
                    />
                )}
            </main>

            <style jsx>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
        }

        .journal-content {
          flex: 1;
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .journal-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
        }

        .toolbar-left,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .filter-group {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-md);
        }

        .filter-btn {
          padding: 8px 14px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--color-silver);
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-btn:hover {
          color: var(--color-pearl);
        }

        .filter-btn.active {
          background: rgba(0, 212, 255, 0.1);
          color: var(--color-nexus-cyan);
        }

        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        :global(.search-icon) {
          position: absolute;
          left: 12px;
          color: var(--color-steel);
          pointer-events: none;
        }

        .search-input {
          width: 220px;
          padding: 10px 12px 10px 38px;
          background: rgba(10, 10, 15, 0.6);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--color-pearl);
          font-family: var(--font-display);
          font-size: 13px;
          outline: none;
          transition: all var(--transition-fast);
        }

        .search-input::placeholder {
          color: var(--color-steel);
        }

        .search-input:focus {
          border-color: var(--color-nexus-cyan);
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }

        .view-toggle {
          display: flex;
          gap: 2px;
          padding: 4px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-sm);
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--color-steel);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .toggle-btn:hover {
          color: var(--color-silver);
        }

        .toggle-btn.active {
          background: rgba(0, 212, 255, 0.1);
          color: var(--color-nexus-cyan);
        }

        .stats-banner {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 16px 24px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stat-value {
          font-family: var(--font-mono);
          font-size: 20px;
          font-weight: 700;
          color: var(--color-ivory);
        }

        .stat-value.wins {
          color: var(--color-nexus-emerald);
        }

        .stat-value.losses {
          color: var(--color-nexus-crimson);
        }

        .stat-label {
          font-size: 11px;
          color: var(--color-steel);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-divider {
          width: 1px;
          height: 32px;
          background: var(--glass-border);
        }

        .entries-container {
          flex: 1;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-card {
          height: 120px;
          background: var(--color-graphite);
          border-radius: var(--radius-lg);
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
        </div>
    )
}
