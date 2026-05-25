INSERT INTO public.modelos (nombre_zapatilla, descripcion, modelo, sigla, precio, color, genero, tamano, categoria, imagen_url, imagen_url_2)
SELECT 
    'CORREA REVERSIBLE MUJER MODELO ALIKA OCRE' AS nombre_zapatilla,
    'Correa Alika: Diseño clásico, versátil y funcional, hechos con cuero y finos acabados.

Material: 100% cuero.
Tallas: S, M, L.
Reversible Negro.

' AS descripcion,
    'A0075' AS modelo,
    'N' AS sigla,
    '99.00' AS precio,
    'OCRE' AS color, -- AQUÍ CAMBIAS: 'ARENA', 'MARRON', 'CAMEL'
    'MUJER' AS genero,
    'ACCESORIO' AS tamano,
    'CORREAS' AS categoria,
    'A0075-N-1.jpg' AS imagen_url, -- AQUÍ CAMBIAS LA IMAGEN
    'A0075-N-2.jpg' AS imagen_url2;