<template>
  <div class="dia-caja">
    <h2 class="dia-titulo">{{ dia }}</h2>

    <dl class="comidas">
      <MomentoDia momento="Comida" :platos="platosComida" />
      <MomentoDia momento="Cena" :platos="platosCena" />
    </dl>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MomentoDia from './MomentoDia.vue';
import { useMenuStore } from '@/stores/menuStore';
import { DiasSemana, MomentoComida } from '@/types';

const props = defineProps<{
  dia: DiasSemana;
}>();

const store = useMenuStore();

const platosComida = computed(() => store.obtenerPlatos(props.dia, MomentoComida.comida));
const platosCena = computed(() => store.obtenerPlatos(props.dia, MomentoComida.cena));
</script>

<style scoped>
.dia-caja {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: grab;
  width: 100%;
  box-sizing: border-box;
  display: block;
}

.dia-titulo {
  margin: 0 0 0.75rem 0;
  font-size: 1.2rem;
  color: #333;
  text-transform: capitalize;
  border-bottom: 2px solid #0066ff;
  padding-bottom: 0.5rem;
}

.comidas {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dia-caja:active {
  cursor: grabbing;
}
</style>
