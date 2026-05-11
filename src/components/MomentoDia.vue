<template>
  <div class="bloque-comida">
    <dt class="titulo-comida">
      {{ momento }}
    </dt>
    <dd class="contenido-comida">
      <template v-if="platos && platos.length > 0">
        <div v-for="(plato, index) in platos" :key="index" class="plato-item">
          <span> {{ plato.nombre }}</span>
          <span v-if="tieneFavorito(plato)" class="favorito" title="Plato favorito"> ⭐ </span>
        </div>
      </template>
      <span v-else class="sin-asignar">Sin asignar</span>
    </dd>
  </div>
</template>

<script setup lang="ts">
import type {  ComidaAsignada, DiasSemana } from '@/types';

const props = defineProps<{
  dia: DiasSemana;
  momento: string;
  platos: ComidaAsignada[];
}>();


function tieneFavorito(plato: ComidaAsignada): boolean {
  return (
    plato.asignaciones?.some(
      (asignacion) =>
          asignacion.dia === props.dia &&
          asignacion.favorito === true,
    ) ?? false
  );
}
</script>

<style scoped>
.bloque-comida {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.titulo-comida {
  width: 65px;
  flex-shrink: 0;
  margin: 0;
  padding: 0.25rem;
  text-align: center;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.icono {
  font-size: 1rem;
}

.contenido-comida {
  color: #555;
  font-weight: 500;
  border: 1px dashed #555;
  border-radius: 10px;
  flex: 1;
  margin: 0;
  padding: 0.25rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plato-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 6px;
  background: #f8fafc;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.plato-item:hover {
  background: #e0f2fe;
}

.plato-item .nombre::before {
  content: '•';
  color: #0066ff;
  font-weight: bold;
  margin-right: 4px;
}

.favorito {
  font-size: 0.9rem;
  animation: pulse-fav 2s infinite;
}

@keyframes pulse-fav {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.sin-asignar {
  color: cadetblue;
}
</style>
