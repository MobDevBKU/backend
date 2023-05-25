import { FindBusRouteDto } from '@dtos/in';
import { BusRouteDto } from '@dtos/out';
import { prisma } from '@repositories';
import { FastifyRequest } from 'fastify';

async function getRouting(request: FastifyRequest<{ Body: FindBusRouteDto }>): Result<BusRouteDto[]> {
    const stops = await prisma.stop.findMany({
        select: {
            id: true,
            lng: true,
            lat: true
        }
    });
    const query = request.body;

    const srcNearestBusStop = {
        id: Number.NaN,
        distance: Number.POSITIVE_INFINITY
    };
    const destNearestBusStop = {
        id: Number.NaN,
        distance: Number.POSITIVE_INFINITY
    };

    // Find src bus stop & dest bus stop
    for (const stop of stops) {
        const srcDistance = Math.sqrt(Math.pow(query.src.lng - stop.lng, 2) + Math.pow(query.src.lat - stop.lat, 2));
        if (srcNearestBusStop.distance > srcDistance) {
            srcNearestBusStop.id = stop.id;
            srcNearestBusStop.distance = srcDistance;
        }

        const destDistance = Math.sqrt(Math.pow(query.dest.lng - stop.lng, 2) + Math.pow(query.dest.lat - stop.lat, 2));
        if (destNearestBusStop.distance > destDistance) {
            destNearestBusStop.id = stop.id;
            destNearestBusStop.distance = destDistance;
        }
    }

    // Find all routes cross from src bus stop and dest bus stop
    const srcBusStop = await prisma.stop.findUniqueOrThrow({
        select: { routeNoes: true },
        where: { id: srcNearestBusStop.id }
    });

    const destBusStop = await prisma.stop.findUniqueOrThrow({
        select: { routeNoes: true },
        where: { id: destNearestBusStop.id }
    });

    // const routesCrossSrcButNotDest = srcBusStop.routeNoes.filter(x => !destBusStop.routeNoes.includes(x))
    // const routesCrossDestButNotSrc = destBusStop.routeNoes.filter(x => !srcBusStop.routeNoes.includes(x))
    const routeBothCrossSrcAndDest = srcBusStop.routeNoes.filter((x) => destBusStop.routeNoes.includes(x));

    if (routeBothCrossSrcAndDest.length > 0) {
        const route = await prisma.route.findFirstOrThrow({
            select: {
                id: true,
                name: true,
                no: true,
                stopIds: true
            },
            where: { no: { in: routeBothCrossSrcAndDest } }
        });

        const stops = await prisma.stop.findMany({
            select: {
                id: true,
                lng: true,
                lat: true,
                name: true,
                type: true
            },
            where: { id: { in: route.stopIds } }
        });

        return [
            {
                id: route.id,
                name: route.name,
                no: route.no,
                stops
            }
        ];
    }

    return [];
}

export const busHandler = {
    getRouting
};
