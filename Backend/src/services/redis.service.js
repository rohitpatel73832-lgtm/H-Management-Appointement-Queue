import { createClient } from "redis";

let redisClient = null;
let redisReady = false;

const connectRedis = async () => {
    if (!process.env.REDIS_URL) {
        console.warn("REDIS_URL is missing. Cache is disabled.");
        return;
    }

    try {
        redisClient = createClient({
            url: process.env.REDIS_URL,
            socket: {
                connectTimeout: 5000,
                reconnectStrategy: false
            }
        });

        redisClient.on("error", (error) => {
            redisReady = false;
            console.error("Redis error:", error.message);
        });

        redisClient.on("ready", () => {
            redisReady = true;
            console.log("Redis is ready");
        });

        await redisClient.connect();

        redisReady = true;
        console.log("Redis connected successfully");
    } catch (error) {
        redisReady = false;
        redisClient = null;
        console.error("Redis connection failed:", error.message);
    }
};

const getCache = async (key) => {
    if (!redisClient || !redisReady) return null;

    try {
        const data = await redisClient.get(key);

        return data === null ? null : JSON.parse(data);
    } catch (error) {
        console.error("Redis cache read failed:", error.message);
        return null;
    }
};

const setCache = async (key, value, expiry = 60) => {
    if (!redisClient || !redisReady) return;

    try {
        await redisClient.set(
            key,
            JSON.stringify(value),
            { EX: expiry }
        );
    } catch (error) {
        console.error("Redis cache write failed:", error.message);
    }
};

const deleteCache = async (key) => {
    if (!redisClient || !redisReady) return;

    try {
        await redisClient.del(key);
    } catch (error) {
        console.error("Redis cache deletion failed:", error.message);
    }
};

const clearDoctorListCache = async () => {
    if (!redisClient || !redisReady) return;

    try {
        for await (const key of redisClient.scanIterator({
            MATCH: "hmanage:doctors:list:*",
            COUNT: 100
        })) {
            await redisClient.del(key);
        }
    } catch (error) {
        console.error(
            "Doctor list cache clearing failed:",
            error.message
        );
    }
};

export {
    connectRedis,
    getCache,
    setCache,
    deleteCache,
    clearDoctorListCache
};