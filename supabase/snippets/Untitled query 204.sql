
--PARA INSERTAR DATOS EN TABLA MODELO

INSERT INTO public.modelos (nombre_zapatilla, descripcion, modelo, sigla, precio, color, genero, tamano, categoria, imagen_url, imagen_url_2, imagen_url_3, imagen_url_4, imagen_url_5)
SELECT 
    '
ZAPATILLAS PARA JOVENCITOS MODELO ORENCH NEGRO 3
    ' AS nombre_zapatilla,
    '
Las Ivano Orench, son unas zapatillas que se caracterizan por ser muy cómodas, un modelo clásico que combina con todo.

Descripción:

Material: Cuero.
Forro: Textil.
Suela: 100% Caucho.
Estilo: Urbano.

' AS descripcion,
    'F0095' AS modelo,
    'L' AS sigla,
    '140.00' AS precio,
    'NEGRO 3' AS color,
    'HOMBRE' AS genero,
    'MEDIANO' AS tamano,
    'CAÑA BAJA' AS categoria,
    'F0095-L-MED-1.jpg' AS imagen_url,
    'F0095-L-MED-2.jpg' AS imagen_url_2,
    'F0095-L-MED-3.jpg' AS imagen_url_3,
    'F0095-L-MED-4.jpg' AS imagen_url_4,
    'F0095-L-MED-5.jpg' AS imagen_url_5;

   