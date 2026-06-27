import { config } from "./config.js";

// helper de espera 
export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {

    for (let intento = 0; intento <= config.MAX_RETRIES; intento++) {
        try {
            return await fn();
        } catch (err: any) {
            if(err.response?.status === 429){
                if(intento === config.MAX_RETRIES){
                    throw err;
                } else{
                    const espera = config.BASE_BACKOFF_MS * 2 ** intento
                    console.log(`429, reintento ${intento+1}, esperando ${espera}ms`)
                    await sleep(espera)
                }
            } else 
                throw err;
        }
    }

    throw new Error("withRetry: reintentos agotados");
}