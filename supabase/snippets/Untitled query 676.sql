CREATE TABLE productos (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  talla INT NOT NULL,
  genero TEXT NOT NULL, 
  categoria TEXT,       
  stock INT DEFAULT 0,
  imagen_url TEXT,      
  created_at TIMESTAMPTZ DEFAULT NOW()
);