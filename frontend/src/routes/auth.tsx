import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { LoginForm } from '../components/LoginForm'
import { RegisterForm } from '../components/RegisterForm'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/auth')({
  // Redirect authenticated users to dashboard
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (session.data) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: AuthPage,
})

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sommario</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your personal content summarization tool
          </p>
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setIsLogin(true)}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  isLogin
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  !isLogin
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}
