-- AG MUST USE THIS SCHEMA AS THE SOURCE OF TRUTH FOR SUPABASE
-- Ensure RLS (Row Level Security) policies allow circle members to read/write.

1. `circles`
- id (uuid, primary key)
- title (text)
- trip_type (text)
- currency_code (text) -- e.g., 'USD', 'INR', 'EUR'
- status (text) -- 'voting', 'finalized', 'archived'
- invite_code (text, unique, uppercase 6 chars)
- created_by (uuid, references auth.users)

2. `circle_members`
- circle_id (uuid)
- user_id (uuid)
- role (text) -- 'organizer', 'member'

3. `messages` (Real-Time Chat)
- id (uuid, pk)
- circle_id (uuid)
- user_id (uuid)
- content (text)
- created_at (timestamp)

4. `memories` (The Post-Trip Photo/Voice Vault)
- id (uuid, pk)
- circle_id (uuid)
- uploader_id (uuid)
- media_url (text) -- Supabase Storage URL
- media_type (text) -- 'image', 'voice'
- created_at (timestamp)