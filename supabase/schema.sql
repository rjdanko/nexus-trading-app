-- Nexus Trading Hub - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE entry_type AS ENUM ('simple', 'technical');
CREATE TYPE sentiment_type AS ENUM ('bullish', 'bearish', 'neutral');
CREATE TYPE trade_result AS ENUM ('win', 'loss', 'breakeven');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    default_risk_percent DECIMAL(5,2) DEFAULT 1.0,
    default_account_balance DECIMAL(15,2) DEFAULT 10000.00,
    preferred_pairs TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries table (supports both simple and technical entries)
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type entry_type NOT NULL DEFAULT 'simple',
    title TEXT NOT NULL,
    content TEXT,
    
    -- Simple mode fields
    sentiment sentiment_type,
    
    -- Technical mode fields
    pair TEXT,
    entry_price DECIMAL(20,5),
    exit_price DECIMAL(20,5),
    stop_loss DECIMAL(20,5),
    take_profit DECIMAL(20,5),
    lot_size DECIMAL(10,2),
    result trade_result,
    pnl DECIMAL(15,2),
    pnl_percentage DECIMAL(8,4),
    
    -- Common fields
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_type ON journal_entries(type);
CREATE INDEX idx_journal_entries_pair ON journal_entries(pair);
CREATE INDEX idx_journal_entries_result ON journal_entries(result);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- RLS Policies for journal_entries
CREATE POLICY "Users can view own entries"
    ON journal_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own entries"
    ON journal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
    ON journal_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
    ON journal_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for trade images (run in Supabase Storage settings)
-- Or use this SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-images', 'trade-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for trade images
CREATE POLICY "Users can upload trade images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'trade-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own trade images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'trade-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own trade images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'trade-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
