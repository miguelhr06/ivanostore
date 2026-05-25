DO $$ 
DECLARE 
    nuevo_id bigint;
    -- CONFIGURACIÓN DEL MODELO AURA BLANCO
    v_nombre_zap text := 'ZAPATILLAS PARA HOMBRE MODELO AURA BLANCO';
    v_modelo_cod text := 'F0115'; -- Columna "modelo"
    v_sigla      text := 'I';
    v_precio     numeric := 160.00;
    v_color      text := 'BLANCO';
    v_cat        text := 'grande';
    
    -- RUTA: grande/F0115/I
    v_path       text := v_cat || '/' || v_modelo_cod || '/' || v_sigla;
BEGIN
    -- 1. Insertamos usando los nombres de columna reales de tu tabla
    INSERT INTO public.modelos (
        nombre_zapatilla, modelo, sigla, precio, categoria, color,
        descripcion,
        imagen_url, imagen_url_2, imagen_url_3, imagen_url_4, imagen_url_5
    )
    VALUES (
        v_nombre_zap, v_modelo_cod, v_sigla, v_precio, v_cat, v_color,
        'Las Ivano Low Aura, son unas zapatillas de caña baja con un diseño versátil, y con toques de color, que elevarán tus outfits. Material: Cuero. Forro: Textil. Suela: 100% Caucho. Estilo: Urbano.',
        v_path || '/1.jpg', 
        v_path || '/2.jpg', 
        v_path || '/3.jpg', 
        v_path || '/4.jpg', 
        v_path || '/5.jpg'
    )
    RETURNING id INTO nuevo_id;

    -- 2. Insertamos las tallas (39 al 43) con stock de 100
    INSERT INTO public.variantes_stock (modelo_id, talla, stock)
    VALUES 
        (nuevo_id, 39, 100), 
        (nuevo_id, 40, 100), 
        (nuevo_id, 41, 100), 
        (nuevo_id, 42, 100),
        (nuevo_id, 43, 100);

    RAISE NOTICE 'Modelo AURA BLANCO (F0115) insertado con éxito.';
END $$;

UPDATE public.modelos
SET 
    imagen_url = 'F0115-I-1.jpg',
    imagen_url_2 = 'F0115-I-2.jpg',
    imagen_url_3 = 'F0115-I-3.jpg',
    imagen_url_4 = 'F0115-I-4.jpg',
    imagen_url_5 = 'F0115-I-5.jpg'
WHERE modelo = 'F0115';