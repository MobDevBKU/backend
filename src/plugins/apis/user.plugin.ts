import { HandlerTag } from '@constants';
import { userSchema } from '@dtos/out';
import { usersHandler } from '@handlers';
import { Area, Language } from '@prisma/client';
import { createPlugin } from '@utils';
import S from 'fluent-json-schema';

export const userPlugin = createPlugin(
    [HandlerTag.USER],
    [
        {
            method: 'GET',
            url: '',
            schema: {
                response: {
                    200: userSchema
                }
            },
            handler: usersHandler.getUserById
        },
        {
            method: 'PATCH',
            url: '/username',
            schema: {
                body: S.object().prop('username', S.string().required()),
                response: {
                    200: S.object().prop('username', S.string())
                }
            },
            handler: usersHandler.setUsername
        },
        {
            method: 'PATCH',
            url: '/language',
            schema: {
                body: S.object().prop('language', S.enum([Language.EN, Language.VI]).required()),
                response: {
                    200: S.object().prop('language', S.enum([Language.EN, Language.VI]))
                }
            },
            handler: usersHandler.setLanguage
        },
        {
            method: 'PATCH',
            url: '/area',
            schema: {
                body: S.object().prop('area', S.enum([Area.HCMC, Area.HANOI, Area.DANANG]).required()),
                response: {
                    200: S.object().prop('area', S.enum([Area.HCMC, Area.HANOI, Area.DANANG]))
                }
            },
            handler: usersHandler.setArea
        }
    ]
);
