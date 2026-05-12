<template>
  <div v-if="mostrar" class="overlay" @click.self="$emit('cancelar')">
    <div class="modal">
      <h3 class="titulo">🗑️ Eliminar plato</h3>

      <p class="mensaje">¿Seguro que quieres eliminar el plato:</p>

      <div class="nombre-plato">
        {{ platoNombre }}
      </div>

      <p class="advertencia">Esta acción eliminará todas sus asignaciones y favoritos.</p>

      <div class="acciones">
        <button class="btn-cancelar" @click="$emit('cancelar')">Cancelar</button>

        <button class="btn-eliminar" @click="$emit('confirmar')">Sí, eliminar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mostrar: boolean;
  platoNombre: string;
}>();

defineEmits<{
  (e: 'confirmar'): void;
  (e: 'cancelar'): void;
}>();
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 9999;
}

.modal {
  width: 90%;
  max-width: 420px;

  background: white;
  border-radius: 12px;

  padding: 24px;

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.titulo {
  margin-top: 0;
  color: #c0392b;
}

.mensaje {
  margin-bottom: 8px;
}

.nombre-plato {
  font-weight: bold;
  font-size: 18px;

  padding: 12px;
  margin-bottom: 16px;

  background: #f8f9fa;
  color: black;
  border-radius: 8px;
}

.advertencia {
  font-size: 14px;
  color: #7f8c8d;
}

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  margin-top: 24px;
}

.btn-cancelar,
.btn-eliminar {
  border: none;
  border-radius: 8px;

  padding: 10px 16px;

  font-weight: 600;
  cursor: pointer;
}

.btn-cancelar {
  background: #ecf0f1;
}

.btn-eliminar {
  background: #e74c3c;
  color: white;
}

.btn-eliminar:hover {
  background: #c0392b;
}
</style>
