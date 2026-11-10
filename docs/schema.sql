-- Medifo DB 스키마 기록
-- Supabase SQL Editor에서 직접 실행한 SQL을 그대로 남긴다 (마이그레이션 파일 없음).
-- 이 파일을 다시 실행하는 용도가 아니라 실제 적용된 구조를 기록하는 용도임.
-- 기존 테이블(users, medicines, user_medicines, intake_logs 등)은 아직 기록하지 않음.

-- ============================================================
-- #67 식약처 DUR 병용금기 성분 데이터 (2026-11 적용)
-- 채우는 스크립트: scripts/syncDurContraindications.ts
-- ============================================================

create table public.dur_ingredients (
  ingr_code  text primary key,
  name_kor   text not null,
  name_eng   text,
  synced_at  timestamptz not null default now()
);

create table public.medicine_ingredients (
  medicine_id uuid not null references public.medicines(id) on delete cascade,
  ingr_code   text not null references public.dur_ingredients(ingr_code) on delete cascade,
  synced_at   timestamptz not null default now(),
  primary key (medicine_id, ingr_code)
);
create index medicine_ingredients_ingr_idx on public.medicine_ingredients (ingr_code);

create table public.dur_contraindication_rules (
  id          bigint generated always as identity primary key,
  ingr_code_a text not null references public.dur_ingredients(ingr_code) on delete cascade,
  ingr_code_b text not null references public.dur_ingredients(ingr_code) on delete cascade,
  reason      text not null default '',
  synced_at   timestamptz not null default now(),
  constraint dur_rules_pair_order check (ingr_code_a < ingr_code_b),
  constraint dur_rules_unique unique (ingr_code_a, ingr_code_b, reason)
);
create index dur_rules_b_idx on public.dur_contraindication_rules (ingr_code_b);

alter table public.dur_ingredients            enable row level security;
alter table public.medicine_ingredients       enable row level security;
alter table public.dur_contraindication_rules enable row level security;

create policy "DUR 성분 전체 읽기 허용" on public.dur_ingredients for select to public using (true);
create policy "약 성분 연결 전체 읽기 허용" on public.medicine_ingredients for select to public using (true);
create policy "DUR 병용금기 조합 전체 읽기 허용" on public.dur_contraindication_rules for select to public using (true);
