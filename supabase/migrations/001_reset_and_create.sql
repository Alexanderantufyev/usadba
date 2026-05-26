-- Сброс (безопасно, если объекты уже существуют)
drop table if exists equipment        cascade;
drop table if exists expenses         cascade;
drop table if exists payments         cascade;
drop table if exists invoices         cascade;
drop table if exists staff_assignments cascade;
drop table if exists staff            cascade;
drop table if exists bookings         cascade;
drop table if exists customers        cascade;
drop table if exists locations        cascade;
drop table if exists profiles         cascade;

drop type if exists payment_method cascade;
drop type if exists invoice_status cascade;
drop type if exists booking_type   cascade;
drop type if exists booking_status cascade;
drop type if exists user_role      cascade;

drop function if exists set_updated_at()              cascade;
drop function if exists check_booking_conflict(uuid,timestamptz,timestamptz,uuid) cascade;

-- ══════════════════════════════════════════════════════════
--  Усадьба OS — начальная схема БД
-- ══════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Справочники
create type user_role      as enum ('owner', 'manager', 'staff', 'accountant');
create type booking_status as enum ('draft', 'confirmed', 'deposit_paid', 'completed', 'cancelled', 'no_show');
create type booking_type   as enum ('event', 'rental', 'private', 'recurring', 'blocked');
create type invoice_status as enum ('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled');
create type payment_method as enum ('cash', 'card', 'transfer', 'online', 'other');

-- Профили
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        user_role not null default 'staff',
  phone       text,
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- Пространства
create table locations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  capacity    int,
  area_sqm    numeric(8,2),
  floor       int,
  color       text not null default '#1B6255',
  hourly_rate numeric(12,2) default 0,
  daily_rate  numeric(12,2) default 0,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create trigger locations_updated_at before update on locations
  for each row execute function set_updated_at();
create index idx_locations_active on locations(is_active) where deleted_at is null;

-- Клиенты
create table customers (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  phone      text,
  email      text,
  company    text,
  inn        text,
  source     text,
  notes      text,
  tags       text[] default '{}',
  is_vip     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger customers_updated_at before update on customers
  for each row execute function set_updated_at();
create index idx_customers_name  on customers using gin(name gin_trgm_ops);
create index idx_customers_phone on customers(phone);

-- Бронирования
create table bookings (
  id                  uuid primary key default uuid_generate_v4(),
  location_id         uuid not null references locations(id),
  customer_id         uuid references customers(id),
  created_by          uuid references profiles(id),
  title               text not null,
  description         text,
  type                booking_type not null default 'event',
  status              booking_status not null default 'draft',
  starts_at           timestamptz not null,
  ends_at             timestamptz not null,
  setup_minutes       int not null default 0,
  cleanup_minutes     int not null default 0,
  all_day             boolean not null default false,
  recurring_rule      text,
  recurring_parent_id uuid references bookings(id),
  base_price          numeric(12,2) not null default 0,
  discount_amount     numeric(12,2) not null default 0,
  final_price         numeric(12,2) generated always as (base_price - discount_amount) stored,
  deposit_amount      numeric(12,2) not null default 0,
  deposit_paid_at     timestamptz,
  guests_count        int,
  guests_notes        text,
  color               text,
  notes               text,
  internal_notes      text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz,
  constraint bookings_dates_check check (ends_at > starts_at)
);
create trigger bookings_updated_at before update on bookings
  for each row execute function set_updated_at();
create index idx_bookings_location on bookings(location_id, starts_at, ends_at);
create index idx_bookings_customer on bookings(customer_id);
create index idx_bookings_status   on bookings(status);
create index idx_bookings_starts   on bookings(starts_at);

create or replace function check_booking_conflict(
  p_location_id uuid, p_starts_at timestamptz, p_ends_at timestamptz,
  p_booking_id uuid default null
) returns boolean language sql as $$
  select exists (
    select 1 from bookings
    where location_id = p_location_id
      and deleted_at is null
      and status not in ('cancelled', 'no_show')
      and (id != coalesce(p_booking_id, uuid_nil()))
      and (
        starts_at - (setup_minutes || ' minutes')::interval,
        ends_at   + (cleanup_minutes || ' minutes')::interval
      ) overlaps (p_starts_at, p_ends_at)
  );
$$;

-- Персонал
create table staff (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid references profiles(id),
  name        text not null,
  role        text not null,
  phone       text,
  email       text,
  hourly_rate numeric(10,2) default 0,
  is_active   boolean not null default true,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create trigger staff_updated_at before update on staff
  for each row execute function set_updated_at();

create table staff_assignments (
  id         uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id) on delete cascade,
  staff_id   uuid not null references staff(id),
  role       text,
  hours      numeric(5,2) default 0,
  notes      text,
  created_at timestamptz not null default now(),
  unique(booking_id, staff_id)
);

-- Финансы
create table invoices (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid references bookings(id),
  customer_id uuid references customers(id),
  number      text not null unique,
  status      invoice_status not null default 'draft',
  subtotal    numeric(12,2) not null default 0,
  tax_rate    numeric(5,2) not null default 0,
  tax_amount  numeric(12,2) generated always as (subtotal * tax_rate / 100) stored,
  total       numeric(12,2) generated always as (subtotal + subtotal * tax_rate / 100) stored,
  due_date    date,
  paid_at     timestamptz,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger invoices_updated_at before update on invoices
  for each row execute function set_updated_at();

create table payments (
  id          uuid primary key default uuid_generate_v4(),
  invoice_id  uuid references invoices(id),
  booking_id  uuid references bookings(id),
  amount      numeric(12,2) not null,
  method      payment_method not null default 'cash',
  is_deposit  boolean not null default false,
  is_refund   boolean not null default false,
  paid_at     timestamptz not null default now(),
  notes       text,
  created_by  uuid references profiles(id),
  created_at  timestamptz not null default now()
);
create index idx_payments_booking on payments(booking_id);
create index idx_payments_invoice on payments(invoice_id);

create table expenses (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid references bookings(id),
  category    text not null,
  amount      numeric(12,2) not null,
  vendor      text,
  description text,
  date        date not null default current_date,
  receipt_url text,
  created_by  uuid references profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger expenses_updated_at before update on expenses
  for each row execute function set_updated_at();
create index idx_expenses_booking  on expenses(booking_id);
create index idx_expenses_category on expenses(category);
create index idx_expenses_date     on expenses(date);

-- Оборудование
create table equipment (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  category       text,
  quantity       int not null default 1,
  condition      text not null default 'good',
  location_id    uuid references locations(id),
  purchase_date  date,
  purchase_price numeric(12,2),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
create trigger equipment_updated_at before update on equipment
  for each row execute function set_updated_at();

-- RLS
alter table profiles          enable row level security;
alter table locations         enable row level security;
alter table customers         enable row level security;
alter table bookings          enable row level security;
alter table staff             enable row level security;
alter table staff_assignments enable row level security;
alter table invoices          enable row level security;
alter table payments          enable row level security;
alter table expenses          enable row level security;
alter table equipment         enable row level security;

create policy "authenticated read" on locations         for select using (auth.role() = 'authenticated');
create policy "authenticated read" on customers         for select using (auth.role() = 'authenticated');
create policy "authenticated read" on bookings          for select using (auth.role() = 'authenticated');
create policy "authenticated read" on staff             for select using (auth.role() = 'authenticated');
create policy "authenticated read" on staff_assignments for select using (auth.role() = 'authenticated');
create policy "authenticated read" on invoices          for select using (auth.role() = 'authenticated');
create policy "authenticated read" on payments          for select using (auth.role() = 'authenticated');
create policy "authenticated read" on expenses          for select using (auth.role() = 'authenticated');
create policy "authenticated read" on equipment         for select using (auth.role() = 'authenticated');

create policy "manager write" on bookings for all using (
  auth.uid() in (select id from profiles where role in ('owner', 'manager'))
);
create policy "manager write" on customers for all using (
  auth.uid() in (select id from profiles where role in ('owner', 'manager'))
);

-- Seed: тестовые пространства
insert into locations (name, slug, description, capacity, area_sqm, color, hourly_rate, daily_rate, sort_order) values
  ('Главный зал',    'main-hall',    'Основной зал усадьбы для мероприятий',        80,  120, '#1B6255', 2500, 15000, 1),
  ('Малая гостиная', 'small-lounge', 'Уютное пространство для небольших встреч',    20,  35,  '#C4922A', 1500, 8000,  2),
  ('Задний двор',    'backyard',     'Открытое пространство для летних событий',    120, 200, '#2A8570', 2000, 12000, 3),
  ('Кухня',          'kitchen',      'Профессиональная кухня для мастер-классов',   15,  40,  '#B5171E', 1000, 6000,  4);
