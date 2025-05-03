
export interface Smae {
    id:                   string;
    categoria:            Categoria;
    alimento:             string;
    cantidad:             string;
    unidad:               string;
    peso_bruto:           string;
    peso_neto:            string;
    kcal:                 string;
    proteina:             string;
    lipidos:              string;
    carbohidratos:        string;
    grasa_saturada:       string;
    grasa_monoinsaturada: string;
    grasa_poliinsaturada: string;
    colesterol:           string;
    azucar:               string;
    fibra:                string;
    vitamina_a:           string;
    vitamina_c:           string;
    acido_folico:         string;
    calcio:               string;
    hierro:               string;
    potasio:              string;
    sodio:                string;
    fosforo:              string;
    selenio:              string;
    etanol:               string;
    IG:                   string;
    IC:                   string;
}

export enum Categoria {
    AOAAltoEnGrasa = "A.O.A Alto en grasa",
    AOABajoEnGrasa = "A.O.A Bajo en grasa",
    AOAModeradoEnGrasa = "A.O.A Moderado en grasa",
    AOAMuyBajoEnGrasa = "A.O.A Muy bajo en grasa",
    AlimentosLibresEnEnergia = "Alimentos libres en energia",
    AzucaresConGrasa = "Azucares con grasa",
    AzucaresSinGrasa = "Azucares sin grasa",
    BebidasAlcoholicas = "Bebidas alcoholicas",
    CerealesConGrasa = "Cereales con grasa",
    CerealesSinGrasa = "Cereales Sin Grasa",
    Frutas = "Frutas",
    GrasasConProteina = "Grasas con proteina",
    GrasasSinProteina = "Grasas sin proteina",
    LecheConAzucar = "Leche con azucar",
    LecheDescremada = "Leche descremada",
    LecheEntera = "Leche entera",
    LecheSemi = "Leche semi",
    Leguminosas = "Leguminosas",
    Verduras = "Verduras",
}
