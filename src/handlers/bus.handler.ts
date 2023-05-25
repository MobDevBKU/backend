import { FindBusRouteDto } from '@dtos/in';
import { BusRouteDto } from '@dtos/out';
import { Route } from '@prisma/client';
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
        select: { id: true, routeNoes: true },
        where: { id: srcNearestBusStop.id }
    });

    const destBusStop = await prisma.stop.findUniqueOrThrow({
        select: { id: true, routeNoes: true },
        where: { id: destNearestBusStop.id }
    });
    console.log(srcBusStop, destBusStop);

    const routeNoesCrossSrc = srcBusStop.routeNoes.filter((x) => !destBusStop.routeNoes.includes(x));
    const routeNoesCrossDest = destBusStop.routeNoes.filter((x) => !srcBusStop.routeNoes.includes(x));
    const routeNoesBothCrossSrcAndDest = srcBusStop.routeNoes.filter((x) => destBusStop.routeNoes.includes(x));

    if (routeNoesBothCrossSrcAndDest.length > 0) {
        const routes = await prisma.route.findMany({
            select: {
                id: true,
                name: true,
                no: true,
                stopIds: true
            },
            where: { no: { in: routeNoesBothCrossSrcAndDest } }
        });

        return Promise.all(
            routes.map(async (route) => {
                const stopIds = route.stopIds;
                const stops = await prisma.stop.findMany({
                    select: {
                        id: true,
                        lng: true,
                        lat: true,
                        name: true,
                        type: true
                    },
                    where: { id: { in: stopIds.slice(stopIds.indexOf(srcBusStop.id), stopIds.indexOf(destBusStop.id) + 1) } }
                });
                return [
                    {
                        id: route.id,
                        name: route.name,
                        no: route.no,
                        stops
                    }
                ];
            })
        );
    }

    const routesCrossSrc = await prisma.route.findMany({
        select: {
            id: true,
            name: true,
            no: true,
            stopIds: true
        },
        where: { no: { in: routeNoesCrossSrc } }
    });

    const routesCrossDest = await prisma.route.findMany({
        select: {
            id: true,
            name: true,
            no: true,
            stopIds: true
        },
        where: { no: { in: routeNoesCrossDest } }
    });

    const results = await Promise.all(
        routesCrossSrc.map((routeCrossSrc) => {
            const intersections = routesCrossDest
                .map((routeCrossDest) => _getStopIntersection(routeCrossSrc, routeCrossDest, srcBusStop.id, destBusStop.id))
                .filter((item) => item !== null);

            return Promise.all(
                intersections.map(async (intersection) => {
                    if (!intersection) return [];
                    const srcStops = await prisma.stop.findMany({
                        select: {
                            id: true,
                            lng: true,
                            lat: true,
                            name: true,
                            type: true
                        },
                        where: { id: { in: intersection.crossSrc.stopIds } }
                    });
                    const destStops = await prisma.stop.findMany({
                        select: {
                            id: true,
                            lng: true,
                            lat: true,
                            name: true,
                            type: true
                        },
                        where: { id: { in: intersection.crossDest.stopIds } }
                    });
                    return [
                        {
                            id: intersection.crossSrc.id,
                            name: intersection.crossSrc.name,
                            no: intersection.crossSrc.no,
                            stops: srcStops
                        },
                        {
                            id: intersection.crossDest.id,
                            name: intersection.crossDest.name,
                            no: intersection.crossDest.no,
                            stops: destStops
                        }
                    ];
                })
            );
        })
    );

    return results.flat();
}

function _getStopIntersection(routeCrossSrc: Route, routeCrossDest: Route, srcStopId: number, destStopId: number) {
    routeCrossSrc.stopIds = routeCrossSrc.stopIds.slice(
        routeCrossSrc.stopIds.indexOf(srcStopId),
        routeCrossSrc.stopIds.indexOf(destStopId) + 1
    );
    routeCrossDest.stopIds = routeCrossDest.stopIds.slice(
        routeCrossDest.stopIds.indexOf(srcStopId),
        routeCrossDest.stopIds.indexOf(destStopId) + 1
    );

    for (const stopId1 of routeCrossSrc.stopIds) {
        for (const stopId2 of routeCrossDest.stopIds) {
            if (stopId1 !== stopId2) continue;
            return {
                crossSrc: {
                    ...routeCrossSrc,
                    stopIds: routeCrossSrc.stopIds.slice(0, routeCrossSrc.stopIds.indexOf(stopId2) + 1)
                },
                crossDest: {
                    ...routeCrossDest,
                    stopIds: routeCrossDest.stopIds.slice(routeCrossDest.stopIds.indexOf(stopId2))
                },
                interSectionStopId: stopId1
            };
        }
    }
    return null;
}

export const busHandler = {
    getRouting
};
