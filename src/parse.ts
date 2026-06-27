import * as cheerio from 'cheerio';

//a partir del xml, separa el contenido dentro de CDATA del viewState

export function parsePartialResponse(xml: string){

    const $ = cheerio.load(xml, {xmlMode:true})

    const viewState = $('update[id*="ViewState"]').text()

    const html = $('update').not('[id*="ViewState"]').text()
    return {html, viewState}
}

export interface Documento{
    expediente: string,
    administrador: string,
    descripcion: string,
    sector: string,
    resolucion: string,
    uuid: string,
    componenteId:string,
    motivoPdf: string
}

export function parseRows(html: string){

    //encierro en una tabla porque si no cheerio dropea los tr sueltos.
    const $ = cheerio.load(`<table>${html}</table>`)

    //data-ri y no simplemente tr para no traer headers y empty
    const r_data = $('tr[data-ri]')
    const filas: Documento[] = []
    r_data.each((i, el) => {
        const tds = $(el).find('td')
        const expediente = tds.eq(1).text().trim()
        const administrador = tds.eq(2).text().trim()
        const descripcion = tds.eq(3).text().trim()
        const sector = tds.eq(4).text().trim()
        const resolucion = tds.eq(5).text().trim()
        const onclick = tds.eq(6).find('a').attr('onclick')
        const uuid = onclick?.match(/param_uuid':'([0-9a-f-]+)'/)?.[1] ?? ''
        const componenteId = onclick?.match(/\{'([^']+)'/)?.[1] ?? ''
        let motivoPdf = ''
        if(uuid === '' && componenteId === ''){
            motivoPdf = tds.eq(6).text().trim()
        }

        filas.push({ expediente, administrador, descripcion, sector, resolucion, uuid, componenteId, motivoPdf})
    })

    return filas
}