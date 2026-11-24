-- Schema ของฐานข้อมูล (Postgres / Neon) สรุปจากฐานข้อมูลที่ใช้งานจริง
-- รันซ้ำได้ปลอดภัย (create ... if not exists)
-- ราคาและยอดรวมทั้งหมดเก็บเป็นสตางค์ (integer)

create table if not exists categories (
  id   serial primary key,
  slug text not null unique,
  name text not null
);

create table if not exists products (
  id          serial primary key,
  slug        text not null unique,
  sku         text not null unique,
  name        text not null,
  price       integer not null,               -- สตางค์
  image_url   text,
  stock       integer not null default 0,
  category_id integer references categories(id)
);

-- ตะกร้าผูกกับ cookie ไม่มีระบบสมาชิก
create table if not exists carts (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists cart_items (
  id         serial primary key,
  cart_id    uuid not null references carts(id) on delete cascade,
  product_id integer not null references products(id),
  quantity   integer not null check (quantity > 0),
  unique (cart_id, product_id)
);

-- status: 'pending' | 'paid' | 'cancelled'
-- payment_method: 'promptpay' | 'card' | 'cod' (null = ยังไม่เลือกวิธีจ่าย)
create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text not null,
  phone          text,
  address        text not null,
  total          integer not null,            -- สตางค์
  status         text not null default 'pending',
  payment_method text,
  created_at     timestamptz not null default now()
);

-- เก็บชื่อและราคา ณ ตอนสั่ง เผื่อสินค้าถูกแก้ภายหลัง
create table if not exists order_items (
  id         serial primary key,
  order_id   uuid not null references orders(id),
  product_id integer not null references products(id),
  name       text not null,
  price      integer not null,                -- สตางค์
  quantity   integer not null
);

create table if not exists contact_messages (
  id         serial primary key,
  name       text not null check (char_length(name) <= 200),
  email      text not null check (char_length(email) <= 320),
  phone      text not null check (char_length(phone) <= 30),
  subject    text not null check (char_length(subject) <= 200),
  message    text not null check (char_length(message) <= 5000),
  consent    boolean not null check (consent),
  created_at timestamptz not null default now()
);

-- ตัวนับ rate limit ต่อ IP (fixed window) ดู lib/rate-limit.ts
create table if not exists rate_limits (
  key          text not null,
  window_start timestamptz not null,
  count        integer not null default 1,
  primary key (key, window_start)
);
