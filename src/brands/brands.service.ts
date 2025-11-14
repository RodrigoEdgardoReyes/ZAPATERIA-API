import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BrandsService {
  constructor(
   @InjectRepository(Brand)private readonly brandRepository:Repository<Brand>,
  ) { console.log('BrandsService cargado...')}

  // Crear marca
  async create(createBrandDto: CreateBrandDto) {
    try {
      // Crear la nueva marca
      const brand = await this.brandRepository.create(createBrandDto);

      // Guardar la marca en la base de datos
      await this.brandRepository.save(brand);

      // Mensjae de exito al crear la marca
      return {
        ok: true,
        message: 'Marca creada exitosamente',
        status: 201,
      }
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        status: 500,
      }
    }
  }

  // Buscar todas las marcas
  async findAll() {
    try {
      //Buscar las marcas por estado activo
      const brands = await this.brandRepository.find({ where: { isActive: true } });

      // Verifico si la longitud es mayor a cero
      if (brands.length > 0) {
        return {
          ok: true,
          data: brands,
          status: 200,
        };
      }

      // Si no hay marcas activas
      return {
        ok: false,
        message: 'No se encontraron marcas',
        status: 204,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        status: 500,
      }
    }
  }

  // Buscar una marca por ID
  async findOne(id: number) {
    try {
      // Buscar la marca por ID y estado activo
      const brand = await this.brandRepository.findOne({ where: { id, isActive: true } });

      // Verifico si la marca existe
      if (!brand) {
        return {
          ok: false,
          message: 'No se encontró la marca',
          status: 404,
        };
      }

      // Si la marca existe, la retorno
      return {
        ok: true,
        data: brand,
        status: 200,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        status: 500,
      };
    }
  }

  // Actualizar una marca
  async update(id: number, updateBrandDto: UpdateBrandDto) {
    try {
      // Buscar la marca por ID
      const brand = await this.brandRepository.findOne({ where: { id } });

      // Verifico si la marca existe
      if (!brand) {
        return {
          ok: false,
          message:'No se encontró la marca',
          status: 404,
        };
      }
      
      // Verifico si se proporciona un nuevo dato si no mantengo el actual
      brand.name = updateBrandDto.name ?? brand.name;
      brand.description = updateBrandDto.description ?? brand.description;
      brand.logoUrl = updateBrandDto.logoUrl ?? brand.logoUrl;

      // Guardo los cambios en la base
      await this.brandRepository.save(brand);

      // Mensaje de exito al actualizar la marca
      return {
        ok: true,
        message: 'Marca actualizada exitosamente',
        status: 200,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        status: 500,
      };
    }
  }

  // Eliminar marca
  async remove(id: number) {
    try {
      // Busco una marca por id y estado activo
      const brand = await this.brandRepository.findOne({ where: { id, isActive: true } });

      // Verifico si la marca existe
      if (!brand) {
        return {
          ok: false,
          message: 'No se encontró la marca',
          status: 404,
        };
      }

      brand.isActive = false;
      await this.brandRepository.softRemove(brand);

      return {
        ok: true,
        message: 'Marca eliminada con exito',
        status: 200,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        status: 500,
      };
    }
  }

}
