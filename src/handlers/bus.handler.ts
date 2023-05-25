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
                .map((routeCrossDest) => _getStopIntersection(routeCrossSrc, routeCrossDest))
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

function _getStopIntersection(routeCrossSrc: Route, routeCrossDest: Route) {
    const srcStopIds = routeCrossSrc.stopIds;
    const destStopIds = routeCrossDest.stopIds;

    for (const stopId1 of srcStopIds) {
        for (const stopId2 of routeCrossDest.stopIds) {
            if (stopId1 !== stopId2) continue;
            console.log(stopId1);
            return {
                crossSrc: {
                    ...routeCrossSrc,
                    stopIds: srcStopIds.slice(0, srcStopIds.indexOf(stopId2) + 1)
                },
                crossDest: {
                    ...routeCrossDest,
                    stopIds: destStopIds.slice(destStopIds.indexOf(stopId2))
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
