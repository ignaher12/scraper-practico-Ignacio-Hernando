import { cliente } from "./http.js";
import { config } from "./config.js";

export async function search(viewState: string, criterio:string = ''){
    const body = new URLSearchParams(
    {
        'javax.faces.partial.ajax': 'true',
        'javax.faces.source': `${config.FORM_ID}:btnBuscar`,
        'javax.faces.partial.execute': '@all',
        'javax.faces.partial.render': `${config.FORM_ID}:pgLista`,   
        [`${config.FORM_ID}:txtNroexp`]: criterio,
        [`${config.DT_ID}`]: config.DT_ID,
        [`${config.FORM_ID}`]: config.FORM_ID,
        'javax.faces.ViewState': viewState,
        [`${config.FORM_ID}:btnBuscar`]: `${config.FORM_ID}:btnBuscar`,
        [`${config.FORM_ID}:j_idt21`]: '',
        [`${config.FORM_ID}:j_idt25`]: '',
        [`${config.FORM_ID}:idsector`]: '',
        [`${config.FORM_ID}:j_idt34`]: '',
    })



    const res = await cliente.post(config.QUESTION_URL, body, {headers:{
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Faces-Request': 'partial/ajax',
        'X-Requested-With': 'XMLHttpRequest',
    }})

    return res.data
}