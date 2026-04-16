function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center justify-center p-6 text-white font-sans">
      {/* 模擬手機頂部狀態列的感覺 */}
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
        <div className="text-5xl mb-6">✈️</div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight">探索旅程</h1>
        <p className="text-blue-100 mb-8 leading-relaxed">
          規劃你的下一趟冒險，從這裡開始。
        </p>
        
        <button className="w-full bg-white text-blue-600 font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
          開始探索
        </button>
        
        <p className="mt-6 text-sm text-blue-200">
          Powered by Senior Engineer AI
        </p>
      </div>
    </div>
  )
}

export default App