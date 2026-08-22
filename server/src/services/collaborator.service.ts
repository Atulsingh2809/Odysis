import prisma from '../config/database.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { requireTripPermission } from './authorization.service.js';

export class CollaboratorService {
  async list(tripId: string, userId: string) {
    await requireTripPermission(tripId, userId, 'read');
    return prisma.tripCollaborator.findMany({
      where: { tripId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async invite(tripId: string, userId: string, email: string, role: 'EDITOR' | 'VIEWER') {
    await requireTripPermission(tripId, userId, 'admin');

    const invitee = await prisma.user.findUnique({ where: { email } });
    if (!invitee) throw new NotFoundError('User not found with that email', 'USER_NOT_FOUND');
    if (invitee.id === userId) throw new ConflictError('Cannot invite yourself');

    const existing = await prisma.tripCollaborator.findUnique({
      where: { tripId_userId: { tripId, userId: invitee.id } },
    });
    if (existing) throw new ConflictError('User is already a collaborator');

    return prisma.tripCollaborator.create({
      data: { tripId, userId: invitee.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async updateRole(tripId: string, ownerId: string, targetUserId: string, role: 'EDITOR' | 'VIEWER') {
    await requireTripPermission(tripId, ownerId, 'admin');

    const collab = await prisma.tripCollaborator.findUnique({
      where: { tripId_userId: { tripId, userId: targetUserId } },
    });
    if (!collab) throw new NotFoundError('Collaborator not found');
    if (collab.role === 'OWNER') throw new ConflictError('Cannot change owner role');

    return prisma.tripCollaborator.update({
      where: { id: collab.id },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(tripId: string, ownerId: string, targetUserId: string) {
    await requireTripPermission(tripId, ownerId, 'admin');

    const collab = await prisma.tripCollaborator.findUnique({
      where: { tripId_userId: { tripId, userId: targetUserId } },
    });
    if (!collab) throw new NotFoundError('Collaborator not found');
    if (collab.role === 'OWNER') throw new ConflictError('Cannot remove trip owner');

    await prisma.tripCollaborator.delete({ where: { id: collab.id } });
    return { message: 'Collaborator removed' };
  }
}

export const collaboratorService = new CollaboratorService();
