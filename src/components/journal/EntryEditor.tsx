'use client'

import { useState } from 'react'
import { X, Image as ImageIcon, Save, Trash2, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { ASSETS } from '@/lib/riskCalculator'
import { createClient } from '@/lib/supabase/client'

// Zod validation schemas
const simpleEntrySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().optional(),
    sentiment: z.enum(['bullish', 'bearish', 'neutral']),
})

const technicalEntrySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    pair: z.string().min(1, 'Trading pair is required'),
    entry_price: z.number().positive('Entry price must be positive'),
    stop_loss: z.number().positive('Stop loss must be positive'),
    take_profit: z.number().positive('Take profit must be positive'),
    lot_size: z.number().positive('Lot size must be positive'),
    exit_price: z.number().positive().optional(),
    result: z.enum(['win', 'loss', 'breakeven']).optional(),
    content: z.string().optional(),
})

interface JournalEntryData {
    type: 'simple' | 'technical'
    title: string
    content?: string | null
    sentiment?: 'bullish' | 'bearish' | 'neutral' | null
    pair?: string | null
    entry_price?: number | null
    stop_loss?: number | null
    take_profit?: number | null
    lot_size?: number | null
    exit_price?: number | null
    result?: 'win' | 'loss' | 'breakeven' | null
    pnl?: number | null
    image_url?: string | null
}

interface EntryEditorProps {
    onClose: () => void
    onSave: (entry: JournalEntryData) => void
    initialData?: JournalEntryData | null
    userId: string
}

export default function EntryEditor({ onClose, onSave, initialData, userId }: EntryEditorProps) {
    const [mode, setMode] = useState<'simple' | 'technical'>(initialData?.type || 'simple')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const supabase = createClient()

    // Simple mode state
    const [simpleForm, setSimpleForm] = useState({
        title: initialData?.title || '',
        content: initialData?.content || '',
        sentiment: initialData?.sentiment || 'neutral' as 'bullish' | 'bearish' | 'neutral',
    })

    // Technical mode state
    const [technicalForm, setTechnicalForm] = useState({
        title: initialData?.title || '',
        pair: initialData?.pair || 'EURUSD',
        entry_price: initialData?.entry_price?.toString() || '',
        stop_loss: initialData?.stop_loss?.toString() || '',
        take_profit: initialData?.take_profit?.toString() || '',
        lot_size: initialData?.lot_size?.toString() || '',
        exit_price: initialData?.exit_price?.toString() || '',
        result: initialData?.result || '' as '' | 'win' | 'loss' | 'breakeven',
        content: initialData?.content || '',
    })

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, image: 'Image must be less than 5MB' })
                return
            }
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors({ ...errors, image: 'Please upload an image file' })
                return
            }

            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            setErrors({ ...errors, image: '' })
        }
    }

    const uploadImageToStorage = async (): Promise<string | null> => {
        if (!imageFile || !userId) return imagePreview // Return existing URL if no new file
        
        setIsUploading(true)
        try {
            // Create a unique filename
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            
            // Upload to Supabase Storage
            const { error } = await supabase.storage
                .from('trade-images')
                .upload(fileName, imageFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                console.error('Upload error:', error)
                // If storage bucket doesn't exist, fall back to base64
                if (error.message.includes('Bucket not found') || error.message.includes('bucket')) {
                    console.warn('Storage bucket not configured, using base64 fallback')
                    return imagePreview
                }
                throw error
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('trade-images')
                .getPublicUrl(fileName)

            return publicUrl
        } catch (error) {
            console.error('Error uploading image:', error)
            // Fall back to base64 if storage fails
            return imagePreview
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async () => {
        setErrors({})
        setIsSubmitting(true)

        try {
            // Upload image first if there's a new one
            let finalImageUrl: string | null = null
            if (imageFile) {
                finalImageUrl = await uploadImageToStorage()
            } else if (imagePreview) {
                finalImageUrl = imagePreview
            }

            if (mode === 'simple') {
                const result = simpleEntrySchema.safeParse(simpleForm)
                if (!result.success) {
                    const fieldErrors: Record<string, string> = {}
                    result.error.issues.forEach(err => {
                        fieldErrors[err.path[0] as string] = err.message
                    })
                    setErrors(fieldErrors)
                    setIsSubmitting(false)
                    return
                }

                onSave({
                    type: 'simple',
                    ...result.data,
                    image_url: finalImageUrl,
                })
            } else {
                const formData = {
                    ...technicalForm,
                    entry_price: parseFloat(technicalForm.entry_price) || 0,
                    stop_loss: parseFloat(technicalForm.stop_loss) || 0,
                    take_profit: parseFloat(technicalForm.take_profit) || 0,
                    lot_size: parseFloat(technicalForm.lot_size) || 0,
                    exit_price: technicalForm.exit_price ? parseFloat(technicalForm.exit_price) : undefined,
                    result: technicalForm.result || undefined,
                }

                const result = technicalEntrySchema.safeParse(formData)
                if (!result.success) {
                    const fieldErrors: Record<string, string> = {}
                    result.error.issues.forEach(err => {
                        fieldErrors[err.path[0] as string] = err.message
                    })
                    setErrors(fieldErrors)
                    setIsSubmitting(false)
                    return
                }

                // Calculate PnL if exit price and result are provided
                let pnl = 0
                if (formData.exit_price && formData.result) {
                    const asset = ASSETS[formData.pair]
                    if (asset) {
                        const pipDiff = Math.abs(formData.exit_price - formData.entry_price) / asset.pipSize
                        pnl = pipDiff * asset.pipValue * formData.lot_size
                        if (formData.result === 'loss') pnl = -pnl
                    }
                }

                onSave({
                    type: 'technical',
                    ...result.data,
                    pnl,
                    image_url: finalImageUrl,
                })
            }
        } catch (error) {
            console.error('Error saving entry:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const removeImage = async () => {
        // If it's an existing image from storage, we could delete it here
        // For now, just clear the preview
        setImagePreview(null)
        setImageFile(null)
    }

    return (
        <div className="editor-overlay">
            <div className="editor-modal glass-card-elevated">
                {/* Header */}
                <div className="editor-header">
                    <div className="editor-title-section">
                        <h2 className="editor-title">
                            {initialData ? 'Edit Entry' : 'New Journal Entry'}
                        </h2>
                        <p className="editor-subtitle">
                            Record your trading insights and analysis
                        </p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Mode Tabs */}
                <div className="mode-tabs">
                    <button
                        className={`mode-tab ${mode === 'simple' ? 'active' : ''}`}
                        onClick={() => setMode('simple')}
                    >
                        <span className="tab-icon">📝</span>
                        Simple
                        <span className="tab-description">Quick thoughts & sentiment</span>
                    </button>
                    <button
                        className={`mode-tab ${mode === 'technical' ? 'active' : ''}`}
                        onClick={() => setMode('technical')}
                    >
                        <span className="tab-icon">📊</span>
                        Technical
                        <span className="tab-description">Detailed trade analysis</span>
                    </button>
                </div>

                {/* Form Content */}
                <div className="editor-body">
                    {mode === 'simple' ? (
                        <div className="simple-form">
                            {/* Title */}
                            <div className="form-group">
                                <label className="form-label">Entry Title</label>
                                <input
                                    type="text"
                                    className={`input-field ${errors.title ? 'error' : ''}`}
                                    placeholder="What's on your mind?"
                                    value={simpleForm.title}
                                    onChange={(e) => setSimpleForm({ ...simpleForm, title: e.target.value })}
                                />
                                {errors.title && <span className="error-text">{errors.title}</span>}
                            </div>

                            {/* Sentiment */}
                            <div className="form-group">
                                <label className="form-label">Market Sentiment</label>
                                <div className="sentiment-options">
                                    {(['bullish', 'neutral', 'bearish'] as const).map((sentiment) => (
                                        <button
                                            key={sentiment}
                                            className={`sentiment-btn ${sentiment} ${simpleForm.sentiment === sentiment ? 'active' : ''}`}
                                            onClick={() => setSimpleForm({ ...simpleForm, sentiment })}
                                        >
                                            {sentiment === 'bullish' && <TrendingUp size={18} />}
                                            {sentiment === 'neutral' && <Minus size={18} />}
                                            {sentiment === 'bearish' && <TrendingDown size={18} />}
                                            <span>{sentiment}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea
                                    className="input-field textarea"
                                    placeholder="Write your thoughts, observations, or market analysis..."
                                    rows={6}
                                    value={simpleForm.content}
                                    onChange={(e) => setSimpleForm({ ...simpleForm, content: e.target.value })}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="technical-form">
                            {/* Title */}
                            <div className="form-group">
                                <label className="form-label">Trade Title</label>
                                <input
                                    type="text"
                                    className={`input-field ${errors.title ? 'error' : ''}`}
                                    placeholder="e.g., EURUSD Breakout Trade"
                                    value={technicalForm.title}
                                    onChange={(e) => setTechnicalForm({ ...technicalForm, title: e.target.value })}
                                />
                                {errors.title && <span className="error-text">{errors.title}</span>}
                            </div>

                            {/* Pair Selection */}
                            <div className="form-group">
                                <label className="form-label">Trading Pair</label>
                                <select
                                    className={`input-field ${errors.pair ? 'error' : ''}`}
                                    value={technicalForm.pair}
                                    onChange={(e) => setTechnicalForm({ ...technicalForm, pair: e.target.value })}
                                >
                                    {Object.values(ASSETS).map((asset) => (
                                        <option key={asset.symbol} value={asset.symbol}>
                                            {asset.name} ({asset.symbol})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Grid */}
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Entry Price</label>
                                    <input
                                        type="number"
                                        step="0.00001"
                                        className={`input-field ${errors.entry_price ? 'error' : ''}`}
                                        placeholder="0.00000"
                                        value={technicalForm.entry_price}
                                        onChange={(e) => setTechnicalForm({ ...technicalForm, entry_price: e.target.value })}
                                    />
                                    {errors.entry_price && <span className="error-text">{errors.entry_price}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Stop Loss</label>
                                    <input
                                        type="number"
                                        step="0.00001"
                                        className={`input-field ${errors.stop_loss ? 'error' : ''}`}
                                        placeholder="0.00000"
                                        value={technicalForm.stop_loss}
                                        onChange={(e) => setTechnicalForm({ ...technicalForm, stop_loss: e.target.value })}
                                    />
                                    {errors.stop_loss && <span className="error-text">{errors.stop_loss}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Take Profit</label>
                                    <input
                                        type="number"
                                        step="0.00001"
                                        className={`input-field ${errors.take_profit ? 'error' : ''}`}
                                        placeholder="0.00000"
                                        value={technicalForm.take_profit}
                                        onChange={(e) => setTechnicalForm({ ...technicalForm, take_profit: e.target.value })}
                                    />
                                    {errors.take_profit && <span className="error-text">{errors.take_profit}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Lot Size</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`input-field ${errors.lot_size ? 'error' : ''}`}
                                        placeholder="0.00"
                                        value={technicalForm.lot_size}
                                        onChange={(e) => setTechnicalForm({ ...technicalForm, lot_size: e.target.value })}
                                    />
                                    {errors.lot_size && <span className="error-text">{errors.lot_size}</span>}
                                </div>
                            </div>

                            {/* Exit/Result Section */}
                            <div className="exit-section">
                                <h4 className="section-title">Trade Result (Optional)</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Exit Price</label>
                                        <input
                                            type="number"
                                            step="0.00001"
                                            className="input-field"
                                            placeholder="0.00000"
                                            value={technicalForm.exit_price}
                                            onChange={(e) => setTechnicalForm({ ...technicalForm, exit_price: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Result</label>
                                        <div className="result-options">
                                            {(['win', 'loss', 'breakeven'] as const).map((result) => (
                                                <button
                                                    key={result}
                                                    className={`result-btn ${result} ${technicalForm.result === result ? 'active' : ''}`}
                                                    onClick={() => setTechnicalForm({ ...technicalForm, result })}
                                                >
                                                    {result}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="form-group">
                                <label className="form-label">Trade Notes</label>
                                <textarea
                                    className="input-field textarea"
                                    placeholder="Entry reasoning, market conditions, lessons learned..."
                                    rows={4}
                                    value={technicalForm.content}
                                    onChange={(e) => setTechnicalForm({ ...technicalForm, content: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="form-group">
                        <label className="form-label">
                            <ImageIcon size={14} />
                            Chart Screenshot (Optional)
                        </label>
                        {errors.image && <span className="error-text">{errors.image}</span>}
                        <div className="image-upload-area">
                            {imagePreview ? (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Chart preview" />
                                    <button
                                        className="remove-image-btn"
                                        onClick={removeImage}
                                        type="button"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="upload-placeholder">
                                    <ImageIcon size={32} />
                                    <span>Click to upload or drag and drop</span>
                                    <span className="upload-hint">PNG, JPG up to 5MB</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        hidden
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="editor-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={isSubmitting || isUploading}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isUploading}
                    >
                        {(isSubmitting || isUploading) ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {isUploading ? 'Uploading...' : isSubmitting ? 'Saving...' : 'Save Entry'}
                    </button>
                </div>
            </div>

            <style jsx>{`
        .editor-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }

        .editor-modal {
          width: 100%;
          max-width: 640px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .editor-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid var(--glass-border);
        }

        .editor-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-ivory);
        }

        .editor-subtitle {
          font-size: 13px;
          color: var(--color-steel);
          margin-top: 4px;
        }

        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          color: var(--color-silver);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-pearl);
        }

        .mode-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--glass-border);
        }

        .mode-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--color-silver);
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .mode-tab:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .mode-tab.active {
          background: rgba(0, 212, 255, 0.08);
          border-color: rgba(0, 212, 255, 0.3);
          color: var(--color-nexus-cyan);
        }

        .tab-icon {
          font-size: 24px;
        }

        .tab-description {
          font-size: 11px;
          color: var(--color-steel);
        }

        .mode-tab.active .tab-description {
          color: rgba(0, 212, 255, 0.7);
        }

        .editor-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 500;
          color: var(--color-silver);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-field.error {
          border-color: var(--color-nexus-crimson);
        }

        .error-text {
          display: block;
          margin-top: 6px;
          font-size: 12px;
          color: var(--color-nexus-crimson);
        }

        .input-field.textarea {
          resize: vertical;
          min-height: 100px;
        }

        .sentiment-options,
        .result-options {
          display: flex;
          gap: 8px;
        }

        .sentiment-btn,
        .result-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--color-silver);
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 500;
          text-transform: capitalize;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .sentiment-btn:hover,
        .result-btn:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .sentiment-btn.bullish.active {
          background: rgba(0, 255, 136, 0.1);
          border-color: rgba(0, 255, 136, 0.3);
          color: var(--color-nexus-emerald);
        }

        .sentiment-btn.neutral.active {
          background: rgba(138, 138, 154, 0.1);
          border-color: rgba(138, 138, 154, 0.3);
          color: var(--color-silver);
        }

        .sentiment-btn.bearish.active {
          background: rgba(255, 51, 102, 0.1);
          border-color: rgba(255, 51, 102, 0.3);
          color: var(--color-nexus-crimson);
        }

        .result-btn.win.active {
          background: rgba(0, 255, 136, 0.1);
          border-color: rgba(0, 255, 136, 0.3);
          color: var(--color-nexus-emerald);
        }

        .result-btn.breakeven.active {
          background: rgba(255, 170, 0, 0.1);
          border-color: rgba(255, 170, 0, 0.3);
          color: var(--color-nexus-amber);
        }

        .result-btn.loss.active {
          background: rgba(255, 51, 102, 0.1);
          border-color: rgba(255, 51, 102, 0.3);
          color: var(--color-nexus-crimson);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .exit-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--glass-border);
        }

        .section-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-silver);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .image-upload-area {
          border: 2px dashed var(--glass-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: all var(--transition-fast);
        }

        .image-upload-area:hover {
          border-color: var(--color-nexus-cyan);
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 32px;
          color: var(--color-steel);
          cursor: pointer;
          text-align: center;
        }

        .upload-hint {
          font-size: 11px;
          opacity: 0.7;
        }

        .image-preview {
          position: relative;
        }

        .image-preview img {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
        }

        .remove-image-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--color-obsidian);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          color: var(--color-nexus-crimson);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .remove-image-btn:hover {
          background: rgba(255, 51, 102, 0.2);
        }

        .editor-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid var(--glass-border);
        }
      `}</style>
        </div>
    )
}
