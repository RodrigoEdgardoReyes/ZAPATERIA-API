import { nanoid } from 'nanoid';

export function generateSku(name: string, categoryId: number): string {
  // Validar que name no esté vacío
  if (!name || name.trim().length === 0) {
    throw new Error('El nombre es requerido para generar el SKU');
  }

  // Tomar las primeras 3 letras, o menos si el nombre es corto
  const prefix = name.substring(0, Math.min(3, name.length)).toUpperCase();

  return `${prefix}-${categoryId}-${nanoid(6).toUpperCase()}`;
}
