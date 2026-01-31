# SpendZ - Setup Database Tables

Run this SQL in your Supabase SQL Editor to create the required tables:

```sql
-- Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  monthly_budget numeric default 0,
  phone text,
  college text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create expenses table
create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  amount numeric not null,
  category text not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.expenses enable row level security;

-- Create Policies for profiles
create policy "Users can view own profile" 
  on profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on profiles for update 
  using (auth.uid() = id);

create policy "Users can insert own profile" 
  on profiles for insert 
  with check (auth.uid() = id);

-- Create Policies for expenses
create policy "Users can view own expenses" 
  on expenses for select 
  using (auth.uid() = user_id);

create policy "Users can insert own expenses" 
  on expenses for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete own expenses" 
  on expenses for delete 
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Next Steps:
1. Go to your Supabase project in Vercel
2. Click "Open in Supabase"
3. Go to SQL Editor
4. Paste and run the SQL above
5. Your database is ready!
