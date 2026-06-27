import { cliente } from "./http.js";
import { config } from "./config.js";

export async function listPage(viewState: string, first:number, criterio:string = ''){
    const body = new URLSearchParams(
    {
        'javax.faces.partial.ajax': 'true',
        'javax.faces.source': config.DT_ID,
        'javax.faces.partial.execute': config.DT_ID,
        'javax.faces.partial.render': config.DT_ID,
        [`${config.DT_ID}_pagination`]: 'true',
        [`${config.DT_ID}_first`]: String(first),      
        [`${config.DT_ID}_rows`]: '10',      
        [`${config.DT_ID}_encodeFeature`]: 'true',
        [`${config.DT_ID}`]: config.DT_ID,
        [`${config.FORM_ID}`]: config.FORM_ID,
        [`${config.FORM_ID}:txtNroexp`]: criterio,
        'javax.faces.ViewState': viewState,
    })

    const res = await cliente.post(config.QUESTION_URL, body, {headers:{
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Faces-Request': 'partial/ajax',
        'X-Requested-With': 'XMLHttpRequest',
    }})

    return res.data
}