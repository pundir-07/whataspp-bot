create table users(
    id bigserial primary key,
    profile_name text NOT NULL,
    wa_id varchar(20) not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now() 
);