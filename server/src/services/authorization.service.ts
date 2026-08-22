import { CollaboratorRole } from '@prisma/client';
import prisma from '../config/database.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';

export type TripPermission = 'read' | 'write' | 'admin';

const rolePermissions: Record<CollaboratorRole, TripPermission[]> = {
  OWNER: ['read', 'write', 'admin'],
  EDITOR: ['read', 'write'],
  VIEWER: ['read'],
};

export async function getTripAccess(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      collaborators: { where: { userId } },
    },
  });

  if (!trip) throw new NotFoundError('Trip not found', 'TRIP_NOT_FOUND');

  if (trip.userId === userId) {
    return { trip, role: 'OWNER' as CollaboratorRole, permissions: rolePermissions.OWNER };
  }

  const collab = trip.collaborators[0];
  if (!collab) throw new ForbiddenError('You do not have access to this trip', 'TRIP_FORBIDDEN');

  return {
    trip,
    role: collab.role,
    permissions: rolePermissions[collab.role],
  };
}

export async function requireTripPermission(
  tripId: string,
  userId: string,
  permission: TripPermission,
) {
  const access = await getTripAccess(tripId, userId);
  if (!access.permissions.includes(permission)) {
    throw new ForbiddenError(`Insufficient permissions for ${permission}`, 'INSUFFICIENT_PERMISSION');
  }
  return access;
}

export async function getUserTripIds(userId: string): Promise<string[]> {
  const owned = await prisma.trip.findMany({
    where: { userId },
    select: { id: true },
  });
  const collab = await prisma.tripCollaborator.findMany({
    where: { userId },
    select: { tripId: true },
  });
  return [...new Set([...owned.map((t) => t.id), ...collab.map((c) => c.tripId)])];
}
