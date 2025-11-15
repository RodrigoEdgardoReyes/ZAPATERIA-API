import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)private readonly roleRepo: Repository<Role>,
  ) {}

  // Creo un nuevo rol
  async create(createRoleDto: CreateRoleDto) {
    try {
      // Verifico si ya existe un rol con el mismo nombre
      const existing = await this.roleRepo.findOne({ where: { name: createRoleDto.name } });

      // si existe
      if (existing) {
        return {
          ok: false,
          message: 'Ya existe un rol con ese nombre',
          status: 409,
        };
      }

      // Creo la entidad y la guardo
      const role = await this.roleRepo.create(createRoleDto);
      await this.roleRepo.save(role);

      // Mensaje de éxito al crear
      return {
        ok: true,
        message: 'Rol creado exitosamente',
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

  // Obtengo todos los roles activos
  async findAll() {
    try {
      // Busco los roles por estado activo
      const roles = await this.roleRepo.find({ where: { isActive: true } });

      // Verifico si la longitud es mayor a cero
      if (roles.length > 0) {
        return {
          ok: true,
          data: roles,
          status: 200,
        };
      }

      // Si no hay roles activos
      return {
        ok: false,
        message: 'No se encontraron roles',
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

  // Obtengo un rol por ID
  async findOne(id: number) {
    try {
      // Busco el rol por id y estado activo
      const role = await this.roleRepo.findOne({ where: { id, isActive: true } });

      // Si no lo encuentro
      if (!role) {
        return {
          ok: false,
          message: 'No se encontró el rol',
          status: 404,
        };
      }

      // Si lo encuentro
      return {
        ok: true,
        data: role,
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

  // Actualizo un rol
  async update(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      // Busco el rol por id y estado activo
      const role = await this.roleRepo.findOne({ where: { id, isActive: true } });

      // Si no lo encuentro
      if (!role) {
        return {
          ok: false,
          message: 'No se encontró el rol',
          status: 404,
        };
      }

      // Si se proporciona un nuevo nombre, verifico que no esté duplicado
      if (updateRoleDto.name && updateRoleDto.name !== role.name) {
        // Busco si ya existe otro rol con ese nombre
        const existing = await this.roleRepo.findOne({ where: { name: updateRoleDto.name } });

        // si existe otro con ese nombre
        if (existing) {
          return {
            ok: false,
            message: 'Ya existe un rol con ese nombre',
            status: 409,
          };
        }
        // Actualizo el nombre
        role.name = updateRoleDto.name;
      }

      // Guardo los cambios en la base
      await this.roleRepo.save(role);

      // Mensaje de éxito al actualizar
      return {
        ok: true,
        message: 'Rol actualizado exitosamente',
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

  // Elimino un rol (borrado lógico)
  async remove(id: number) {
    try {
      // Busco el rol por id y estado activo
      const role = await this.roleRepo.findOne({ where: { id, isActive: true } });

      // Si no lo encuentro
      if (!role) {
        return {
          ok: false,
          message: 'No se encontró el rol',
          status: 404,
        };
      }

      // Paso el estado activo a falso
      role.isActive = false;

      // Guardo los cambios en la base
      await this.roleRepo.softRemove(role);

      // Mensaje de éxito al eliminar
      return {
        ok: true,
        message: 'Rol eliminado exitosamente',
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
