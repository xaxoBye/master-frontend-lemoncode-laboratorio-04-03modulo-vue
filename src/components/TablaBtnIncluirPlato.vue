<template>
  <button
    v-if="!mostrarFormulario"
    @click="$emit('abrir-formulario')"
    class="btn-añadir-plato"
    title="Añadir un nuevo plato al menú"
  >
    <span class="btn-icono">➕</span>
    <span class="btn-texto">Añadir Nuevo Plato</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  mostrarFormulario: boolean;
}>();

defineEmits<{
  (e: 'abrir-formulario'): void;
}>();
</script>

<style scoped>
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
  white-space: nowrap; /* Fuerza a mantener el texto en una sola línea */
}

/* ============================================
   📱 RESPONSIVE: MÓVIL (< 768px)
   ============================================ */
@media (max-width: 767px) {
  .btn-añadir-plato {
    width: 100%;
    justify-content: center;
  }
}
</style>
