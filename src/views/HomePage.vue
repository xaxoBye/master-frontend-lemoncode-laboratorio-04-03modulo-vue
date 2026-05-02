<template>
  <main class="planificador">
    <ol ref="target" class="dias-semana">
      <li v-for="dia in diasOrdenados" :key="dia" class="dia-caja">
        <CardDia :dia="dia" />
      </li>
    </ol>
    <p>
      Si quieres comenzar la semana por otro día. Selecciona el día y arrastralo en el primer lugar
      de la lista. O ir a
      <RouterLink to="/configuracion" class="enlace-config"> Configuración → </RouterLink>
    </p>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import CardDia from '@/components/CardDia.vue';
import { DiasSemana } from '@/types';
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
</script>

<style scoped>
/* Estilos del contenedor principal */
.planificador {
  padding: 1rem;
  color: #333;
}

.dias-semana {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.dias-semana.invalid-drop,
.dias-semana.invalid-drop * {
  cursor: not-allowed !important;
}

p {
  color: white;
}
.enlace-config {
  color: #0066ff;
  text-decoration: underline;
  font-weight: 600;
  transition: color 0.2s;
}

.enlace-config:hover {
  color: #004499;
  text-decoration: none;
}

/* Cuando el enlace está activo (estás en /configuracion) */
.enlace-config.router-link-active {
  color: #004499;
  font-weight: bold;
}

/* Responsive para Escritorio */
@media (min-width: 768px) {
  .dias-semana {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .dias-semana > lis {
    width: 100%;
  }
}
</style>
