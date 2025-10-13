create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table products add column category_id uuid references categories(id);

drop table if exists product_suppliers;
drop table if exists suppliers;
