-- Rise · banco de dados (Supabase / Postgres)
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.

-- 1) Perfil de cada adolescente --------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  squad       text,                       -- Gravidade, Propulsor, Meteoro, Cometa, Líderes
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2) Devocionais: um registro por dia ---------------------------------------
create table if not exists public.devotional_days (
  user_id     uuid not null references auth.users(id) on delete cascade,
  day         date not null,
  done        boolean not null default false,
  challenge   boolean not null default false,
  answer      text,
  updated_at  timestamptz not null default now(),
  primary key (user_id, day)
);

-- 3) Versículos: destaque, salvo e anotação ---------------------------------
create table if not exists public.verse_marks (
  user_id     uuid not null references auth.users(id) on delete cascade,
  verse_key   text not null,             -- "livro.capítulo.versículo" (livro 0–65)
  color       text check (color in ('h1','h2','h3')),
  saved       boolean not null default false,
  note        text,
  updated_at  timestamptz not null default now(),
  primary key (user_id, verse_key)
);

-- 4) Planos de leitura ------------------------------------------------------
create table if not exists public.plan_progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  plan        text not null,
  chapter     int  not null,
  read_at     timestamptz not null default now(),
  primary key (user_id, plan, chapter)
);

-- Permissões de tabela para quem está logado --------------------------------
-- Sem estes GRANTs o app recebe "permission denied for table ..." (projetos em que
-- o Supabase não expõe tabelas novas automaticamente). O RLS abaixo continua
-- garantindo que cada um só acessa as próprias linhas. Visitante (anon) não recebe nada.
grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.profiles, public.devotional_days, public.verse_marks, public.plan_progress
  to authenticated;

-- Segurança: cada um só enxerga e altera o que é seu ------------------------
alter table public.profiles        enable row level security;
alter table public.devotional_days enable row level security;
alter table public.verse_marks     enable row level security;
alter table public.plan_progress   enable row level security;

drop policy if exists "perfil próprio" on public.profiles;
create policy "perfil próprio" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "devocionais próprios" on public.devotional_days;
create policy "devocionais próprios" on public.devotional_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "versículos próprios" on public.verse_marks;
create policy "versículos próprios" on public.verse_marks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "plano próprio" on public.plan_progress;
create policy "plano próprio" on public.plan_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cria o perfil automaticamente no cadastro ---------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, squad)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'name', ''),
          nullif(new.raw_user_meta_data->>'squad', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Índices úteis --------------------------------------------------------------
create index if not exists devotional_days_done_idx on public.devotional_days (user_id, day) where done;
