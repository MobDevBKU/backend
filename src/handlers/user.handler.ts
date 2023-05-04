import { USER_NOT_FOUND } from '@constants';
import { prisma } from '@repositories';
import { UserDto } from '@dtos/out';
import { FastifyReply } from 'fastify';
import { AuthRequest } from '@interfaces';
import { Area, Language } from '@prisma/client';

async function getUserById(request: AuthRequest, reply: FastifyReply): Result<UserDto> {
    const userId: string = request.headers.userId;
    const user = await prisma.user.findUnique({
        select: {
            id: true,
            email: true,
            username: true,
            phone: true,
            numOfBusUsage: true,
            movedDistances: true,
            area: true,
            language: true
        },
        where: { id: userId }
    });
    if (user === null) return reply.badRequest(USER_NOT_FOUND);
    return user;
}

async function setArea(request: AuthRequest<{ Body: { area: Area } }>): Result<{ area: Area }> {
    await prisma.user.update({
        data: {
            area: request.body.area
        },
        where: { id: request.headers.userId }
    });
    return { area: request.body.area };
}

async function setLanguage(request: AuthRequest<{ Body: { language: Language } }>) {
    await prisma.user.update({
        data: {
            language: request.body.language
        },
        where: { id: request.headers.userId }
    });
    return { language: request.body.language };
}

async function setUsername(request: AuthRequest<{ Body: { username: string } }>) {
    await prisma.user.update({
        data: {
            username: request.body.username
        },
        where: { id: request.headers.userId }
    });
    return { username: request.body.username };
}

export const usersHandler = {
    getUserById,
    setArea,
    setLanguage,
    setUsername
};
