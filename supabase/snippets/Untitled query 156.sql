-- Crear la tabla de patrocinios corregida
create table patrocinios (
  id bigint primary key generated always as identity,
  nombre text not null,
  logo_url text,
  enlace_web text,
  activo boolean default true,
  created_at timestamptz default now()
);

-- Insertar un registro de "Borrador"
insert into patrocinios (nombre, logo_url)
values ('Próximo Colaborador', 'https://via.placeholder.com/150');

