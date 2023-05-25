import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'error'
        }
    ]
});

prisma.$on('error', (e) => {
    global.logger.info(e);
});
