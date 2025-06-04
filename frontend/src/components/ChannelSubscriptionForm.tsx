import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const channelSchema = z.object({
  channelUrls: z.string().min(1, 'Please enter at least one channel URL'),
})

type ChannelFormData = z.infer<typeof channelSchema>

interface ChannelSubscriptionFormProps {
  userId: string
  onSubscriptionAdded: () => void
}

export function ChannelSubscriptionForm({
  userId,
  onSubscriptionAdded,
}: ChannelSubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
  })

  const extractChannelName = (url: string): string => {
    try {
      // Extract channel name from different YouTube URL formats
      const urlObj = new URL(url)

      // Handle @username format
      if (url.includes('@')) {
        const match = url.match(/@([^/?]+)/)
        if (match) return match[1]
      }

      // Handle /c/ format
      if (url.includes('/c/')) {
        const match = url.match(/\/c\/([^/?]+)/)
        if (match) return match[1]
      }

      // Handle /channel/ format
      if (url.includes('/channel/')) {
        const match = url.match(/\/channel\/([^/?]+)/)
        if (match) return match[1]
      }

      // Handle /user/ format
      if (url.includes('/user/')) {
        const match = url.match(/\/user\/([^/?]+)/)
        if (match) return match[1]
      }

      // Fallback: use domain
      return urlObj.hostname
    } catch {
      // If URL parsing fails, extract from the raw string
      const match = url.match(
        /(?:youtube\.com\/(?:c\/|channel\/|user\/|@)|youtu\.be\/)([^/?]+)/,
      )
      return match ? match[1] : 'Unknown Channel'
    }
  }

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(c\/|channel\/|user\/|@)|youtu\.be\/)/
    return youtubeRegex.test(url)
  }

  const onSubmit = async (data: ChannelFormData) => {

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Split URLs by newlines and filter out empty lines
      const urls = data.channelUrls
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0)

      if (urls.length === 0) {
        setError('Please enter at least one valid YouTube channel URL')
        return
      }

      // Validate all URLs
      const invalidUrls = urls.filter((url) => !validateYouTubeUrl(url))
      if (invalidUrls.length > 0) {
        setError(`Invalid YouTube URLs: ${invalidUrls.join(', ')}`)
        return
      }

      // Add each subscription
      const results = await Promise.allSettled(
        urls.map(async (url) => {
          const channelName = extractChannelName(url)

          console.log('attempting to subscribe to', url, channelName, userId)

          const response = await fetch(`${import.meta.env.VITE_ELYSIA_BACKEND_URL}/subscriptions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              channelUrl: url,
              channelName,
              userId,
            }),
          })

          if (!response.ok) {
            throw new Error(`Failed to add ${channelName}`)
          }

          console.log("here's the response",response)

          return response.json()
        }),
      )

      const failed = results.filter((result) => result.status === 'rejected')
      const succeeded = results.filter(
        (result) => result.status === 'fulfilled',
      )

      if (failed.length > 0) {
        setError(
          `Failed to add ${failed.length} channel(s). ${succeeded.length} added successfully.`,
        )
      } else {
        setSuccess(`Successfully added ${succeeded.length} channel(s)!`)
        reset()
      }

      onSubscriptionAdded()
    } catch (err) {
      console.error('Subscription error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Add YouTube Channels
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="channelUrls"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            YouTube Channel URLs
          </label>
          <textarea
            {...register('channelUrls')}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
            placeholder="Enter YouTube channel URLs (one per line)&#10;&#10;Examples:&#10;https://youtube.com/@channel&#10;https://youtube.com/c/channelname&#10;https://youtube.com/channel/UC..."
          />
          {errors.channelUrls && (
            <p className="mt-2 text-sm text-red-600">
              {errors.channelUrls.message}
            </p>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p className="mb-1">Supported formats:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>https://youtube.com/@channelname</li>
            <li>https://youtube.com/c/channelname</li>
            <li>https://youtube.com/channel/UC...</li>
            <li>https://youtube.com/user/username</li>
          </ul>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{success}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding channels...
            </div>
          ) : (
            'Add Channels'
          )}
        </button>
      </form>
    </div>
  )
}
