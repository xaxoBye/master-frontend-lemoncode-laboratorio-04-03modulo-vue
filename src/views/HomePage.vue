<template>
  <main class="planificador">
    <div class="contenedor-formulario">
      <TablaBtnIncluirPlato
        :mostrar-formulario="mostrarFormulario"
        @abrir-formulario="abrirFormulario"
      />

      <TablaFormIncluirPlato
        :mostrar-formulario="mostrarFormulario"
        :formulario="formulario"
        :errores="errores"
        :enviando="enviando"
        :dias-semana="diasSemana"
        :platos-ordenados="store.platosOrdenados"
        @submit="handleIncluirPlato"
        @cancelar="cerrarFormulario"
        @update:nombre="formulario.nombre = $event"
        @update:dia="formulario.dia = $event"
        @update:momento="formulario.momento = $event"
      />
    </div>

    <ol ref="target" class="dias-semana">
      <li v-for="dia in diasOrdenados" :key="dia" class="dia-caja">
        <CardDia :dia="dia" />
      </li>
    </ol>
    <p class="texto-info">
      Si quieres comenzar la semana por otro día. Selecciona el día y arrastralo en el primer lugar
      de la lista. O ir a
      <RouterLink to="/configuracion" class="enlace-config"> Configuración → </RouterLink>
    </p>
  </main>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import CardDia from '@/components/CardDia.vue';
import TablaBtnIncluirPlato from '@/components/TablaBtnIncluirPlato.vue';
import TablaFormIncluirPlato from '@/components/TablaFormIncluirPlato.vue';
import { usePlatoForm } from '@/composables/usePlatoForm';
import { DiasSemana } from '@/types';
import type { ComidaAsignada } from '@/types';
import { useDraggable } from 'vue-draggable-plus';
import { useListsStore } from '@/stores/lists';
import menuSemanal from '@/data/comidas.json';
import { useMenuStore } from '@/stores/menuStore';

const target = ref<HTMLElement | null>(null);
const listsStore = useListsStore();
const store = useMenuStore();

onMounted(() => {
  inicializarDatosMenu();
});

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

function inicializarDatosMenu(): void {
  console.log('🚀 Inicializando datos del menú...');

  const datosGuardados = localStorage.getItem('menu-semanal-favoritos');

  if (datosGuardados) {
    try {
      const datosParseados: ComidaAsignada[] = JSON.parse(datosGuardados);

      if (Array.isArray(datosParseados)) {
        store.cargarPlatos(datosParseados);
        return;
      }
    } catch (error) {
      console.error('❌ Error leyendo localStorage:', error);
    }
  }

  store.cargarPlatos(menuSemanal as ComidaAsignada[]);
  store.guardarEstadoSilenciosamente();
}

const {
  mostrarFormulario,
  formulario,
  errores,
  enviando,
  abrirFormulario,
  cerrarFormulario,
  handleIncluirPlato,
} = usePlatoForm();

const diasSemana: DiasSemana[] = [
  DiasSemana.LUNES,
  DiasSemana.MARTES,
  DiasSemana.MIERCOLES,
  DiasSemana.JUEVES,
  DiasSemana.VIERNES,
  DiasSemana.SABADO,
  DiasSemana.DOMINGO,
];
</script>

<style scoped>
.planificador {
  padding: 1rem;
  color: #333;
}

.contenedor-formulario {
  margin-bottom: 1.5rem;
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

.dia-caja {
  width: 100%;
}

.texto-info {
  color: white;
  margin-top: 1rem;
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
