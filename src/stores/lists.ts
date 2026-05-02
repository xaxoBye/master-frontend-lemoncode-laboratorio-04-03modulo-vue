// src/stores/lists.ts
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { ComidaAsignada, MomentoComida } from '@/types';
import { DiasSemana } from '@/types';

export const useListsStore = defineStore('lists', () => {
  const lists = ref<ComidaAsignada[]>([]);

  // NUEVO: Estado global para el día de inicio (por defecto Lunes)
  const diaInicio = ref<DiasSemana>(DiasSemana.LUNES);

  // NUEVO: Función para cambiar el día de inicio
  const setDiaInicio = (nuevoDia: DiasSemana) => {
    diaInicio.value = nuevoDia;
  };

  // NUEVO: Getter que calcula el array de días ordenados según el día de inicio
  const diasOrdenados = computed(() => {
    const ordenMaestro = Object.values(DiasSemana);
    const indiceInicio = ordenMaestro.indexOf(diaInicio.value);

    return [...ordenMaestro.slice(indiceInicio), ...ordenMaestro.slice(0, indiceInicio)];
  });

  const createList = async (nombre: string, dia: DiasSemana, momentoDia: MomentoComida) => {
    const newList: ComidaAsignada = {
      id: crypto.randomUUID(),
      nombre,
      asignaciones: [{ dia: dia, momento: momentoDia }],
    };
    lists.value.push(newList);
    return newList;
  };

  // IMPORTANTE: Acuérdate de retornar las nuevas propiedades
  return { lists, diaInicio, setDiaInicio, diasOrdenados, createList };
});
