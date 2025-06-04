import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import swagger from '@elysiajs/swagger'
import { auth } from './auth/lib/auth'
import { subscriptionsRoute } from './routes/subscriptions'

const app = new Elysia()
  .use(swagger())
  .use(cors())

  .mount(auth.handler)
  .use(subscriptionsRoute)
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
