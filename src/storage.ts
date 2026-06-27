import { mkdirSync, writeFileSync } from "node:fs";
import { config } from "./config.js";
import { Documento } from "./parse.js";
import path from "node:path";

//crea dir si no existen(para que writeFile no falle)
export function ensureDirs(){

    mkdirSync(config.OUTPUT_PDF_DIR, { recursive: true })

}

//almacena JSONs data y failed y los PDFs

export function saveData(docs: Documento[]){
    const parse = JSON.stringify(docs, null, 2)
    writeFileSync(config.DATA_FILE, parse)
}

export function saveFailed(docs: Documento[]){
    const parse = JSON.stringify(docs, null, 2)
    writeFileSync(config.FAILED_FILE, parse)
}
export function savePdf(filename: string, data: ArrayBuffer){
    const clean_filename = filename.replace(/[\\/:*?"<>|]/g, '-')
    const p = path.join(config.OUTPUT_PDF_DIR, clean_filename)
    writeFileSync(p, Buffer.from(data))
}
