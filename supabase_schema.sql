-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create combos table
create table public.combos (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create combo_products junction table
create table public.combo_products (
  combo_id uuid references public.combos(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  quantity integer not null default 1,
  primary key (combo_id, product_id)
);

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.combos enable row level security;
alter table public.combo_products enable row level security;

-- Policies for public reading
create policy "Allow public read-only access to products" on public.products
  for select using (true);

create policy "Allow public read-only access to combos" on public.combos
  for select using (true);

create policy "Allow public read-only access to combo_products" on public.combo_products
  for select using (true);

-- Policies for authenticated users (Admin)
create policy "Allow admin write access to products" on public.products
  for all to authenticated using (true) with check (true);

create policy "Allow admin write access to combos" on public.combos
  for all to authenticated using (true) with check (true);

create policy "Allow admin write access to combo_products" on public.combo_products
  for all to authenticated using (true) with check (true);
