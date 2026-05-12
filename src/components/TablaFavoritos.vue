<template>
  <fieldset class="menu-fieldset">
    <LeyendaMenu />

    <div class="tabla-menu">
      <TablaGuardar />
      <TablaBtnIncluirPlato
        :mostrar-formulario="mostrarFormulario"
        @abrir-formulario="abrirFormulario"
      />
    </div>

    <legend class="menu-legend">🍽️ Semana Actual</legend>

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

    <div class="zona-acciones-globales">
      <button
        class="btn-eliminar-todo"
        @click="mostrarConfirmacionEliminarTodos = true"
        :disabled="store.platos.length === 0"
      >
        🧹 Eliminar todos los platos
      </button>
    </div>

    <table class="tabla-favoritos">
      <thead>
        <!-- Fila 1: Días -->
        <tr class="fila-dias">
          <th class="celda-plato" rowspan="2">Plato</th>
          <th colspan="2" class="celda-dia" data-short="L">Lunes</th>
          <th colspan="2" class="celda-dia" data-short="M">Martes</th>
          <th colspan="2" class="celda-dia" data-short="Mx">Miércoles</th>
          <th colspan="2" class="celda-dia" data-short="J">Jueves</th>
          <th colspan="2" class="celda-dia" data-short="V">Viernes</th>
          <th colspan="2" class="celda-dia" data-short="S">Sábado</th>
          <th colspan="2" class="celda-dia" data-short="D">Domingo</th>
        </tr>

        <!-- Fila 2: Comida/Cena -->
        <tr class="fila-momentos">
          <template v-for="dia in diasSemana" :key="dia">
            <th class="celda-momento; celda-momento-comida" data-short="☀">Comida</th>
            <th class="celda-momento" data-short="🌙">Cena</th>
          </template>
        </tr>
      </thead>

      <tbody>
        <!-- Filas de platos -->
        <tr v-for="plato in store.platosOrdenados" :key="plato.id" class="fila-plato">
          <td class="nombre-plato">
            <div class="contenido-plato">
              {{ plato.nombre }}
              <span v-if="tieneFavoritos(plato)" class="icon-fav">⭐</span>
              <button
                class="btn-eliminar-plato"
                @click.stop="abrirConfirmacionEliminar(plato)"
                title="Eliminar plato"
              >
                🗑️
              </button>
            </div>
          </td>

          <template v-for="dia in diasSemana" :key="`${plato.id}-${dia}`">
            <td
              class="celda-momento-comida"
              :class="getCeldaClass(plato, dia, MomentoComida.comida)"
              @click="handleToggleFavoritos(plato, dia, MomentoComida.comida)"
              @contextmenu.prevent="handleToggleAsignacion(plato, dia, MomentoComida.comida)"
              :title="getTooltip(plato, dia, MomentoComida.comida)"
            >
              <span v-if="tieneAsignacion(plato, dia, MomentoComida.comida)" class="marca">
                {{ esFavorito(plato, dia, MomentoComida.comida) ? '⭐' : '●' }}
              </span>
            </td>

            <td
              :class="getCeldaClass(plato, dia, MomentoComida.cena)"
              @click="handleToggleFavoritos(plato, dia, MomentoComida.cena)"
              @contextmenu.prevent="handleToggleAsignacion(plato, dia, MomentoComida.cena)"
              :title="getTooltip(plato, dia, MomentoComida.cena)"
            >
              <span v-if="tieneAsignacion(plato, dia, MomentoComida.cena)" class="marca">
                {{ esFavorito(plato, dia, MomentoComida.cena) ? '⭐' : '●' }}
              </span>
            </td>
          </template>
        </tr>

        <!-- Estado vacío -->
        <tr v-if="store.platos.length === 0">
          <td colspan="15" class="sin-datos">⚪ No hay platos disponibles</td>
        </tr>
      </tbody>
    </table>
    <ConfirmarEliminarPlato
      :mostrar="mostrarConfirmacionEliminar"
      :plato-nombre="platoAEliminar?.nombre ?? ''"
      @cancelar="cancelarEliminar"
      @confirmar="confirmarEliminar"
    />
    <ConfirmarEliminarPlato
      :mostrar="mostrarConfirmacionEliminarTodos"
      platoNombre="TODOS los platos"
      @cancelar="mostrarConfirmacionEliminarTodos = false"
      @confirmar="eliminarTodos"
    />
  </fieldset>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { DiasSemana } from '@/types';
import type { ComidaAsignada } from '@/types';
import { MomentoComida } from '@/types';
import { useMenuStore } from '@/stores/menuStore';
import TablaGuardar from './TablaGuardar.vue';
import TablaBtnIncluirPlato from './TablaBtnIncluirPlato.vue';
import TablaFormIncluirPlato from './TablaFormIncluirPlato.vue';
import { usePlatoForm } from '@/composables/usePlatoForm';
import LeyendaMenu from './LeyendaMenu.vue';
import ConfirmarEliminarPlato from './ConfirmarEliminarPlato.vue';

const {
  mostrarFormulario,
  formulario,
  errores,
  enviando,
  abrirFormulario,
  cerrarFormulario,
  handleIncluirPlato,
} = usePlatoForm();

onMounted(() => {
  cargarDatosDesdeStorage();
});

function cargarDatosDesdeStorage(): void {
  console.log('🔄 TablaFavoritos: Verificando datos en localStorage...');

  const datosGuardados = localStorage.getItem('menu-semanal-favoritos');

  if (datosGuardados) {
    try {
      const datosParseados: ComidaAsignada[] = JSON.parse(datosGuardados);

      if (Array.isArray(datosParseados) && datosParseados.length > 0) {
        // Cargar en el store (esto actualiza automáticamente la tabla)
        store.cargarPlatos(datosParseados);

        console.log(
          '✅ TablaFavoritos: Datos sincronizados desde storage:',
          datosParseados.length,
          'platos',
        );
      }
    } catch (error) {
      console.error('❌ Error leyendo localStorage en TablaFavoritos:', error);
    }
  } else {
    console.log('ℹ️ TablaFavoritos: No hay datos en localStorage');
  }
}

const store = useMenuStore();

const mostrarConfirmacionEliminar = ref(false);
const platoAEliminar = ref<ComidaAsignada | null>(null);

const mostrarConfirmacionEliminarTodos = ref(false);

const diasSemana: DiasSemana[] = [
  DiasSemana.LUNES,
  DiasSemana.MARTES,
  DiasSemana.MIERCOLES,
  DiasSemana.JUEVES,
  DiasSemana.VIERNES,
  DiasSemana.SABADO,
  DiasSemana.DOMINGO,
];

function handleToggleFavoritos(
  plato: ComidaAsignada,
  dia: DiasSemana,
  momento: MomentoComida,
): void {
  store.toggleFavorito(plato, dia, momento);
}

function handleToggleAsignacion(
  plato: ComidaAsignada,
  dia: DiasSemana,
  momento: MomentoComida,
): void {
  store.toggleAsignacion(plato, dia, momento);
}

function buscarAsignacion(plato: ComidaAsignada, dia: DiasSemana, momento: MomentoComida) {
  return store.buscarAsignacion(plato, dia, momento);
}

function tieneAsignacion(plato: ComidaAsignada, dia: DiasSemana, momento: MomentoComida): boolean {
  return !!buscarAsignacion(plato, dia, momento);
}

function esFavorito(plato: ComidaAsignada, dia: DiasSemana, momento: MomentoComida): boolean {
  const asignacion = buscarAsignacion(plato, dia, momento);
  return asignacion?.favorito === true;
}

function tieneFavoritos(plato: ComidaAsignada): boolean {
  return plato.asignaciones.some((a) => a.favorito === true);
}

function getCeldaClass(plato: ComidaAsignada, dia: DiasSemana, momento: MomentoComida): string[] {
  const classes: string[] = ['celda-dato'];

  if (tieneAsignacion(plato, dia, momento)) {
    classes.push('tiene-asignacion');

    if (esFavorito(plato, dia, momento)) {
      classes.push('es-favorito');
    }
  }

  return classes;
}

function getTooltip(plato: ComidaAsignada, dia: DiasSemana, momento: MomentoComida): string {
  const tiene = tieneAsignacion(plato, dia, momento);
  const fav = esFavorito(plato, dia, momento);

  if (!tiene) {
    return `🖱️ Click der.: Añadir "${plato.nombre}" a ${dia} (${momento})`;
  } else if (fav) {
    return `⭐ Favorito | Click izq.: Quitar favorito | Click der.: Borrar asignación`;
  } else {
    return `● Asignado | Click izq.: Marcar favorito | Click der.: Borrar asignación`;
  }
}

function abrirConfirmacionEliminar(plato: ComidaAsignada): void {
  platoAEliminar.value = plato;
  mostrarConfirmacionEliminar.value = true;
}

function cancelarEliminar(): void {
  mostrarConfirmacionEliminar.value = false;
  platoAEliminar.value = null;
}

function confirmarEliminar(): void {
  if (!platoAEliminar.value) return;

  store.eliminarPlato(platoAEliminar.value.id);

  cancelarEliminar();
  store.mostrarToastInfo('🗑️ Plato eliminado');
}

function eliminarTodos(): void {
  store.limpiarTodo(); // ya la tienes en el store
  mostrarConfirmacionEliminarTodos.value = false;

  store.mostrarToastInfo('🧹 Todos los platos eliminados');
}
</script>

<style scoped>
.tabla-menu {
  background-color: #0066ff;
  padding: 15px;
  border: 1px solid white;
}

.tabla-favoritos {
  border-collapse: collapse;
  width: fit-content;
  min-width: 100%;
  table-layout: auto;
  font-family: 'Segoe UI, Arial, sans-serif';
  background-color: #ffffff;
}

.celda-dia {
  font-weight: bold;
  font-size: 14px;
  border-bottom: 3px solid #2c3e50;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding: 14px 8px;
  text-align: center;
  color: white;
  background-color: #0066ff;
  letter-spacing: 0.5px;
}

.fila-momentos {
  border-bottom: 2px solid #3498db;
}

.fila-momentos th {
  font-weight: bold;
  height: 15px;
  line-height: 15px;
  padding: 0 4px;
  font-size: 11px;
  text-align: center;
  color: #2c3e50;
  background-color: #ecf0f1;
  border-right: 1px solid #bdc3c7;
  border-bottom: 1px solid #95a5a6;
}

.celda-momento {
  width: 50px;
  min-width: 45px;
  max-width: 60px;
}

.celda-momento-comida {
  border-left: 2px solid #2c3e50;
}

.celda-dia::before,
.celda-momento::before,
.celda-momento-comida::before {
  display: none;
}

.celda-plato {
  text-align: left !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
  white-space: nowrap;
  width: 180px;
  min-width: 150px;
  max-width: 250px;
  background-color: #2c3e50;
}

.fila-plato {
  transition: background-color 0.2s ease;
}

.fila-plato:hover {
  background-color: #f8f9fa;
}

.nombre-plato {
  font-weight: 600;
  background-color: #2c3e50;
  padding: 10px 16px !important;
  border-bottom: 1px solid #ecf0f1;
  border-right: 2px solid #ecf0f1;
  white-space: nowrap;
  width: 180px !important;
  min-width: 150px !important;
}

.icon-fav {
  margin-left: 6px;
  font-size: 12px;
}

.celda-dato {
  width: 50px;
  min-width: 45px;
  height: 38px;
  text-align: center;
  border-bottom: 1px solid #ecf0f1;
  border-right: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  vertical-align: middle;
}

.celda-dato:hover {
  background-color: #d4edda;
  transform: scale(1.05);
}

.tiene-asignacion {
  background-color: #e3f2fd;
}

.es-favorito {
  background: linear-gradient(135deg, #fff9c4 0%, #ffeb3b 100%);
  box-shadow: inset 0 0 10px rgba(255, 193, 7, 0.4);
}

.marca {
  display: inline-block;
  font-size: 16px;
}

.sin-datos {
  text-align: center;
  padding: 30px;
  color: #95a5a6;
  font-style: italic;
}

.btn-añadir-plato {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 12px 24px;
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;

  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  color: #0066ff;
  border: 2px solid #0066ff;
  border-radius: 8px;

  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 102, 255, 0.2);
}

.btn-añadir-plato:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 102, 255, 0.3);
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.btn-añadir-plato:active {
  transform: translateY(0);
}

.btn-icono {
  font-size: 18px;
  line-height: 1;
}

.btn-texto {
  white-space: nowrap;
}

.contenido-plato {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.texto-plato {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-eliminar-plato {
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.6;
  transition: 0.2s;
}

.btn-eliminar-plato:hover {
  opacity: 1;
  transform: scale(1.1);
}

.zona-acciones-globales {
  display: flex;
  justify-content: flex-end;
  margin: 12px 0;
}

.btn-eliminar-todo {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s ease;
}

.btn-eliminar-todo:hover {
  transform: translateY(-1px);
}

.btn-eliminar-todo:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 767px) {
  .tabla-favoritos {
    table-layout: fixed !important;
    min-width: max(100%, 500px);
  }

  .celda-dia {
    font-size: 0 !important;
    color: transparent !important;
    width: 56px !important;
    min-width: 56px !important;
    max-width: 56px !important;
    padding: 4px 2px !important;
    height: 28px !important;
    line-height: normal !important;
  }

  .celda-dia::before {
    content: attr(data-short) !important;
    display: block !important;
    font-size: 18px !important;
    font-weight: bold !important;
    color: white !important;
    letter-spacing: 2px !important;
    text-align: center !important;
    line-height: 1.2 !important;
  }

  .celda-momento,
  .celda-momento-comida {
    font-size: 0 !important;
    color: transparent !important;
    width: 28px !important;
    min-width: 28px !important;
    max-width: 28px !important;
    padding: 2px 1px !important;
    height: 28px !important;
    line-height: normal !important;
  }

  .celda-momento::before,
  .celda-momento-comida::before {
    content: attr(data-short) !important;
    display: block !important;
    font-size: 18px !important;
    color: #2c3e50 !important;
    text-align: center !important;
    line-height: 1.2 !important;
  }

  .celda-dato {
    width: 28px !important;
    min-width: 28px !important;
    max-width: 28px !important;
    height: 28px !important;
    padding: 2px 1px !important;
    border-bottom: 1px solid #ecf0f1 !important;
    border-right: 1px solid #f0f0f0 !important;
  }

  .marca {
    font-size: 16px !important;
    display: inline-block !important;
    line-height: 1 !important;
  }

  .icon-fav {
    font-size: 14px !important;
    margin-left: 4px !important;
  }

  .nombre-plato {
    position: sticky;
    left: 0;
    z-index: 10;
    padding: 8px 6px !important;
    font-size: 13px !important;
  }

  .fila-plato {
    height: auto !important;
  }

  .celda-plato {
    position: sticky;
    left: 0;
    z-index: 11;
    background-color: #2c3e50;
  }

  .tabla-menu {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-añadir-plato {
    width: 100%;
    justify-content: center;
  }

  .contenedor-formulario {
    padding: 16px;
  }

  .form-titulo {
    font-size: 1.25rem;
  }

  .radio-opciones {
    flex-direction: column;
    gap: 10px;
  }

  .botones-accion {
    flex-direction: column-reverse;
  }

  .btn-guardar-form,
  .btn-cancelar-form {
    width: 100%;
  }
}
</style>
