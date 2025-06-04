import React, { useEffect, useState } from 'react'

interface Subscription {
  id: string
  channelName: string
  channelUrl: string
  createdAt: string
}

interface ChannelSidebarProps {
  userId: string
  refreshTrigger: number
}

export function ChannelSidebar({
  userId,
  refreshTrigger,
}: ChannelSidebarProps) {
  const [subscriptions, setSubscriptions] = useState<Array<Subscription>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${import.meta.env.VITE_ELYSIA_BACKEND_URL}/subscriptions/${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions')
      }

      const data = await response.json()
      if (data.success) {
        setSubscriptions(data.subscriptions)
      } else {
        throw new Error(data.error || 'Failed to fetch subscriptions')
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err)
      setError('Failed to load channels')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSubscription = async (subscriptionId: string) => {
    try {
      setDeletingId(subscriptionId)

      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete subscription')
      }

      // Remove from local state
      setSubscriptions((prev) =>
        prev.filter((sub) => sub.id !== subscriptionId),
      )
    } catch (err) {
      console.error('Error deleting subscription:', err)
      setError('Failed to delete channel')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [userId, refreshTrigger])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getChannelIcon = (channelName: string) => {
    return channelName.charAt(0).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">My Channels</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">My Channels</h2>
        <span className="text-sm text-gray-500">
          {subscriptions.length} channels
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchSubscriptions}
            className="text-xs text-red-700 hover:text-red-800 mt-1 underline"
          >
            Try again
          </button>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h6V3H9zM6 7v10h12V7H6z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No channels yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Add YouTube channels to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="group flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getChannelIcon(subscription.channelName)}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {subscription.channelName}
                </p>
                <p className="text-xs text-gray-500">
                  Added {formatDate(subscription.createdAt)}
                </p>
              </div>

              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={subscription.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Visit channel"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>

                <button
                  onClick={() => deleteSubscription(subscription.id)}
                  disabled={deletingId === subscription.id}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Remove channel"
                >
                  {deletingId === subscription.id ? (
                    <div className="w-4 h-4 animate-spin border border-gray-300 border-t-gray-600 rounded-full"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
