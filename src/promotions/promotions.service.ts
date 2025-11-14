import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion) private readonly promoRepo: Repository<Promotion>,
  ) { }

  // Crear una nueva promoción
  async create(createPromotionDto: CreatePromotionDto) {
    try {
      // Creacion de promocion
      const promo = await this.promoRepo.create(createPromotionDto);

      // Guardamos la promoción en la base de datos
      await this.promoRepo.save(promo);

      // Mensaje de exito al crear
      return {
        ok: true,
        message: 'Promoción creada exitosamente',
        status: 201,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        status: error.status || 500,
      };
    }
  }

  // Obtener todas las promociones activas
  async findAll() {
    try {
      // Buscamos todas las promociones activas
      const promos = await this.promoRepo.find({ where: { isActive: true } });

      // Verifico si la longitud es mayor a cero
      if (promos.length > 0) {
        return {
          ok: true,
          data: promos,
          status: 200,
        };
      }

      // Si no se encuentran promociones
      return {
        ok: false,
        message: 'No se encontraron promociones',
        status: 204,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        status: error.status |500,
      };
    }
  }

  // Obtener una promoción por ID
  async findOne(id: number) {
    try {
      // Busco la promoción por ID y estado activo
      const promo = await this.promoRepo.findOne({ where: { id, isActive: true } });

      // Verifico si existe
      if (!promo) {
        return {
          ok: false,
          message: 'No se encontró la promoción',
          status: 404,
        };
      }

      // Si existe
      return {
        ok: true,
        data: promo,
        status: 200,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        status: error.status || 500,
      };
    }
  }

  // Actualizar una promoción
  async update(id: number, updatePromotionDto: UpdatePromotionDto) {
    try {
      // Busco la promoción por ID y estado activo
      const promo = await this.promoRepo.findOne({ where: { id, isActive: true } });

      // Verifico si existe
      if (!promo) {
        return {
          ok: false,
          message: 'No se encontró la promoción',
          status: 404,
        };
      }

      // Actualizamos los campos si se proporcionan nuevos valores
      promo.name = updatePromotionDto.name ?? promo.name;
      promo.description = updatePromotionDto.description ?? promo.description;
      promo.discountType = updatePromotionDto.discountType ?? promo.discountType;
      promo.discountValue = updatePromotionDto.discountValue ?? promo.discountValue;
      promo.minPurchaseAmount = updatePromotionDto.minPurchaseAmount ?? promo.minPurchaseAmount;
      promo.maxDiscountAmount = updatePromotionDto.maxDiscountAmount ?? promo.maxDiscountAmount;
      promo.usageLimit = updatePromotionDto.usageLimit ?? promo.usageLimit;
      promo.validFrom = new Date(updatePromotionDto.validFrom) ?? promo.validFrom;
      promo.validUntil = new Date(updatePromotionDto.validUntil) ?? promo.validUntil;

      // Guardamos los cambios en la base
      await this.promoRepo.save(promo);

      // Mensaje de exito al actualizar
      return {
        ok: true,
        message: 'Promoción actualizada exitosamente',
        status: 200,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        status: error.status || 500,
      };
    }
  }

  // Eliminar (borrado lógico) una promoción
  async remove(id: number) {
    try {
      // Buscamos la promoción por ID y estado activo
      const promo = await this.promoRepo.findOne({ where: { id, isActive: true } });

      // Verifico si existe
      if (!promo) {
        return {
          ok: false,
          message: 'No se encontró la promoción',
          status: 404,
        };
      }

      // Paso el estado activo a false
      promo.isActive = false;
      await this.promoRepo.softRemove(promo);

      return {
        ok: true,
        message: 'Promoción eliminada exitosamente',
        status: 200,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        status: error.status || 500,
      };
    }
  }
}
