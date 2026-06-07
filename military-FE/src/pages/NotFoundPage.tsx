export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <a href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Go Home
        </a>
      </div>
    </div>
  )
}
