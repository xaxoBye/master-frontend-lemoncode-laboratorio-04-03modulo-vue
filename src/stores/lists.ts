// src/stores/lists.ts
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { ComidaAsignada, MomentoComida } from '@/types';
import { DiasSemana } from '@/types';

export const useListsStore = defineStore('lists', () => {
  const lists = ref<ComidaAsignada[]>([]);
  const diaInicio = ref<DiasSemana>(DiasSemana.LUNES);

  const setDiaInicio = (nuevoDia: DiasSemana) => {
    diaInicio.value = nuevoDia;
  };

  const diasOrdenados = computed(() => {
    const ordenMaestro = Object.values(DiasSemana);
    const indiceInicio = ordenMaestro.indexOf(diaInicio.value);

    return [...ordenMaestro.slice(indiceInicio), ...ordenMaestro.slice(0, indiceInicio)];
  });

  const createList = async (nombre: string, dia: DiasSemana, momentoDia: MomentoComida) => {
    const newList: ComidaAsignada = {
      id: crypto.randomUUID(),
      nombre,
      asignaciones: [{ dia, momento: momentoDia, favorito: false }],
    };
    lists.value.push(newList);
    return newList;
  };

  return { lists, diaInicio, setDiaInicio, diasOrdenados, createList };
});
