<template>
  <div class="configuracion">
    <div class="selector-dia">
      <label for="inicio-semana"> Elige el día de la semana que quieres que empiece: </label>
      <select id="inicio-semana" v-model="listsStore.diaInicio">
        <option v-for="dia in opcionesDias" :key="dia" :value="dia">
          {{ dia }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useListsStore } from '@/stores/lists';
import { DiasSemana } from '@/types';

const listsStore = useListsStore();
const opcionesDias = Object.values(DiasSemana);
</script>

<style scoped>
.configuracion {
  padding: 1rem;
}

.selector-dia {
  margin-top: 1rem;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

label {
  font-weight: bold;
}

select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
  cursor: pointer;
}
</style>
