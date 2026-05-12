// src/composables/usePlatoForm.ts
import { ref, reactive } from 'vue';
import { DiasSemana, MomentoComida } from '@/types';
import { useMenuStore } from '@/stores/menuStore';

export function usePlatoForm() {
  const store = useMenuStore();
  const mostrarFormulario = ref(false);
  const enviando = ref(false);

  const formulario = reactive({
    nombre: '',
    dia: '' as DiasSemana | '',
    momento: '' as MomentoComida | '',
  });

  const errores = reactive({
    nombre: '',
    dia: '',
    momento: '',
  });

  function resetearFormulario(): void {
    formulario.nombre = '';
    formulario.dia = '' as DiasSemana | '';
    formulario.momento = '' as MomentoComida | '';
    errores.nombre = '';
    errores.dia = '';
    errores.momento = '';
    enviando.value = false;
  }

  function abrirFormulario(): void {
    mostrarFormulario.value = true;
    resetearFormulario();
  }

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

  function validarFormulario(): boolean {
    let valido = true;

    errores.nombre = '';
    errores.dia = '';
    errores.momento = '';

    if (!formulario.nombre || formulario.nombre.trim() === '') {
      errores.nombre = 'El nombre del plato es obligatorio';
      valido = false;
    } else if (formulario.nombre.trim().length < 2) {
      errores.nombre = 'El nombre debe tener al menos 2 caracteres';
      valido = false;
    }

    if (!formulario.dia) {
      errores.dia = 'Debes seleccionar un día';
      valido = false;
    }

    if (!formulario.momento) {
      errores.momento = 'Debes seleccionar comida o cena';
      valido = false;
    } else if (platoYaExiste(formulario.nombre.trim())) {
      errores.nombre = '⚠️ Este plato ya existe en tu menú';
      valido = false;
    }

    return valido;
  }

  function guardarEnLocalStorage(): void {
    try {
      const datosAGuardar = JSON.stringify(store.platos);
      localStorage.setItem('menu-semanal-favoritos', datosAGuardar);
      store.marcarComoAutoGuardado();
    } catch (error) {
      console.error('❌ Error guardando en localStorage:', error);
      store.mostrarToast('Error al guardar los datos', 'error');
    }
  }

  async function handleIncluirPlato(): Promise<void> {
    if (!validarFormulario()) {
      console.log('❌ Validación fallida');
      return;
    }

    try {
      enviando.value = true;

      await new Promise((resolve) => setTimeout(resolve, 300));

      const nuevoPlato = store.incluirNuevoPlato(
        formulario.nombre.trim(),
        formulario.dia as DiasSemana,
        formulario.momento as MomentoComida,
      );

      console.log('✅ Plato creado exitosamente:', nuevoPlato);
      console.log('📊 Total platos en store ahora:', store.platos.length);

      guardarEnLocalStorage();
      cerrarFormulario();

      store.mostrarToast(`✅ "${formulario.nombre}" añadido correctamente`, 'exito');
    } catch (error) {
      console.error('❌ Error al añadir plato:', error);
      store.mostrarToast('Error al añadir el plato', 'error');
    } finally {
      enviando.value = false;
    }
  }

  return {
    mostrarFormulario,
    formulario,
    errores,
    enviando,
    abrirFormulario,
    cerrarFormulario,
    handleIncluirPlato,
    guardarEnLocalStorage,
  };
}
