<template>
  <main class="planificador">
    <ol ref="target" class="dias-semana">
      <li v-for="dia in diasOrdenados" :key="dia" class="dia-caja">
        <h2 class="dia-titulo">{{ dia }}</h2>

        <dl class="comidas">
          <div class="bloque-comida">
            <dt>Comida:</dt>
            <dd class="contenido-comida">{{ obtenerPlato(dia, 'comida') || 'Cargando...' }}</dd>
          </div>

          <div class="bloque-comida">
            <dt>Cena:</dt>
            <dd class="contenido-comida">{{ obtenerPlato(dia, 'cena') || 'Cargando...' }}</dd>
          </div>
        </dl>
      </li>
    </ol>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import menuSemanal from '@/data/comidas.json';
import { DiasSemana } from '@/types';
import type { MomentoComida } from '@/types';
import { useDraggable } from 'vue-draggable-plus';
import { useListsStore } from '@/stores/lists';

const target = ref<HTMLElement | null>(null);
const listsStore = useListsStore();

const diasOrdenados = ref<DiasSemana[]>([...listsStore.diasOrdenados]);

watch(
  () => listsStore.diasOrdenados,
  (nuevoOrden) => {
    diasOrdenados.value = [...nuevoOrden];
  },
  { deep: true },
);

useDraggable(target, diasOrdenados, {
  animation: 150,
  onMove: (evt) => {
    const firstChild = target.value?.firstElementChild;
    const isMovingToFirstPosition = evt.related === firstChild && !evt.willInsertAfter;

    if (!isMovingToFirstPosition) {
      target.value?.classList.add('invalid-drop');
      return false;
    }
    target.value?.classList.remove('invalid-drop');
    return true;
  },
  onEnd: () => {
    target.value?.classList.remove('invalid-drop');
    const diaEnPrimerLugar = diasOrdenados.value[0];
    if (diaEnPrimerLugar) {
      // Usamos la función del store!
      listsStore.setDiaInicio(diaEnPrimerLugar);
    }
  },
});

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
</script>

<style scoped>
.planificador {
  padding: 1rem;
  color: #333;
}

.dias-semana {
  list-style: none; /* Quita los números 1. 2. 3. por defecto */
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column; /* Para escritorio quizás quieras grid, pero esto es móvil-first */
  gap: 1rem;
}

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
  text-transform: capitalize; /* Pone la primera letra en mayúscula */
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

.bloque-comida strong {
  color: #555;
  min-width: 60px;
}

.contenido-comida {
  color: #999;
}

.dias-semana.invalid-drop,
.dias-semana.invalid-drop * {
  cursor: not-allowed !important;
}

.dia-caja:active {
  cursor: grabbing;
}

/* --- Responsive para Escritorio --- */
@media (min-width: 768px) {
  .dias-semana {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
</style>
