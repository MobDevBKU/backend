import { StopType } from '@prisma/client';
import S from 'fluent-json-schema';

export const stopRouteSchema = S.object()
    .prop('id', S.number())
    .prop('lng', S.number())
    .prop('lat', S.number())
    .prop('name', S.string())
    .prop('type', S.enum([StopType.STATION, StopType.STOP]));

export type StopRouteDto = {
    id: number;
    lng: number;
    lat: number;
    name: string;
    type: StopType;
};

export const busRouteSchema = S.object()
    .prop('id', S.number())
    .prop('name', S.string())
    .prop('no', S.string())
    .prop('stops', S.array().items(stopRouteSchema));

export type BusRouteDto = {
    id: number;
    name: string;
    no: string;
    stops: StopRouteDto[];
}[];
