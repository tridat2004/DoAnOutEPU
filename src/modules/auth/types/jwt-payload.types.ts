export type JwtPayload = {
  sub: string;
  email: string;
  sid: string;
  type: 'access' | 'refresh';
};