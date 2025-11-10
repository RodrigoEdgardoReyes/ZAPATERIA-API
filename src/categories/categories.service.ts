import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { generateUniqueSlug } from 'src/helpers/slug.helper';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
  ) { }

  // Crear una nueva categoría
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      // Verifico si existe una categoría con el mismo nombre
      const existing = await this.categoryRepo.findOne({ where: { name: createCategoryDto.name } });

      if (existing) {
        return {
          ok: false,
          message: 'Ya existe una categoría con ese nombre',
          status: 409,
        };
      }

      // Generar un único basado en el nombre
      const slug = await generateUniqueSlug(createCategoryDto.name, this.categoryRepo);

      // Crear la nueva categoría
      const category = this.categoryRepo.create({
        ...createCategoryDto,
        slug,
      });

      // Guardamos la categoría en la base de datos
      await this.categoryRepo.save(category);

      // Retornamos respuesta de éxito
      return {
        ok: true,
        message: 'Categoría creada exitosamente',
        status: 201,
      };
    } catch (error) {
      // Capturamos errores y los devolvemos
      return {
        ok: false,
        message: error.message,
        status: 500,
      };
    }
  }

  // Obtener todas las categorías
  async findAll() {
    try {
      // Buscar categorias por estado activo|
      const categories = await this.categoryRepo.find({
        where: { isActive: true },
        relations: ['subcategories'], // Incluimos subcategorías si existen
      });

      // Verifico si la longitud es mayor a cero
      if (categories.length > 0) {
        return {
          ok: true,
          data: categories,
          status: 200,
        };
      }

      // Si no hay categorías a
      return {
        ok: false,
        message: 'No se encontraron categorías',
        status: 204,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        status: 500,
      };
    }
  }

  // Obtener una categoría por ID
  async findOne(id: number) {
    try {
      // Busco la categoría por id y estado activo
      const category = await this.categoryRepo.findOne({
        where: { id, isActive: true },
        relations: ['subcategories'],
      });

      // verifico si no existe
      if (!category) {
        return {
          ok: false,
          message: 'No se encontró la categoría',
          status: 404,
        };
      }

      // Si existe
      return {
        ok: true,
        data: category,
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

  // Actualizar una categoría
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      // Busco por id incluyendo relaciones
      const category = await this.categoryRepo.findOne({ where: { id } });

      // Verifico si la categoría existe
      if (!category) {
        return {
          ok: false,
          message: 'No se encontró la categoría',
          status: 404,
        };
      }

      // Si se proporciona un nuevo nombre verifico que no esté duplicado
      if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
        const existing = await this.categoryRepo.findOne({ where: { name: updateCategoryDto.name } });

        // Verifico si ya existe otra categoría con ese nombre
        if (existing) {
          return {
            ok: false,
            message: 'Ya existe una categoría con ese nombre',
            status: 409,
          };
        }
        // Genero un nuevo slug si el nombre cambia
        category.slug = await generateUniqueSlug(updateCategoryDto.name, this.categoryRepo);
      }

      // Si se actualiza el nombre, generamos un nuevo slug
      if (updateCategoryDto.name) {
        category.slug = await generateUniqueSlug(updateCategoryDto.name, this.categoryRepo);
      }

      // Actualizo los campos si se proporcionan nuevos valores
      category.name = updateCategoryDto.name ?? category.name;
      category.description = updateCategoryDto.description ?? category.description;
      category.imageUrl = updateCategoryDto.imageUrl ?? category.imageUrl;


      // Guardamos los cambios en la base
      await this.categoryRepo.save(category);

      return {
        ok: true,
        message: 'Categoría actualizada exitosamente',
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

  // Eliminar categoría
  async remove(id: number) {
    try {
      // Busco la categoría por id y estado activo
      const category = await this.categoryRepo.findOne({ where: { id, isActive: true } });

      // Verifico si la respuesta es nula
      if (!category) {
        return {
          ok: false,
          message: `No se encontró la categoría con ID ${id}`,
          status: 404,
        };
      }

      // Si existe paso el estado activo a false
      category.isActive = false;

      // Guardo los cambios en la base
      await this.categoryRepo.softRemove(category);

      return {
        ok: true,
        message: 'Categoría eliminada con exito',
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