import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { config } from './config.js'

// guarda las cookies automaticamente (jsessionid)
export const jar = new CookieJar()

// instanciamos axios con el jar dentro, wrapper le sirve la interfaz para utilizar el jar.
export const cliente = wrapper(axios.create({
    jar,
    withCredentials: true,
    headers:{ 
        "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
        "Accept":'application/xml, text/xml, */*; q=0.01',
        "Accept-Language": 'es-ES,es;q=0.9,en;q=0.8,pt;q=0.7,fr;q=0.6,it;q=0.5',
        "Referer": config.QUESTION_URL
    }
}))

 