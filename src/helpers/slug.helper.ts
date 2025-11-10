// src/helpers/slug.helper.ts
import { Repository } from 'typeorm';

/**
 * Normaliza un texto para convertirlo en slug
 * Ejemplo: "Zapatos Deportivos Nike" → "zapatos-deportivos-nike"
 */
export function normalizeSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    throw new Error(`Texto inválido para slug: ${text}`);
  }

  return text
    .normalize("NFD") // Separar caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Eliminar diacríticos (acentos)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres no alfanuméricos por guiones
    .replace(/^-+|-+$/g, "") // Eliminar guiones al inicio y final
    .replace(/--+/g, "-"); // Eliminar múltiples guiones consecutivos
}

/**
 * Genera un slug único verificando en la base de datos
 */
export async function generateUniqueSlug(
  name: string,
  repository: Repository<any>,
  field: string = "slug"
): Promise<string> {
  if (!name || typeof name !== 'string') {
    throw new Error(`Nombre inválido para generar slug: ${name}`);
  }

  const baseSlug = normalizeSlug(name);
  let uniqueSlug = baseSlug;
  let counter = 1;

  // Verificar si el slug ya existe y generar variantes si es necesario
  while (await repository.findOne({ where: { [field]: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
    
    // Prevenir bucles infinitos (por seguridad)
    if (counter > 100) {
      throw new Error('No se pudo generar un slug único después de 100 intentos');
    }
  }

  return uniqueSlug;
}