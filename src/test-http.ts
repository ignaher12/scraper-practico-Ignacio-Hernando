import { cliente, jar } from './http.js'
import { config } from './config.js'
import { bootstrap } from './bootstrap.js'
import { listPage } from './listPage.js'
import { search } from './search.js'
import {parsePartialResponse, parseRows} from './parse.js'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {downloadPdf} from './downloadPdf.js'
import { writeFileSync } from 'node:fs'

async function main(){
    // const res = await cliente.get(config.QUESTION_URL)
    // console.log("status: ", res.status)
// 
    // const cookie = await jar.getCookies(config.QUESTION_URL)
// 
    // console.log("cookies:", cookie.map(c => c.key));

    const b = await bootstrap()
    const xml = await search(b.viewState)


    const { html, viewState } = parsePartialResponse(xml)
    const filas = parseRows(html)
    const f_fila = filas.pop()

    if(f_fila){
        const pdf = await downloadPdf(viewState, f_fila.componenteId , f_fila.uuid)
        writeFileSync("output/prueba.pdf", Buffer.from(pdf))
    }

    //const l = await listPage(b.viewState, 0, '5318-2008')



}

main().catch(err => console.error("ERROR", err.message))