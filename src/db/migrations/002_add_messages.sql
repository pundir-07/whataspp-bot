create table messages(
    id bigserial primary key,
    meta_message_id text not null unique,
    wa_id varchar(20) not null references users(wa_id) on delete cascade,
    direction text not null check (direction in ('incoming','outgoing')),
    status text,
    type text not null check (type in (
        'text',
        'image',
        'video',
        'audio',
        'document',
        'sticker',
        'location',
        'contacts',
        'interactive',
        'button',
        'reaction',
        'order',
        'system',
        'unknown'
    )),
    content text,
    sent_at timestamptz not null,
    created_at timestamptz not null default now()

);
create index messages_by_wa_id_sent_at
on messages(wa_id,sent_at DESC);