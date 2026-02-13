import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomePage.vue'
import LoginForm from '@/views/LoginForm.vue'
import RegisterForm from '@/views/RegisterForm.vue'
import GpsSession from '@/views/gpsSessions/GpsSessions.vue'
import UserGpsSessionCreate from '@/views/gpsSessions/GpsSessionCreate.vue'
import UserGpsSessionEdit from '@/views/gpsSessions/GpsSessionEdit.vue'
import Map from '@/views/gpslocations/MapView.vue'
import UserGpsSessions from '@/views/gpsSessions/UserGpsSessions.vue'
import UserMap from '@/views/gpslocations/UserMapView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'LoginForm',
    component: LoginForm,
  },
  {
    path: '/register',
    name: 'RegisterForm',
    component: RegisterForm,
  },
  {
    path: '/gpssessions',
    name: 'GpsSessions',
    component: GpsSession,
  },
  {
    path: '/gpssessions/session/:id',
    name: 'GpsSessionMap',
    component: Map,
  },
  {
    path: '/usergpssessions',
    name: 'UserGpsSessions',
    component: UserGpsSessions,
  },
  {
    path: '/usergpssessions/create',
    name: 'UserGpsSessionCreate',
    component: UserGpsSessionCreate,
  },
  {
    path: '/usergpssessions/edit/:id',
    name: 'UserGpsSessionEdit',
    component: UserGpsSessionEdit,
  },
  {
    path: '/usergpssessions/session/:id',
    name: 'UserGpsSessionMap',
    component: UserMap,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
