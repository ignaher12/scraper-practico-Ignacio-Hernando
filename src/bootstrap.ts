import * as cheerio from 'cheerio';
import { cliente } from './http.js'
import { config } from './config.js'

export async function bootstrap(){

    const res = await cliente.get(config.QUESTION_URL);
    const $ = cheerio.load(res.data);
    const viewState = $('input[name="javax.faces.ViewState"]').attr("value");
    
    if (!viewState) {
        throw new Error("No se encontró el ViewState en el HTML inicial");
    }

    return { viewState };
}