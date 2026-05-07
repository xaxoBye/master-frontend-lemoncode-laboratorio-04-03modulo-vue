<template>
  <fieldset class="menu-fieldset">
    <div class="tabla-menu">
      <TablaGuardar />
      <button
        v-if="!mostrarFormulario"
        @click="abrirFormulario"
        class="btn-añadir-plato"
        title="Añadir un nuevo plato al menú"
      >
        <span class="btn-icono">➕</span>
        <span class="btn-texto">Añadir Nuevo Plato</span>
      </button>
    </div>

    <legend class="menu-legend">🍽️ Semana Actual</legend>
    <transition name="slide-form">
      <div v-if="mostrarFormulario" class="contenedor-formulario">
        <h3 class="form-titulo">
          <span class="icono-titulo">🍽️</span>
          Nuevo Plato
        </h3>

        <form @submit.prevent="handleIncluirPlato" class="formulario-nuevo-plato">
          <!-- Campo: Nombre del Plato -->
          <div class="campo-formulario">
            <label for="input-nombre" class="label-campo">
              <span class="label-icono">📛</span>
              Nombre del Plato *
            </label>
            <input
              id="input-nombre"
              ref="inputNombreRef"
              v-model="formulario.nombre"
              type="text"
              placeholder="Ej: Pasta Carbonara, Ensalada César..."
              class="input-texto"
              :class="{ 'input-error': errores.nombre }"
              maxlength="50"
              required
              autocomplete="off"
              list="nombrePlatos"
            />
            <datalist id="nombrePlatos">
              <option
                v-for="plato in store.platosOrdenados"
                :key="plato.id"
                :value="plato.nombre"
              ></option>
            </datalist>
            <span v-if="errores.nombre" class="mensaje-error">
              {{ errores.nombre }}
            </span>
          </div>

          <!-- Campo: Día de la Semana -->
          <div class="campo-formulario">
            <label for="select-dia" class="label-campo">
              <span class="label-icono">📅</span>
              Día de la Semana *
            </label>
            <select
              id="select-dia"
              v-model="formulario.dia"
              class="input-select"
              :class="{ 'input-error': errores.dia }"
              required
            >
              <option value="" disabled>Selecciona un día...</option>
              <option v-for="dia in diasSemana" :key="dia" :value="dia">
                {{ formatearDia(dia) }}
              </option>
            </select>
            <span v-if="errores.dia" class="mensaje-error">
              {{ errores.dia }}
            </span>
          </div>

          <!-- Campo: Momento (Comida/Cena) -->
          <div class="campo-formulario campo-radio-group">
            <label class="label-campo">
              <span class="label-icono">⏰</span>
              Momento *
            </label>

            <div class="radio-opciones">
              <label class="opcion-radio">
                <input type="radio" value="comida" v-model="formulario.momento" name="momento" />
                <span class="radio-etiqueta">
                  <span class="radio-icono">☀️</span>
                  Comida
                </span>
              </label>

              <label class="opcion-radio">
                <input type="radio" value="cena" v-model="formulario.momento" name="momento" />
                <span class="radio-etiqueta">
                  <span class="radio-icono">🌙</span>
                  Cena
                </span>
              </label>
            </div>

            <span v-if="errores.momento" class="mensaje-error">
              {{ errores.momento }}
            </span>
          </div>

          <!-- Botones de Acción -->
          <div class="botones-accion">
            <button type="submit" class="btn-guardar-form" :disabled="enviando">
              <span v-if="!enviando">✅ Guardar Plato</span>
              <span v-else class="spinner-small"></span>
            </button>

            <button
              type="button"
              @click="cerrarFormulario"
              class="btn-cancelar-form"
              :disabled="enviando"
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </transition>

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
            {{ plato.nombre }}
            <span v-if="tieneFavoritos(plato)" class="icon-fav">⭐</span>
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
  </fieldset>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue';
import { DiasSemana } from '@/types';
import type { ComidaAsignada } from '@/types';
import { MomentoComida } from '@/types';
import TablaGuardar from './TablaGuardar.vue';
import { useMenuStore } from '@/stores/menuStore';

const store = useMenuStore();

const diasSemana: DiasSemana[] = [
  DiasSemana.LUNES,
  DiasSemana.MARTES,
  DiasSemana.MIERCOLES,
  DiasSemana.JUEVES,
  DiasSemana.VIERNES,
  DiasSemana.SABADO,
  DiasSemana.DOMINGO,
];

/** Controla si el formulario es visible */
const mostrarFormulario = ref(false);

/** Referencia al input para auto-focus */
const inputNombreRef = ref<HTMLInputElement | null>(null);

/** Estado de envío (para spinner) */
const enviando = ref(false);

/** Datos del formulario */
const formulario = reactive({
  nombre: '',
  dia: '' as DiasSemana | '',
  momento: '' as MomentoComida | '',
});

/** Errores de validación */
const errores = reactive({
  nombre: '',
  dia: '',
  momento: '',
});

// ============================================
// 🔧 FUNCIONES DEL FORMULARIO
// ============================================

/** Abrir formulario y focus en input */
async function abrirFormulario(): Promise<void> {
  mostrarFormulario.value = true;
  resetearFormulario();

  // Esperar a que el DOM se actualice y hacer focus
  await nextTick();
  inputNombreRef.value?.focus();
}

/** Cerrar formulario */
function cerrarFormulario(): void {
  mostrarFormulario.value = false;
  resetearFormulario();
}

function platoYaExiste(nombre: string): boolean {
  const nombreNormalizado = nombre.toLocaleLowerCase().trim();

  return store.platos.some(
    (plato) => plato.nombre.toLocaleLowerCase().trim() === nombreNormalizado,
  );
}

/** Resetear formulario a valores iniciales */
function resetearFormulario(): void {
  formulario.nombre = '';
  formulario.dia = '' as DiasSemana | '';
  formulario.momento = '' as MomentoComida | '';
  errores.nombre = '';
  errores.dia = '';
  errores.momento = '';
  enviando.value = false;
}

/** Formatear nombre del día para mostrar */
function formatearDia(dia: DiasSemana): string {
  return dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
}

/** Validar formulario antes de enviar */
function validarFormulario(): boolean {
  let valido = true;

  // Resetear errores
  errores.nombre = '';
  errores.dia = '';
  errores.momento = '';

  // Validar nombre
  if (!formulario.nombre || formulario.nombre.trim() === '') {
    errores.nombre = 'El nombre del plato es obligatorio';
    valido = false;
  } else if (formulario.nombre.trim().length < 2) {
    errores.nombre = 'El nombre debe tener al menos 2 caracteres';
    valido = false;
  }

  // Validar día
  if (!formulario.dia) {
    errores.dia = 'Debes seleccionar un día';
    valido = false;
  }

  // Validar momento
  if (!formulario.momento) {
    errores.momento = 'Debes seleccionar comida o cena';
    valido = false;
  } else if (platoYaExiste(formulario.nombre.trim())) {
    errores.nombre = '⚠️ Este plato ya existe en tu menú';
    valido = false;
  }

  return valido;
}

/** Manejar envío del formulario */
async function handleIncluirPlato(): Promise<void> {
  // Validar
  if (!validarFormulario()) {
    console.log('❌ Validación fallida');
    return;
  }

  try {
    enviando.value = true;

    // Simular pequeña demora para efecto visual (opcional)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Llamar al store para crear el plato
    const nuevoPlato = store.incluirNuevoPlato(
      formulario.nombre,
      formulario.dia as DiasSemana,
      formulario.momento as MomentoComida,
    );

    console.log('✅ Plato creado exitosamente:', nuevoPlato);

    // Cerrar formulario
    cerrarFormulario();

    // Mostrar éxito (opcional: podrías usar el toast del store)
    store.mostrarToast(`✅ "${formulario.nombre}" añadido correctamente`, 'exito');
  } catch (error) {
    console.error('❌ Error al añadir plato:', error);
    store.mostrarToast('Error al añadir el plato', 'error');
  } finally {
    enviando.value = false;
  }
}

// ============================================

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

/** Buscar asignación (delega al store) */
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
</script>

<style scoped>
/* ============================================
   ESTILOS - TABLA ADAPTATIVA
   ============================================ */
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

/* ============================================
   💻 DESKTOP (por defecto, ≥ 768px)
   ============================================ */

/* ----- CABECERA: DÍAS ----- */
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

/* ----- CABECERA: COMIDA/CENA ----- */
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

/* Ocultar pseudo-elementos en desktop */
.celda-dia::before,
.celda-momento::before,
.celda-momento-comida::before {
  display: none;
}

/* ----- PRIMERA COLUMNA (PLATO) ----- */
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

/* ----- CUERPO: FILAS ----- */
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

/* ----- CELDAS DE DATOS ----- */
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

/* ============================================
   ✨ NUEVO: CONTENEDOR DEL FORMULARIO
   ============================================ */

.contenedor-formulario {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid #0066ff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(0, 102, 255, 0.15);
}

.form-titulo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0066ff;
  text-align: center;
}

.icono-titulo {
  font-size: 1.75rem;
}

/* ============================================
   ✨ NUEVO: FORMULARIO
   ============================================ */

.formulario-nuevo-plato {
  display: grid;
  gap: 20px;
}

.campo-formulario {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-campo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #334155;
}

.label-icono {
  font-size: 1.1rem;
}

.input-texto,
.input-select {
  padding: 12px 16px;
  font-size: 1rem;
  font-family: inherit;

  border: 2px solid #cbd5e1;
  border-radius: 8px;
  background-color: white;
  color: #1e293b;

  transition: all 0.25s ease;
  outline: none;
}

.input-texto:focus,
.input-select:focus {
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.15);
}

.input-texto::placeholder {
  color: #94a3b8;
}

.input-error {
  border-color: #ef4444 !important;
  background-color: #fef2f2;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
}

.mensaje-error {
  font-size: 0.85rem;
  color: #dc2626;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Radio Buttons personalizados */
.campo-radio-group {
  margin-top: 4px;
}

.radio-opciones {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.opcion-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.25s ease;
  flex: 1;
  min-width: 140px;
}

.opcion-radio:hover {
  border-color: #0066ff;
  background-color: #f0f9ff;
}

.opcion-radio input[type='radio'] {
  width: 18px;
  height: 18px;
  accent-color: #0066ff;
  cursor: pointer;
}

.radio-etiqueta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #334155;
  user-select: none;
}

.radio-icono {
  font-size: 1.2rem;
}

/* Botones de acción */
.botones-accion {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  justify-content: flex-end;
}

.btn-guardar-form {
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 700;

  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;

  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 160px;
}

.btn-guardar-form:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-guardar-form:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-cancelar-form {
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 600;

  background: white;
  color: #64748b;
  border: 2px solid #cbd5e1;
  border-radius: 8px;

  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancelar-form:hover:not(:disabled) {
  border-color: #94a3b8;
  color: #475569;
  background-color: #f8fafc;
}

.btn-cancelar-form:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Spinner pequeño para botón */
.spinner-small {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================
   ✨ ANIMACIÓN DEL FORMULARIO (Transición)
   ============================================ */

.slide-form-enter-active,
.slide-form-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-form-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-20px);
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.slide-form-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-20px);
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.slide-form-enter-to,
.slide-form-leave-from {
  max-height: 800px; /* Suficientemente grande */
  opacity: 1;
  transform: translateY(0);
}

/* ============================================
   📱 MÓVIL (< 768px) - TODO AL TAMAÑO DE EMOJI

   📏 Tamaño estándar de emoji: ~20-24px
   🎯 Ancho objetivo: 28-30px (con padding mínimo)
   ============================================ */
@media (max-width: 767px) {
  /* ============================================
     🔷 CELDA-DÍA (cabecera: L, M, Mx...)
     Ancho: 56px (2 columnas de emoji × 28px)
     ============================================ */
  .tabla-favoritos {
    table-layout: fixed !important;
    min-width: max(100%, 500px);
  }

  .celda-dia {
    font-size: 0 !important;
    color: transparent !important;

    /* ✅ Ancho compacto = 2 emojis */
    width: 56px !important;
    min-width: 56px !important;
    max-width: 56px !important;

    /* Padding mínimo */
    padding: 4px 2px !important;
    height: 28px !important;
    line-height: normal !important;
  }

  .celda-dia::before {
    content: attr(data-short) !important;
    display: block !important;

    /* Tamaño de letra/emoji */
    font-size: 18px !important;
    font-weight: bold !important;
    color: white !important;
    letter-spacing: 2px !important; /* Espacio entre letras */
    text-align: center !important;
    line-height: 1.2 !important;
  }

  /* ============================================
     🔷 CELDA-MOMENTO (cabecera: ☀, 🌙)
     Ancho: 28px (1 emoji exacto)
     ============================================ */
  .celda-momento,
  .celda-momento-comida {
    font-size: 0 !important;
    color: transparent !important;

    /* ✅ Ancho = 1 emoji exacto */
    width: 28px !important;
    min-width: 28px !important;
    max-width: 28px !important;

    /* Padding mínimo */
    padding: 2px 1px !important;
    height: 28px !important;
    line-height: normal !important;
  }

  .celda-momento::before,
  .celda-momento-comida::before {
    content: attr(data-short) !important;
    display: block !important;

    /* Emoji tamaño natural */
    font-size: 18px !important;
    color: #2c3e50 !important;
    text-align: center !important;
    line-height: 1.2 !important;
  }

  /* ============================================
     🔷 CELDA-DATO (cuerpo: ◼, ●, ⭐)
     Ancho: 28px (1 emoji exacto)
     ============================================ */
  .celda-dato {
    /* ✅ Ancho = 1 emoji exacto */
    width: 28px !important;
    min-width: 28px !important;
    max-width: 28px !important;

    /* Padding mínimo */
    height: 28px !important;
    padding: 2px 1px !important;

    /* Mantener bordes finos */
    border-bottom: 1px solid #ecf0f1 !important;
    border-right: 1px solid #f0f0f0 !important;
  }

  /* ============================================
     🔷 MARCA (contenido dentro de celda-dato)
     Tamaño del símbolo: ◼ ● ⭐
     ============================================ */
  .marca {
    /* ✅ Tamaño de emoji estándar */
    font-size: 16px !important;
    display: inline-block !important;
    line-height: 1 !important;
  }

  /* ============================================
     🔷 ICON-FAV (⭐ junto al nombre del plato)
     ============================================ */
  .icon-fav {
    /* ✅ Tamaño de emoji compacto */
    font-size: 14px !important;
    margin-left: 4px !important;
  }

  /* ============================================
     🔷 AJUSTES ADICIONES PARA MÓVIL
     ============================================ */

  /* Nombre del plato más compacto */
  .nombre-plato {
    position: sticky;
    left: 0;
    z-index: 10;
    padding: 8px 6px !important;
    font-size: 13px !important;
  }

  /* Reducir espaciado entre filas */
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
