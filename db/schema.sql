-- chapterly schema. Idempotent: safe to run on every boot.

create table if not exists writers (
  id            serial primary key,
  email         text not null unique,
  pen_name      text not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists sessions (
  token      text primary key,
  writer_id  integer not null references writers(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists sessions_writer_id_idx on sessions (writer_id);

create table if not exists stories (
  id         serial primary key,
  writer_id  integer not null references writers(id) on delete cascade,
  title      text not null,
  slug       text not null unique,
  synopsis   text not null default '',
  status     text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stories_writer_id_idx on stories (writer_id);

create table if not exists chapters (
  id           serial primary key,
  story_id     integer not null references stories(id) on delete cascade,
  title        text not null,
  body         text not null default '',
  position     integer not null,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (story_id, position)
);

create index if not exists chapters_story_id_idx on chapters (story_id);
