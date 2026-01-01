-- Create a table to store FCM tokens
create table if not exists public.user_fcm_tokens (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null references auth.users (id) on delete cascade,
    token text not null,
    device_type text null,
    created_at timestamp with time zone not null default now(),
    last_used_at timestamp with time zone not null default now(),
    constraint user_fcm_tokens_pkey primary key (id),
    constraint user_fcm_tokens_token_key unique (token)
);

-- Enable RLS
alter table public.user_fcm_tokens enable row level security;

-- Policy: Users can insert their own tokens
create policy "Users can insert their own tokens" on public.user_fcm_tokens 
for insert 
with check (auth.uid() = user_id);

-- Policy: Users can read their own tokens
create policy "Users can read their own tokens" on public.user_fcm_tokens 
for select 
using (auth.uid() = user_id);

-- Policy: Service Role (Edge Function) can read all tokens (bypass RLS or use service key)
-- Note: Edge functions usually use the service_role key which bypasses RLS.
