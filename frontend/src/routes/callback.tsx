import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/callback')({
  component: Callback,
})

function Callback() {
  return <div>Callback</div>
}

