import S from 'fluent-json-schema';

const coordinatorSchema = S.object()
    .required()
    .prop('lat', S.number().required().description('Latitude'))
    .prop('lng', S.number().required().description('Longtitude'));
export const findBusRouteSchema = S.object().prop('src', coordinatorSchema).prop('dest', coordinatorSchema);

export type FindBusRouteDto = {
    src: {
        lat: number;
        lng: number;
    };
    dest: {
        lat: number;
        lng: number;
    };
};
