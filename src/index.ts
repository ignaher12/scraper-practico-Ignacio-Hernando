import { bootstrap } from "./bootstrap.js";
import { search } from "./search.js";
import { Documento, parsePartialResponse, parseRows } from "./parse.js";
import { config } from "./config.js";
import { listPage } from "./listPage.js";
import { withRetry, sleep } from "./retry.js";
import { downloadPdf } from "./downloadPdf.js";
import { ensureDirs, saveData, saveFailed, savePdf } from "./storage.js";

function esPdf(data: ArrayBuffer): boolean {
    return Buffer.from(data).subarray(0, 5).toString('latin1') === '%PDF-'
}

async function bajarPdfs(filas: Documento[], viewState: string, failed: Documento[]){
    for (const fila of filas){
        if(fila.uuid === '') continue
        try {

            const { data, filename } = await withRetry(
                () => downloadPdf(viewState, fila.componenteId, fila.uuid)
            )
            if (esPdf(data)) {
                savePdf(filename, data)
            } else {

                console.warn(`No es PDF: ${fila.expediente}`)

                failed.push(fila)        
            }
        } catch (err) {

            console.warn(`Fallo descarga (${fila.expediente}): ${err}`)

            failed.push(fila)            
        }
        await sleep(config.DELAY_BETWEEN_REQUESTS_MS)
    }
}
async function main(){
    
    ensureDirs()
    const reg: Documento [] = []
    const failed: Documento [] = []

    const b = await withRetry(() => bootstrap());
    const first_xml = await withRetry(() => search(b.viewState))
    let {html, viewState } = parsePartialResponse(first_xml)
    const data = parseRows(html)

    console.log(`Pagina 1: ${data.length} registros`)

    reg.push(...data)
    await bajarPdfs(data, viewState, failed)

    let first = config.PAGE_SIZE
    
    while(first < config.MAX_REG){
        try{

            const xml = await withRetry(() => listPage(viewState, first))
            const parsed = parsePartialResponse(xml)
            viewState = parsed.viewState
            const filas = parseRows(parsed.html)
    
            console.log(`Pagina ${first / config.PAGE_SIZE + 1}: ${filas.length} registros`)
    
            if(filas.length === 0)
                break
            reg.push(...filas)
            await bajarPdfs(filas, viewState, failed)
            first += config.PAGE_SIZE

            saveData(reg)
            saveFailed(failed)

            await sleep(config.DELAY_BETWEEN_REQUESTS_MS)
        } catch(err){
            console.log(`Error ${err} en la pagina ${first}`)
            saveData(reg)
            saveFailed(failed)
            break
        }

    }

    const sinPdf = reg.filter(d => d.motivoPdf !== '').length
    const descargados = reg.length - sinPdf - failed.length
    console.log(`${reg.length} registros · ${descargados} PDFs descargados · ${sinPdf} sin PDF (confidencial) · ${failed.length} fallos reales`)
    console.log(` Datos en ${config.DATA_FILE} | PDFs en ${config.OUTPUT_PDF_DIR}`)

    saveData(reg)
    saveFailed(failed)

}

main().catch(err => console.error("ERROR", err.message))