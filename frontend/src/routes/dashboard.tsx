import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { authClient } from '../lib/auth-client'
import { ChannelSubscriptionForm } from '../components/ChannelSubscriptionForm'
import { ChannelSidebar } from '../components/ChannelSidebar'

export const Route = createFileRoute('/dashboard')({
  // Use beforeLoad for authentication check
  beforeLoad: async ({ context }) => {
    const session = await authClient.getSession()
    if (!session.data) {
      throw redirect({
        to: '/auth',
      })
    }
    return {
      ...context,
      user: session.data.user,
    }
  },
  component: Dashboard,
})

function Dashboard() {
  const navigate = useNavigate()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Get the user data from the route context
  const { user } = Route.useRouteContext()

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: '/auth' })
          },
        },
      })
      // TanStack Router will handle the redirect automatically
    } catch (signOutError) {
      console.error('Sign out failed:', signOutError)
      // Could show a toast notification here
    }
  }

  const handleSubscriptionAdded = () => {
    // Trigger refresh of the sidebar
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <ChannelSidebar userId={user.id} refreshTrigger={refreshTrigger} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Sommario
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.name
                          ? user.name.charAt(0).toUpperCase()
                          : user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || 'User'}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Sommario!
              </h2>
              <p className="text-gray-600">
                Manage your YouTube channel subscriptions and get AI-powered
                summaries.
              </p>
            </div>

            {/* Channel Subscription Form */}
            <div className="mb-8">
              <ChannelSubscriptionForm
                userId={user.id}
                onSubscriptionAdded={handleSubscriptionAdded}
              />
            </div>

            {/* Additional Features Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Coming Soon
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900">
                      Video Summaries
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Get AI-powered summaries of videos from your subscribed
                    channels.
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-5 5h5m-5-5v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900">
                      Smart Notifications
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Get notified when new content is available from your
                    favorite channels.
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900">Analytics</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Track your viewing patterns and discover trending content.
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900">
                      Bulk Operations
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Import/export subscriptions and manage channels in bulk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
