import { Route, Stop } from '@prisma/client';
import { prisma } from '@repositories';
import axios, { AxiosResponse } from 'axios';

const httpClient = axios.create({
    baseURL: 'http://apicms.ebms.vn/businfo'
});

async function getVarsByRoute(routeId: number): Promise<RawVar | null> {
    const response = await httpClient.get<unknown, AxiosResponse<RawVar[]>>(`/getvarsbyroute/${routeId}`);
    if (response.data.length > 0) return response.data[0];
    return null;
}

async function getAllRoutes() {
    const numOfRoutes = await prisma.route.count();
    if (numOfRoutes > 0) return [];

    const response = await httpClient.get<unknown, AxiosResponse<RawRoute[]>>('/getallroute');
    const routes: Route[] = response.data.map((route) => ({
        id: route.RouteId,
        no: route.RouteNo,
        name: route.RouteName,
        stopIds: []
    }));

    await prisma.route.createMany({
        data: routes,
        skipDuplicates: true
    });

    return routes;
}

async function getStopsByRouteId(routeId: number, routeNo: string) {
    const routeVar = await getVarsByRoute(routeId);
    if (routeVar === null) return;
    const response = await httpClient.get<unknown, AxiosResponse<RawStop[]>>(`/getstopsbyvar/${routeId}/${routeVar.RouteVarId}`);

    const stops: Stop[] = response.data.map((stop) => ({
        id: stop.StopId,
        name: stop.Name,
        lat: stop.Lat,
        lng: stop.Lng,
        type: stop.StopType === 'Bến xe' ? 'STATION' : 'STOP',
        routeNoes: []
    }));

    await prisma.stop.createMany({
        data: stops,
        skipDuplicates: true
    });

    const stopIds = stops.map((stop) => stop.id);
    await prisma.stop.updateMany({
        data: { routeNoes: { push: routeNo } },
        where: { id: { in: stopIds } }
    });

    await prisma.route.update({
        data: { stopIds: { set: stopIds } },
        where: { id: routeId }
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
