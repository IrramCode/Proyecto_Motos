CREATE TABLE IF NOT EXISTS compras (
  id SERIAL PRIMARY KEY,
  marca TEXT,
  modelo TEXT,
  precio NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
