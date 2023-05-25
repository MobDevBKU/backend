import { HandlerTag } from '@constants';
import { findBusRouteSchema } from '@dtos/in';
import { busRouteSchema } from '@dtos/out';
import { busHandler } from '@handlers';
import { createPlugin } from '@utils';
import S from 'fluent-json-schema';

export const busPlugin = createPlugin(
    [HandlerTag.BUS],
    [
        {
            method: 'POST',
            url: '/routing',
            schema: {
                body: findBusRouteSchema,
                response: {
                    200: S.array().items(S.array().items(busRouteSchema))
                }
            },
            handler: busHandler.getRouting
        }
    ]
);
