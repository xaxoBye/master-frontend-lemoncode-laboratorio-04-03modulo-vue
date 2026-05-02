<template>
  <div class="dia-caja">
    <h2 class="dia-titulo">{{ dia }}</h2>

    <dl class="comidas">
      <div class="bloque-comida">
        <dt>Comida:</dt>
        <dd class="contenido-comida">{{ platoComida || 'Sin asignar' }}</dd>
      </div>

      <div class="bloque-comida">
        <dt>Cena:</dt>
        <dd class="contenido-comida">{{ platoCena || 'Sin asignar' }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import menuSemanal from '@/data/comidas.json';
import type { DiasSemana, MomentoComida } from '@/types';

const props = defineProps<{
  dia: DiasSemana;
}>();

const obtenerPlato = (diaActual: DiasSemana, momentoActual: MomentoComida): string => {
  const platoEncontrado = menuSemanal.find((plato) =>
    plato.asignaciones.some(
      (asignacion) => asignacion.dia === diaActual && asignacion.momento === momentoActual,
    ),
  );

  if (platoEncontrado) {
    const asignacionEspecifica = platoEncontrado.asignaciones.find(
      (asignacion) => asignacion.dia === diaActual && asignacion.momento === momentoActual,
    );

    if (asignacionEspecifica?.favorito) {
      return `${platoEncontrado.nombre} ⭐`;
    }

    return platoEncontrado.nombre;
  }

  return 'Sin asignar';
};

const platoComida = computed(() => obtenerPlato(props.dia, 'comida'));
const platoCena = computed(() => obtenerPlato(props.dia, 'cena'));
</script>

<style scoped>
.dia-caja {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: grab;
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

.bloque-comida {
  display: flex;
  gap: 0.5rem;
}

.contenido-comida {
  color: #555;
  font-weight: 500;
}

.dia-caja:active {
  cursor: grabbing;
}
</style>
