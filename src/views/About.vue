<template>
  <main>
    <section>
      <h3>👨‍🏫Profesor: PAUL MELERO</h3>
      <p>
          <svg class="logo" viewBox="0 0 128 128" width="24" height="24" data-v-20fc5455=""><path fill="#42b883" d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z" data-v-20fc5455=""></path><path fill="#35495e" d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z" data-v-20fc5455=""></path></svg>
        VUE</p>
    </section>

    <header class="intro">
      <h1>🥗 Ejercicio: Meal Planner App</h1>
      <h2>Intro</h2>
      <p>El laboratorio del módulo de Vue lo hemos dividido en dos secciones:</p>
      <ul>
        <li>Básico: aplicar las técnicas que hemos visto en la parte práctica de Vue en una aplicación sencilla, pero dejando espacio para que podáis experimentar libremente.</li>
        <li>Opcional: para explorar funcionalidades más avanzadas o similares a lo que os podríais encontrar en un entorno real.</li>
      </ul>
    </header>

    <section id="ejercicio">
      <h2>🍽️ Ejercicio: Meal Planner App</h2>
      <ul>
        <li>Un formulario que permita añadir un plato, indicando</li>
        <li>El formulario puede estar en un modal o en la parte superior de la página principal.</li>
        <li>En la vista principal se muestren los días de 1 semana con los platos que vamos añadiendo</li>
              <ul>
                <li>Cada día puede mostrar una lista de platos (por ejemplo: "Comida" o "Cena").</li>
                <li>Cada plato debe tener un botón "Eliminar" para borrarlo del plan.</li>
                <li>Cada plato debe tener un botón para "Editar" para modificar el nombre o el día de un plato.</li>
                <li>Cada plato debe tener un botón para "Marcar como favorito" para añadirlo a la lista de platos favoritos.</li>
                <li>Deberíamos tener un botón para "Limpiar" el plan semanal completo, pero que te pida confirmación antes de hacerlo.</li>
              </ul>
        <li>El estado de la aplicación (lista de platos planificados) debe gestionarse con Pinia o podemos usar un composable con variables reactivas (ref o computed).</li>
        <li>Una vez se añada un plato, el formulario debe limpiarse automáticamente (o cerrarse el modal, en caso de que hayáis elegido hacerlo en un modal).</li>
      </ul>
    </section>

    <section id="caracteristicas">
      <h2>🔧 Requisitos básicos</h2>
      <ul>
        <li>Usar Vue Router para organizar la aplicación con al menos dos vistas:</li>
            <ul>
              <li>Una vista principal de "Plan semanal" (lista de comidas por día).</li>
              <li>Una vista "Lista de platos favoritos" (opcionalmente, platos frecuentes para reutilizar).</li>
              <li>(Opcionalmente) que en cada uno de estos platos tengamos un botón para añadirlo al plan semanal actual.</li>
            </ul>
        <li>Gestionar el estado global de las comidas con Pinia o podemos usar un composable</li>
        <li>Mantener una estructura clara de componentes (por ejemplo: MealForm.vue, MealList.vue, DayCard.vue, etc.).</li>
        <li>El diseño puede hacerse con Tailwind CSS (recomendado por rapidez) o con CSS propio. No recomiendo usar una librería de componentes a no ser que la conozcáis bien de antemano, ya que os va a retrasar más que ayudaros.</li>
      </ul>
    </section>

    <!-- 4. TECNOLOGÍAS: Otra sección temática -->
    <section id="requisitos">
      <h2>🌱 Requisitos adicionales (Opcional)</h2>
      <ul>
        <li>💾 Persistencia del estado:</li>
              <ul>
                <li>Si habéis elegido usar Pinia, usar el plugin pinia-plugin-persistedstate para que el plan semanal no se pierda al recargar la página.</li>
                <li>Si habéis elegido usar un composable, usar el localStorage para guardar el plan semanal.</li>
              </ul>
        <li>🔍 Filtrar o buscar platos por nombre o por día en la vista principal o en la vista de platos favoritos o en las dos.</li>
        <li>🗓️ Añadir filtro de categorías de comidas (por ejemplo: "Desayuno", "Comida", "Cena") y permitir mostrar solo los platos de una categoría específica en la semana.</li>
        <li>📱 Diseño responsive, para que se vea bien en móviles.</li>
        <li>🧺 Funcionalidades extra</li>
            <ul>
              <li>Navegación adicional: "Plan semanal" / "Platos favoritos" / "Configuración" (opcional).</li>
            </ul>
      </ul>
    </section>



    <!-- 7. NOTAS: Usamos footer para cerrar el contenido -->
    <footer clsass="notas">
      <h2>✏️ Notas</h2>
      <p>Las funcionalidades adicionales son opcionales: no es necesario implementarlas todas. Podéis añadir algunas o incluso proponer otras que se os ocurran.</p>
    </footer>

  </main>
</template>

