import { Response } from 'express';

const isPod = process.env.NODE_ENV === 'production';

export function setAuthCookie(
    res: Response,
    accessToken: string,
    refreshToken: string,
){
    const sameSite =(process.env.COOKIE_SAM_SITE as 'lax' | 'strict' | 'none') || 'lax';
    const secure = process.env.COOKIE_SECURE === 'true' || isPod;
    const domain = process.env.COOKIE_DOMAIN || undefined;
    
    res.cookie('access_token', accessToken,{
        httpOnly:true,
        secure,
        sameSite,
        domain,
        path: '/',
        maxAge: 15*60*1000,
    });

    res.cookie('refresh_token', refreshToken,{
        httpOnly: true,
        secure,
        sameSite,
        domain,
        path: '/',
        maxAge: 7*24*60*60*1000,
    });
}

export function clearAuthCookies(res:Response){
    const sameSite = (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax';
    const secure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
    const domain = process.env.COOKIE_DOMAIN || undefined;
    res.clearCookie('access_token', {
        httpOnly: true,
        secure,
        sameSite,
        domain,
        path: '/',
    });

    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure,
        sameSite,
        domain,
        path: '/',
    });
}