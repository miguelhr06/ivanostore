-- Crear tabla de tiendas
create table tiendas (
  id bigint primary key generated always as identity,
  nombre text not null,
  direccion text not null,
  distrito text default 'Ate',
  google_maps_url text,
  imagen_url text,
  horario text,
  activo boolean default true
);

-- Insertar la tienda principal de la fábrica
insert into tiendas (nombre, direccion, horario)
values ('Fábrica Ivano - Sede Central', 'Calle Las Fábricas, Ate, Lima', 'Lun - Sáb: 8:00 AM - 6:00 PM');

