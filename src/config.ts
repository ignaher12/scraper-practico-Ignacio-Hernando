//En este archivo se definen las constantes de configuración para el scrapper.

export const config = {
    BASE_URL: "https://publico.oefa.gob.pe/repdig",
    QUESTION_URL:"https://publico.oefa.gob.pe/repdig/consulta/consultaTfa.xhtml",
    FORM_ID: "listarDetalleInfraccionRAAForm",
    DT_ID: "listarDetalleInfraccionRAAForm:dt",
    PAGE_SIZE: 10,
    MAX_RETRIES: 5,
    BASE_BACKOFF_MS: 1000,
    DELAY_BETWEEN_REQUESTS_MS: 800,
    OUTPUT_DIR: "output",
    OUTPUT_PDF_DIR: "output/pdf",
    DATA_FILE: "output/data.json",
    FAILED_FILE: "output/failed.json",
    MAX_REG: 20
} as const;

