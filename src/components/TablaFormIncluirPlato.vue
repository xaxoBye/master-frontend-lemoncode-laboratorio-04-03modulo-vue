<template>
  <transition name="slide-form">
    <div v-if="mostrarFormulario" class="contenedor-formulario">
      <h3 class="form-titulo">
        <span class="icono-titulo">🍽️</span>
        Nuevo Plato
      </h3>

      <form @submit.prevent="handleSubmit" class="formulario-nuevo-plato">
        <div class="campo-formulario">
          <label for="input-nombre" class="label-campo">
            <span class="label-icono">📛</span>
            Nombre del Plato *
          </label>
          <input
            id="input-nombre"
            ref="inputNombreRef"
            :value="formulario.nombre"
            @input="$emit('update:nombre', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Ej: Pasta Carbonara, Ensalada César..."
            class="input-texto"
            :class="{ 'input-error': errores.nombre }"
            maxlength="50"
            required
            autocomplete="off"
            list="lista-platos"
          />
          <datalist id="lista-platos">
            <option v-for="plato in platosOrdenados" :key="plato.id" :value="plato.nombre" />
          </datalist>
          <span v-if="errores.nombre" class="mensaje-error">
            {{ errores.nombre }}
          </span>
        </div>

        <div class="campo-formulario">
          <label for="select-dia" class="label-campo">
            <span class="label-icono">📅</span>
            Día de la Semana *
          </label>
          <select
            id="select-dia"
            :value="formulario.dia"
            @change="$emit('update:dia', ($event.target as HTMLSelectElement).value)"
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

        <div class="campo-formulario campo-radio-group">
          <label class="label-campo">
            <span class="label-icono">⏰</span>
            Momento *
          </label>
          <div class="radio-opciones">
            <label class="opcion-radio">
              <input
                type="radio"
                value="comida"
                :checked="formulario.momento === 'comida'"
                @change="$emit('update:momento', 'comida')"
                name="momento"
              />
              <span class="radio-etiqueta">
                <span class="radio-icono">☀️</span>
                Comida
              </span>
            </label>
            <label class="opcion-radio">
              <input
                type="radio"
                value="cena"
                :checked="formulario.momento === 'cena'"
                @change="$emit('update:momento', 'cena')"
                name="momento"
              />
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

        <div class="botones-accion">
          <button type="submit" class="btn-guardar-form" :disabled="enviando">
            <span v-if="!enviando">✅ Guardar Plato</span>
            <span v-else class="spinner-small"></span>
          </button>
          <button
            type="button"
            @click="$emit('cancelar')"
            class="btn-cancelar-form"
            :disabled="enviando"
          >
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { DiasSemana, MomentoComida } from '@/types';
import type { ComidaAsignada} from '@/types';

const props = defineProps<{
  mostrarFormulario: boolean;
  formulario: {
    nombre: string;
    dia: DiasSemana | '';
    momento: MomentoComida | '';
  };
  errores: {
    nombre: string;
    dia: string;
    momento: string;
  };
  enviando: boolean;
  diasSemana: DiasSemana[];
  platosOrdenados: ComidaAsignada[];
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancelar'): void;
  (e: 'update:nombre', value: string): void;
  (e: 'update:dia', value: DiasSemana | ''): void;
  (e: 'update:momento', value: MomentoComida | ''): void;
}>();

const inputNombreRef = ref<HTMLInputElement | null>(null);

function handleSubmit(): void {
  emit('submit');
}

function formatearDia(dia: DiasSemana): string {
  return dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
}

watch(
  () => props.mostrarFormulario,
  async (nuevoValor) => {
    if (nuevoValor) {
      await nextTick();
      inputNombreRef.value?.focus();
    }
  },
);
</script>

<style scoped>
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
  justify-content: center;
  gap: 10px;
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0066ff;
}

.icono-titulo {
  font-size: 1.75rem;
}

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
  max-height: 800px;
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 767px) {
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
