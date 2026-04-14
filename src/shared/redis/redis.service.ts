import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy{
    private client : RedisClientType;
    async onModuleInit() {
        this.client = createClient({
            url:process.env.REDIS_URL,
        });
        this.client.on('error',(err) =>{
            console.error('Redis error:', err)
        });

        await this.client.connect();
    }
    async onModuleDestroy() {
        if(this.client){
            await this.client.quit();
        }
    }
    async set(key:string, value: string, ttlSeconds?: number){
        if(ttlSeconds){
            await this.client.set(key, value, {EX: ttlSeconds});
            return;
        }
        await this.client.set(key, value);
    }
    async get(key:string){
        return this.client.get(key);
    }
    async del(key: string) {
        return this.client.del(key);
    }

    async expire(key: string, ttlSeconds: number) {
        return this.client.expire(key, ttlSeconds);
    }
}