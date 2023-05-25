import { HandlerTag } from '@constants';
import { findBusRouteSchema } from '@dtos/in';
import { busHandler } from '@handlers';
import { createPlugin } from '@utils';

export const busPlugin = createPlugin(
    [HandlerTag.BUS],
    [
        {
            method: 'POST',
            url: '/routing',
            schema: {
                body: findBusRouteSchema
                // response: {
                //     200:
                // }
            },
            handler: busHandler.getRouting
        }
    ]
);
