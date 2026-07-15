import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Protege endpoints administrativos (crear/editar/borrar rifas, etc).
 * El cliente debe enviar el header `x-admin-api-key` con el valor
 * definido en la variable de entorno ADMIN_API_KEY.
 *
 * Es una solución simple mientras no exista un sistema de autenticación
 * de usuarios/roles. Si más adelante se agrega login de administradores,
 * este guard puede reemplazarse por uno basado en JWT/roles.
 */
@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-admin-api-key'];

    const expectedKey = process.env.ADMIN_API_KEY;

    if (!expectedKey) {
      // Si no hay una API key configurada en el servidor, bloqueamos
      // por defecto en vez de dejar el endpoint abierto sin querer.
      throw new UnauthorizedException(
        'ADMIN_API_KEY no está configurada en el servidor',
      );
    }

    if (!providedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException('API key inválida o ausente');
    }

    return true;
  }
}
