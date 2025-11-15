import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcategory } from './entities/subcategory.entity';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { Category } from 'src/categories/entities/category.entity';
import { generateUniqueSlug } from 'src/helpers/slug.helper';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory)private readonly subcategoryRepo:Repository<Subcategory>,

    @InjectRepository(Category)private readonly categoryRepo:Repository<Category>,
  ) {}

  // Creo una nueva subcategoría
  async create(createSubcategoryDto: CreateSubcategoryDto) {
    try {
      // Verifico si ya existe una subcategoría con ese nombre
      const existing = await this.subcategoryRepo.findOne({ where: { name: createSubcategoryDto.name } });

      // si existe
      if (existing) {
        return {
          ok: false,
          message: 'Ya existe una subcategoría con ese nombre',
          status: 409,
        };
      }

      // Verifico que la categoría relacionada exista
      const category = await this.categoryRepo.findOne({ where: { id: createSubcategoryDto.categoryId, isActive: true } });

      // si no existe
      if (!category) {
        return {
          ok: false,
          message: 'La categoría relacionada no existe',
          status: 400,
        };
      }

      // Genero un slug único basado en el nombre
      const slug = await generateUniqueSlug(createSubcategoryDto.name, this.subcategoryRepo);

      // Creo la entidad con los datos del DTO y el slug generado
      const subcategory = this.subcategoryRepo.create({
        ...createSubcategoryDto,
        slug,
      });

      // Guardo la subcategoría en la base de datos
      await this.subcategoryRepo.save(subcategory);

      return {
        ok: true,
        message: 'Subcategoría creada exitosamente',
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

  // Obtengo todas las subcategorías activas
  async findAll() {
    try {
      // Busco todas las subcategorías activas e incluyo la categoría relacionada
      const subcategories = await this.subcategoryRepo.find({
        where: { isActive: true },
        relations: ['category'],
      });

      // Verifo si encontré subcategorías
      if (subcategories.length > 0) {
        return {
          ok: true,
          data: subcategories,
          status: 200,
        };
      }

      // Si no encontré ninguna
      return {
        ok: false,
        message: 'No se encontraron subcategorías',
        status: 204,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        status: error.status || 500,
      };
    }
  }

  // Obtengo una subcategoría por ID
  async findOne(id: number) {
    try {
      // Busco la subcategoría por id y estado activo e incluyo la categoría relacionada
      const subcategory = await this.subcategoryRepo.findOne({
        where: { id, isActive: true },
        relations: ['category'],
      });

      // Verifico si la respuesta es nula
      if (!subcategory) {
        return {
          ok: false,
          message: 'No se encontró la subcategoría',
          status: 404,
        };
      }
      // Si la encontré, la retorno
      return {
        ok: true,
        data: subcategory,
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

  // Actualizo una subcategoría
  async update(id: number, updateSubcategoryDto: UpdateSubcategoryDto) {
    try {
      // Busco la subcategoría por id y estado activo
      const subcategory = await this.subcategoryRepo.findOne({ where: { id, isActive: true } });

      // Verifico si la subcategoría existe
      if (!subcategory) {
        return {
          ok: false,
          message: 'No se encontró la subcategoría',
          status: 404,
        };
      }

      // Si se proporciona un nuevo nombre, verifico duplicado y genero nuevo slug
      if (updateSubcategoryDto.name && updateSubcategoryDto.name !== subcategory.name) {
        // Verifico si ya existe una subcategoría con ese nombre
        const existing = await this.subcategoryRepo.findOne({ where: { name: updateSubcategoryDto.name } });

        // Si existe
        if (existing) {
          return {
            ok: false,
            message: 'Ya existe una subcategoría con ese nombre',
            status: 409,
          };
        }

        // Genero un nuevo slug único
        subcategory.slug = await generateUniqueSlug(updateSubcategoryDto.name, this.subcategoryRepo);

        // Actualizo el nombre
        subcategory.name = updateSubcategoryDto.name;
      }

      // Si se proporciona una nueva categoría, verifico que exista
      if (updateSubcategoryDto.categoryId && updateSubcategoryDto.categoryId !== subcategory.categoryId) {
        // Verifico que la categoría relacionada exista por id y estado activo
        const category = await this.categoryRepo.findOne({ where: { id: updateSubcategoryDto.categoryId, isActive: true } });

        // Si no existe
        if (!category) {
          return {
            ok: false,
            message: 'La categoría relacionada no existe',
            status: 400,
          };
        }

        // Si existe, actualizo el categoryId
        subcategory.categoryId = updateSubcategoryDto.categoryId;
      }

      // Actualizo los demas campos si se proporcionan nuevos valores
      subcategory.description = updateSubcategoryDto.description ?? subcategory.description;
      subcategory.imageUrl = updateSubcategoryDto.imageUrl ?? subcategory.imageUrl;

      // Guardo los cambios en la base
      await this.subcategoryRepo.save(subcategory);

      // Mensaje de éxito al actualizar
      return {
        ok: true,
        message: 'Subcategoría actualizada exitosamente',
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

  // Elimino una subcategoría
  async remove(id: number) {
    try {
      // Busco la subcategoría por id y estado activo
      const subcategory = await this.subcategoryRepo.findOne({ where: { id, isActive: true } });

      // Verifico si la subcategoría existe
      if (!subcategory) {
        return {
          ok: false,
          message: 'No se encontró la subcategoría',
          status: 404,
        };
      }

      // Paso el estado activo a falso
      subcategory.isActive = false;

      // Elimoo la subcategoría
      await this.subcategoryRepo.softRemove(subcategory);

      // Mensaje de éxito al eliminar
      return {
        ok: true,
        message: 'Subcategoría eliminada exitosamente',
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
