export enum DiasSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIÉRCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SÁBADO',
  DOMINGO = 'DOMINGO',
}

export type MomentoComida = 'comida' | 'cena';

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
