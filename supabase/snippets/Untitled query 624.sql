-- 1. Tabla de Chats (La cabecera de la conversación)
create table chats (
  id serial primary key,
  user_id int8 references usuarios(id) on delete cascade not null,
  asunto text,
  estado text default 'abierto' check (estado in ('abierto', 'cerrado')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabla de Mensajes (El contenido del chat)
create table mensajes (
  id serial primary key,
  chat_id int4 references chats(id) on delete cascade not null,
  remitente text check (remitente in ('cliente', 'admin')) not null,
  contenido text not null,
  leido boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Habilitar RLS (Seguridad)
alter table chats enable row level security;
alter table mensajes enable row level security;