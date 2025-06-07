export default function Loading() {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-xl text-white">Loading TrackYourMoney...</p>
        </div>
      </div>
    )
  }
  