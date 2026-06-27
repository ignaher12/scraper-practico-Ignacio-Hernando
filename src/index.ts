import { bootstrap } from "./bootstrap.js";
import { search } from "./search.js";
import { Documento, parsePartialResponse, parseRows } from "./parse.js";
import { config } from "./config.js";
import { listPage } from "./listPage.js";
import { sleep } from "./retry.js";
async function main(){
    
    const b = await bootstrap();
    const s = await search(b.viewState)
    let {html, viewState } = parsePartialResponse(s)
    const data = parseRows(html)
    const reg: Documento [] = []
    reg.push(...data)
    let first = config.PAGE_SIZE

    while(first < config.MAX_REG){

        const xml = await listPage(viewState, first)
        const parsed = parsePartialResponse(xml)
        viewState = parsed.viewState
        const filas = parseRows(parsed.html)
        if(filas.length === 0)
            break
        reg.push(...filas)
        first += config.PAGE_SIZE
        await sleep(config.DELAY_BETWEEN_REQUESTS_MS)

    }

    for(const r of reg){
        console.log(r)
    }

}

main().catch(err => console.error("ERROR", err.message))