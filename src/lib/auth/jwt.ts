import { jwtVerify, SignJWT } from 'jose';
import { ZERO_AUTH_SECRET } from "$env/static/private";

export type JWTPayload = {
  sub: string;
  iat: number;
  exp?: number;
};

export async function create(userID: string) {
  const jwtPayload: JWTPayload = {
    sub: userID,
    iat: Math.floor(Date.now() / 1000),
  };

  return new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30days')
    .sign(new TextEncoder().encode(ZERO_AUTH_SECRET));
}

export async function verify(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(ZERO_AUTH_SECRET), {
    algorithms: ['HS256'],
  });
  return payload as JWTPayload;
}
