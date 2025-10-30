import {Paciente, DetallesPaciente} from "@/types/interfaces";
export const PACIENTES: Paciente[] = [
  {
    rut: "12.345.678-9",
    ApellidoPaterno: "Olivares",
    ApellidoMaterno: "Bustos",
    nombres: "Juan Alberto",
  },
  {
    rut: "13.345.678-4",
    ApellidoPaterno: "Carrasco",
    ApellidoMaterno: "Fuentes",
    nombres: "María Angélica",
  },
  {
    rut: "14.345.678-5",
    ApellidoPaterno: "bustos",
    ApellidoMaterno: "Rojas",
    nombres: "Paola Andrea",
  },
  {
    rut: "17.345.678-6",
    ApellidoPaterno: "López",
    ApellidoMaterno: "Muñoz",
    nombres: "Lorenzo Adrián",
  },
  {
    rut: "4.345.678-9",
    ApellidoPaterno: "Bustos",
    ApellidoMaterno: "Vega",
    nombres: "Camila Sofía",
  },
  {
    rut: "5.345.678-9",
    ApellidoPaterno: "Cereceda",
    ApellidoMaterno: "Araya",
    nombres: "Diego Ignacio",
  },
  {
    rut: "6.345.678-9",
    ApellidoPaterno: "Carvajal",
    ApellidoMaterno: "Pizarro",
    nombres: "Valentina Paz",
  },
];
export const DETALLES_PACIENTES: DetallesPaciente[] = [
  {
    rut: "12.345.678-9",
    nombres: "Juan Alberto",
    ApellidoPaterno: "Olivares",
    ApellidoMaterno: "Bustos",
    fechaNacimiento: "1975-03-12",
    tipoSangre: "O+",
    altura: 175,
    peso: 78,
    examenes: [
      {
        id: 1,
        nombre: "Hemograma",
        fecha: "2024-05-10",
        tipo: ".pdf",
        url: "/examenes/hemograma-juan.pdf"
      },
      {
        id: 2,
        nombre: "Radiografía de cadera",
        fecha: "2024-05-12",
        tipo: ".jpg",
        url: "/examenes/radiografia-juan.jpg"
      }
    ],
    num_indicador: 3,
    riesgo: "medio",
    comentario: "Paciente estable, requiere seguimiento."
  },
  {
    rut: "13.345.678-4",
    nombres: "María Angélica",
    ApellidoPaterno: "Carrasco",
    ApellidoMaterno: "Fuentes",
    fechaNacimiento: "1948-11-23",
    tipoSangre: "A-",
    altura: 162,
    peso: 65,
    examenes: [
      {
        id: 3,
        nombre: "Perfil lipídico",
        fecha: "2024-04-22",
        tipo: ".csv",
        url: "/examenes/lipidico-maria.csv"
      }
    ],
    num_indicador: 5,
    riesgo: "alto",
    comentario: "Alto riesgo, monitoreo frecuente."
  },
  {
    rut: "14.345.678-5",
    nombres: "Paola Andrea",
    ApellidoPaterno: "bustos",
    ApellidoMaterno: "Rojas",
    fechaNacimiento: "1982-07-15",
    tipoSangre: "B+",
    altura: 168,
    peso: 70,
    examenes: [
      {
        id: 4,
        nombre: "Electrocardiograma",
        fecha: "2024-06-01",
        tipo: ".pdf",
        url: "/examenes/ecg-paola.pdf"
      }
    ],
    num_indicador: 2,
    riesgo: "bajo",
    comentario: "Sin complicaciones actuales."
  },
  {
    rut: "17.345.678-6",
    nombres: "Lorenzo Adrián",
    ApellidoPaterno: "López",
    ApellidoMaterno: "Muñoz",
    fechaNacimiento: "1955-09-30",
    tipoSangre: "AB+",
    altura: 180,
    peso: 85,
    examenes: [
      {
        id: 5,
        nombre: "TAC de cadera",
        fecha: "2024-05-20",
        tipo: ".pdf",
        url: "/examenes/tac-lorenzo.pdf"
      }
    ],
    num_indicador: 4,
    riesgo: "medio",
    comentario: "Recuperación progresiva."
  },
  {
    rut: "4.345.678-9",
    nombres: "Camila Sofía",
    ApellidoPaterno: "Bustos",
    ApellidoMaterno: "Vega",
    fechaNacimiento: "1990-02-18",
    tipoSangre: "O-",
    altura: 158,
    peso: 54,
    examenes: [
      {
        id: 6,
        nombre: "Resonancia magnética",
        fecha: "2024-06-05",
        tipo: ".pdf",
        url: "/examenes/rm-camila.pdf"
      }
    ],
    num_indicador: 1,
    riesgo: "bajo",
    comentario: "Sin hallazgos relevantes."
  },
  {
    rut: "5.345.678-9",
    nombres: "Diego Ignacio",
    ApellidoPaterno: "Cereceda",
    ApellidoMaterno: "Araya",
    fechaNacimiento: "1987-12-05",
    tipoSangre: "A+",
    altura: 172,
    peso: 74,
    examenes: [
      {
        id: 7,
        nombre: "Hemoglobina",
        fecha: "2024-05-15",
        tipo: ".txt",
        url: "/examenes/hb-diego.txt"
      }
    ],
    num_indicador: 2,
    riesgo: "bajo",
    comentario: "Paciente joven, evolución favorable."
  },
  {
    rut: "6.345.678-9",
    nombres: "Valentina Paz",
    ApellidoPaterno: "Carvajal",
    ApellidoMaterno: "Pizarro",
    fechaNacimiento: "1979-08-27",
    tipoSangre: "B-",
    altura: 165,
    peso: 68,
    examenes: [
      {
        id: 8,
        nombre: "Radiografía de cadera",
        fecha: "2024-05-18",
        tipo: ".pdf",
        url: "/examenes/radiografia-valentina.pdf"
      }
    ],
    num_indicador: 3,
    riesgo: "medio",
    comentario: "Requiere fisioterapia."
  }
];

