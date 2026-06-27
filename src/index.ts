import { bootstrap } from "./bootstrap.js";
import { search } from "./search.js";
import { Documento, parsePartialResponse, parseRows } from "./parse.js";
import { config } from "./config.js";
import { listPage } from "./listPage.js";
import { withRetry, sleep } from "./retry.js";
async function main(){
    
    const b = await withRetry(() => bootstrap());
    const first_xml = await withRetry(() => search(b.viewState))
    let {html, viewState } = parsePartialResponse(first_xml)
    const data = parseRows(html)
    const reg: Documento [] = []
    reg.push(...data)
    let first = config.PAGE_SIZE

    while(first < config.MAX_REG){

        const xml = await withRetry(() => listPage(viewState, first))
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