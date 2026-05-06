export enum DiasSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIÉRCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SÁBADO',
  DOMINGO = 'DOMINGO',
}

export enum MomentoComida {
  comida = 'comida',
  cena = 'cena',
}

export interface Asignacion {
  dia: DiasSemana;
  momento: MomentoComida;
  favorito: boolean;
}

export interface ComidaAsignada {
  id: string;
  nombre: string;
  asignaciones: Asignacion[];
}

export interface ConfiguracionTitulo {
  titulo: string;
  mostrarSubtitulo: boolean;
  nombreBoton: string;
}
