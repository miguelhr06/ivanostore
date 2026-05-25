-- Primero creamos el tipo ENUM para los roles
CREATE TYPE user_role AS ENUM ('cliente', 'asesor', 'admin');

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY, -- Esto reemplaza al AUTO_INCREMENT
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    celular VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150),
    rol user_role DEFAULT 'cliente',
    puntos_ivano INT DEFAULT 0,
    creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logs_sesiones (
    id SERIAL PRIMARY KEY,
    usuario_id INT,
    evento VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario
      FOREIGN KEY(usuario_id) 
	  REFERENCES usuarios(id)
);