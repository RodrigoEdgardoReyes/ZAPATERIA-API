// src/common/utils/password.utils.ts
import * as bcrypt from 'bcrypt';
import { bcryptConfig } from '../config/bcrypt.config';

export class PasswordUtils {
  /**
   * Hashea una contraseña de forma segura
   */
  static async hashPassword(password: string): Promise<string> {
    this.validatePassword(password);
    return await bcrypt.hash(password, bcryptConfig.saltRounds);
  }

  /**
   * Compara una contraseña plana con un hash
   */
  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
      return false;
    }
    
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  }

  /**
   * Verifica si un string ya está hasheado
   */
  static isHashed(password: string): boolean {
    if (!password || typeof password !== 'string') {
      return false;
    }
    
    // El hash de bcrypt tiene formato: $2a$10$... (53 caracteres después del tercer $)
    const bcryptRegex = /^\$2[aby]\$\d+\$.{53}$/;
    return bcryptRegex.test(password);
  }

  /**
   * Valida los requisitos de una contraseña
   */
  private static validatePassword(password: string): void {
    if (!password) {
      throw new Error('La contraseña es requerida');
    }

    if (password.length < bcryptConfig.minPasswordLength) {
      throw new Error(`La contraseña debe tener al menos ${bcryptConfig.minPasswordLength} caracteres`);
    }

    if (password.length > bcryptConfig.maxPasswordLength) {
      throw new Error(`La contraseña no puede exceder ${bcryptConfig.maxPasswordLength} caracteres`);
    }
  }
}