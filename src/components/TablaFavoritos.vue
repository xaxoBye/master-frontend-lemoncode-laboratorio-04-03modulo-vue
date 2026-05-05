<template>
  <fieldset class="menu-fieldset">
    <legend class="menu-legend">🍽️ Semana Actual</legend>
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
        <tr v-for="plato in platos" :key="plato.id" class="fila-plato">
          <td class="nombre-plato">
            {{ plato.nombre }}
            <span v-if="tieneFavoritos(plato)" class="icon-fav">⭐</span>
          </td>

          <template v-for="dia in diasSemana" :key="`${plato.id}-${dia}`">
            <td
              class="celda-momento-comida"
              :class="getCeldaClass(plato, dia, 'comida')"
              @click="toggleFavorito(plato, dia, 'comida')"
            >
              <span v-if="tieneAsignacion(plato, dia, 'comida')" class="marca">
                {{ esFavorito(plato, dia, 'comida') ? '⭐' : '●' }}
              </span>
            </td>

            <td
              :class="getCeldaClass(plato, dia, 'cena')"
              @click="toggleFavorito(plato, dia, 'cena')"
            >
              <span v-if="tieneAsignacion(plato, dia, 'cena')" class="marca">
                {{ esFavorito(plato, dia, 'cena') ? '⭐' : '●' }}
              </span>
            </td>
          </template>
        </tr>

        <!-- Estado vacío -->
        <tr v-if="platos.length === 0">
          <td colspan="15" class="sin-datos">⚪ No hay platos disponibles</td>
        </tr>
      </tbody>
    </table>
  </fieldset>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import menuSemanal from '@/data/comidas.json';
import { DiasSemana } from '@/types';
import type { ComidaAsignada, MomentoComida } from '@/types';

// ====== DATOS ======
const platos = ref<ComidaAsignada[]>(menuSemanal as ComidaAsignada[]);

// ====== DÍAS DE LA SEMANA ======
const diasSemana: DiasSemana[] = [
  DiasSemana.LUNES,
  DiasSemana.MARTES,
  DiasSemana.MIERCOLES,
  DiasSemana.JUEVES,
  DiasSemana.VIERNES,
  DiasSemana.SABADO,
  DiasSemana.DOMINGO,
];

// ====== FUNCIONES AUXILIARES ======

function buscarAsignacion(plato: ComidaAsignada, dia: DiasSemana, momento: MomentoComida) {
  return plato.asignaciones.find((a) => a.dia === dia && a.momento === momento);
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

function toggleFavorito(plato: ComidaAsignada, dia: DiasSemana, momento: MomentoComida): void {
  const asignacion = buscarAsignacion(plato, dia, momento);

  if (asignacion) {
    asignacion.favorito = !asignacion.favorito;
    console.log(`🔄 ${plato.nombre} | ${dia} ${momento} → ${asignacion.favorito}`);
  }
}
</script>

<style scoped>
/* ============================================
   ESTILOS - TABLA ADAPTATIVA
   ============================================ */

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
}
</style>
