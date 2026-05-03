<template>
  <div class="bloque-comida">
    <dt class="titulo-comida">{{ momento }}</dt>
    <dd class="contenido-comida">
      <template v-if="platos && platos.length > 0">
        <span v-for="(plato, index) in platos" :key="index" class="plato-item">
          {{ plato }}
        </span>
      </template>
      <span v-else class="sin-asignar">Sin asignar</span>
    </dd>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  momento: string;
  platos: string[];
}>();
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
}

.plato-item::before {
  content: ' • ';
}
</style>
