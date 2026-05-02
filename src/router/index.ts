import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import Favoritos from '@/views/Favoritos.vue';
import Configuracion from '@/views/Configuracion.vue';
import About from '@/views/About.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/favoritos',
      name: 'favoritos',
      component: Favoritos,
    },
    {
      path: '/configuracion',
      name: 'configuracion',
      component: Configuracion,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
  ],
});

export default router;
