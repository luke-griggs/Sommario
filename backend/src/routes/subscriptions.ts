import { Elysia, t } from 'elysia'
import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { subscriptions, user } from '../db/schema'

export interface Channel {
  channelName: string
  channelUrl: string
  userId: string
}

export const subscriptionsRoute = new Elysia({ prefix: '/subscriptions' })
  .post('/', async ({ body, set }) => {
    try {
      const { channelUrl, channelName, userId } = body as Channel

      // Insert new subscription
      const newSubscription = await db
        .insert(subscriptions)
        .values({
          id: crypto.randomUUID(),
          channelName,
          channelUrl,
          userId,
        })
        .returning()

      set.status = 201
      return { success: true, subscription: newSubscription[0] }
    } catch (error) {
      set.status = 500
      return { success: false, error: 'Failed to create subscription' }
    }
  })
  .get('/:userId', async ({ params, set }) => {
    try {
      const userSubscriptions = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, params.userId))

      return { success: true, subscriptions: userSubscriptions }
    } catch (error) {
      set.status = 500
      return { success: false, error: 'Failed to fetch subscriptions' }
    }
  })
  .delete('/:id', async ({ params, set }) => {
    try {
      await db.delete(subscriptions).where(eq(subscriptions.id, params.id))
      set.status = 200
      return { success: true, message: 'Subscription deleted' }
    } catch (error) {
      set.status = 500
      return { success: false, error: 'Failed to delete subscription' }
    }
  })
