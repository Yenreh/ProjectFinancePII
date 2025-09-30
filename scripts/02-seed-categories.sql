-- Seed default income categories
INSERT INTO categories (name, category_type, icon, color) VALUES
  ('Salario', 'ingreso', 'Briefcase', 'hsl(145, 60%, 45%)'),
  ('Freelance', 'ingreso', 'Laptop', 'hsl(145, 60%, 45%)'),
  ('Inversiones', 'ingreso', 'TrendingUp', 'hsl(145, 60%, 45%)'),
  ('Ventas', 'ingreso', 'ShoppingBag', 'hsl(145, 60%, 45%)'),
  ('Otros Ingresos', 'ingreso', 'Plus', 'hsl(145, 60%, 45%)')
ON CONFLICT (name) DO NOTHING;

-- Seed default expense categories
INSERT INTO categories (name, category_type, icon, color) VALUES
  ('Alimentación', 'gasto', 'UtensilsCrossed', 'hsl(25, 70%, 50%)'),
  ('Transporte', 'gasto', 'Car', 'hsl(200, 70%, 50%)'),
  ('Vivienda', 'gasto', 'Home', 'hsl(280, 60%, 50%)'),
  ('Servicios', 'gasto', 'Zap', 'hsl(45, 90%, 55%)'),
  ('Entretenimiento', 'gasto', 'Film', 'hsl(330, 70%, 55%)'),
  ('Salud', 'gasto', 'Heart', 'hsl(0, 70%, 50%)'),
  ('Educación', 'gasto', 'GraduationCap', 'hsl(210, 70%, 50%)'),
  ('Compras', 'gasto', 'ShoppingCart', 'hsl(300, 60%, 50%)'),
  ('Otros Gastos', 'gasto', 'MoreHorizontal', 'hsl(0, 0%, 50%)')
ON CONFLICT (name) DO NOTHING;
