INSERT INTO modelos (nombre_zapatilla, descripcion, modelo, sigla, precio, color, genero, tamano, categoria, imagen_url, imagen_url_2)
VALUES 
(
  'Zapatilla Ivano Kids Explorer', 
  'Modelo versátil diseñado para todo tipo de actividad escolar o recreativa. Material sintético de fácil limpieza y doble costura.', 
  'F3000', 
  'U', 
  95.00, 
  'GRIS/NEGRO', 
  'UNISEX_NINO', -- Género clave para que caiga en la tercera sección
  'pequeno', 
  'ESCOLAR', 
  'F3000-U-1.jpg', 
  'F3000-U-2.jpg'
);

INSERT INTO variantes_stock (modelo_id, talla, stock)
SELECT id, talla, 15 FROM modelos, unnest(ARRAY[27, 28, 29, 30, 31, 32]) AS talla 
WHERE modelo = 'F3000' AND sigla = 'U';