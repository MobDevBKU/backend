import { Route, Stop } from '@prisma/client';
import { prisma } from '@repositories';
import axios, { AxiosResponse } from 'axios';

const httpClient = axios.create({
    baseURL: 'http://apicms.ebms.vn'
});

async function getAllRoutes() {
    const numOfRoutes = await prisma.route.count();
    if (numOfRoutes > 0) return [];

    const response = await httpClient.get<unknown, AxiosResponse<RawRoute[]>>('/businfo/getallroute');
    const routes: Route[] = response.data.map((route) => ({
        id: route.RouteId,
        no: route.RouteNo,
        name: route.RouteName
    }));

    await prisma.route.createMany({
        data: routes,
        skipDuplicates: true
    });

    return routes;
}

// async function getRouteById(routeId: number) {
//     const response = await httpClient.get(`/businfo/getroutebyid/${routeId}`)
//     console.log(response.data)
//     return response.data
// }

async function getStopsByRouteId(routeId: number, routeNo: string) {
    const response = await httpClient.get<unknown, AxiosResponse<RawStop[]>>(`/businfo/getstopsbyvar/${routeId}/1`);
    const stops: Stop[] = response.data.map((stop) => ({
        id: stop.StopId,
        name: stop.Name,
        lat: stop.Lat,
        lng: stop.Lng,
        type: stop.StopType === 'Bến xe' ? 'STATION' : 'STOP'
    }));

    await prisma.stop.createMany({
        data: stops,
        skipDuplicates: true
    });

    await prisma.routeCrossStop.createMany({
        data: stops.map((stop, idx) => ({ stopId: stop.id, routeNo, order: idx })),
        skipDuplicates: true
    });
}

export async function fetchBusData() {
    const routes = await getAllRoutes();

    if (routes.length === 0) {
        global.logger.info('Bus data already crawled !');
        return;
    }

    return Promise.all(
        routes.map(async (route) => {
            console.log('==========');
            console.log(`Got all stops of route: ${route.id} - ${route.no} - ${route.name}`);
            return getStopsByRouteId(route.id, route.no);
        })
    );
}
