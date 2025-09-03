const Spinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Loading...
          </p>
        </div>
      </div>
    </div>
  )
}

export default Spinner
