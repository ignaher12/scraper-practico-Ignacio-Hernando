import { cliente, jar } from './http.js'
import { config } from './config.js'
import { bootstrap } from './bootstrap.js'

async function main(){
    // const res = await cliente.get(config.QUESTION_URL)
    // console.log("status: ", res.status)
// 
    // const cookie = await jar.getCookies(config.QUESTION_URL)
// 
    // console.log("cookies:", cookie.map(c => c.key));

    const b = await bootstrap()
    console.log(b)


}

main().catch(err => console.error("ERROR", err.message))