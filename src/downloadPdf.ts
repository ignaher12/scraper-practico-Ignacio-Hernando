import { config } from "./config.js"
import { cliente } from "./http.js"

//se hace la peticion para descargar pdf.
export async function downloadPdf(viewState: string, componenteId: string, uuid: string){

    const body = new URLSearchParams(
    {
        [`${config.FORM_ID}`]: config.FORM_ID,
        [componenteId]: componenteId,
        'param_uuid': uuid,
        'javax.faces.ViewState': viewState,
    })

    const res = await cliente.post(config.QUESTION_URL, body, {headers:{
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        'responseType': 'arraybuffer'
    })

    const filename = res.headers['content-disposition']?.match(/filename="([^"]+)"/)?.[1] ?? `${uuid}.pdf`

    return { data: res.data, filename };
}