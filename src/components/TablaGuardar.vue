<!-- src/components/TablaGuardar.vue (SIMPLIFICADO TOTALMENTE) -->
<template>
  <div class="boton-cantidad">
    <button
      type="button"
      class="btn-guardar"
      :class="{
        'btn-guardando': store.isGuardando,
        'btn-exito': store.showExitoGuardado,
        'btn-error': store.showErrorGuardado,
      }"
      :disabled="store.isGuardando || !store.hayCambios"
      @click="handleGuardarClick"
      :title="store.hayCambios ? 'Guardar cambios en localStorage' : 'Sin cambios pendientes'"
    >
      <!-- Icono dinámico según estado del store -->
      <span v-if="store.isGuardando" class="btn-icon spinner" aria-hidden="true"></span>
      <span v-else-if="store.showExitoGuardado" class="btn-icon icono-exito" aria-hidden="true"
        >✓</span
      >
      <span v-else-if="store.showErrorGuardado" class="btn-icon icono-error" aria-hidden="true"
        >✗</span
      >
      <span v-else class="btn-icon icono-guardar" aria-hidden="true">💾</span>

      <!-- Texto dinámico -->
      <span class="btn-texto">{{ textoBotonGuardar }}</span>
    </button>

    <span
      v-if="store.cambiosPendientes > 0 && !store.showExitoGuardado && !store.esAutoGuardado"
      class="badge-cambios"
    >
      &nbsp; Cambios: &nbsp; {{ store.cambiosPendientes }}
    </span>

    <!-- Toast notification (del store) -->
    <transition name="slide-up">
      <div v-if="store.mensajeToast" class="toast-notificacion" :class="`toast-${store.tipoToast}`">
        <span class="toast-texto"> {{ store.mensajeToast }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMenuStore } from '@/stores/menuStore';

// ✅ Conectar al store (única fuente de verdad)
const store = useMenuStore();

// ✅ Computado local SOLO para texto del botón (UI)
const textoBotonGuardar = computed(() => {
  if (store.isGuardando) return 'Guardando...';
  if (store.showExitoGuardado) return '¡Guardado!';
  if (store.showErrorGuardado) return 'Error';
  if (!store.hayCambios) return 'Sin cambios';
  return 'Guardar Cambios';
});

// ✅ Delegar acción al store (no lógica local)
async function handleGuardarClick(): Promise<void> {
  // El store maneja TODO: estado, persistencia, errores, toast
  await store.guardarCambios();
}
</script>

<!-- Los estilos se mantienen iguales -->
<style scoped>
.boton-cantidad {
  /* ✅ FLEX ROW: Botón y badge uno al lado del otro */
  display: flex;
  align-items: center; /* Centra verticalmente */
  justify-content: center; /* Centra horizontalmente */
  gap: 10px; /* Espacio entre botón y badge */
  width: 100%; /* Ocupa todo el ancho disponible */
  flex-wrap: wrap; /* Permite wrap si es muy pequeño */
}

.btn-guardar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  padding: 14px 28px;
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;

  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: 2px solid #276749;
  border-radius: 10px;

  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.35);

  user-select: none;
  outline: none;
  min-width: 200px;
}

.btn-guardar:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(72, 187, 120, 0.45);
  background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
}

/* Active (presionado) */
.btn-guardar:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(72, 187, 120, 0.3);
}

/* Focus accesible */
.btn-guardar:focus-visible {
  outline: 3px solid rgba(66, 153, 225, 0.6);
  outline-offset: 3px;
}

/* Deshabilitado (sin cambios pendientes) */
.btn-guardar:disabled {
  background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
  border-color: #718096;
  color: #4a5568;
  cursor: not-allowed;
  box-shadow: none;
  transform: none !important;
  opacity: 0.7;
}

/* Estado: Cargando */
.btn-guardando {
  pointer-events: none;
  opacity: 0.9;
}

/* Estado: Éxito */
.btn-exito {
  background: linear-gradient(135deg, #48bb78 0%, #276749 100%) !important;
  animation: pulse-success 0.6s ease-out;
}

@keyframes pulse-success {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Estado: Error */
.btn-error {
  background: linear-gradient(135deg, #fc8181 0%, #c53030 100%) !important;
  border-color: #9b2c2c !important;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-6px);
  }
  75% {
    transform: translateX(6px);
  }
}

.badge-cambios {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 12px;

  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
  font-size: 14px;
  font-weight: 700;
  border-radius: 50%; /* ✅ Circular */

  animation: bounce-badge 1s ease infinite;
  box-shadow: 0 4px 8px rgba(237, 137, 54, 0.3);
}

@keyframes bounce-badge {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

.toast-notificacion {
  /* ✅ MISMO ANCHO QUE EL BOTÓN (o contenedor) */
  width: 100%;
  max-width: 350px; /* Limita ancho máximo */
  min-width: 200px; /* Ancho mínimo igual al botón */

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 14px 20px;

  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

  font-size: 14px;
  font-weight: 500;
  color: #2d3748;

  /* ✅ Bordes laterales según tipo */
  border-left: 5px solid transparent;
}

.toast-exito {
  border-left-color: #48bb78;
  background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
  color: #22543d;
}

.toast-error {
  border-left-color: #e53e3e;
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
  color: #742a2a;
}

.toast-info {
  border-left-color: #4299e1;
  background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
  color: #2a4365;
}

.toast-texto {
  text-align: center;
  line-height: 1.4;
  flex: 1;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}

.btn-texto {
  flex-shrink: 0;
}

/* Spinner de carga */
.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Iconos de estado */
.icono-exito {
  color: #f0fff4;
  font-weight: bold;
  font-size: 20px;
}

.icono-error {
  color: #fff5f5;
  font-weight: bold;
  font-size: 20px;
}

.icono-guardar {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

@media (max-width: 767px) {
  .contenedor-boton-guardar {
    margin-top: 16px;
    padding: 16px;
    gap: 10px;
  }

  .boton-y-badge {
    flex-direction: column; /* En móvil: apilar verticalmente */
    gap: 8px;
  }

  .btn-guardar {
    width: 100%;
    padding: 14px 20px;
    font-size: 14px;
    min-width: auto;
  }

  .badge-cambios {
    position: static; /* En móvil: no absoluto */
    margin-top: -8px;
    margin-left: auto;
    margin-right: auto;
  }

  .toast-notificacion {
    width: calc(100% - 32px); /* Ajustar a padding del contenedor */
    max-width: none;
    font-size: 13px;
    padding: 12px 16px;
  }
}
</style>
