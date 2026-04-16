import React, { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

// 🚀 保持你原本的 Firebase 金鑰
const firebaseConfig = {
  apiKey: "AIzaSyBtwUC90sUsdRgfv7mhsOAWQN7lswf8Ihw",
  authDomain: "my-travel-app-d56db.firebaseapp.com",
  projectId: "my-travel-app-d56db",
  storageBucket: "my-travel-app-d56db.firebasestorage.app",
  messagingSenderId: "163967287507",
  appId: "1:163967287507:web:110072adc330136879d426"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // 控制彈出視窗
  
  // 表單狀態
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLoc, setNewLoc] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "spots"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // 按時間排序（如果有填寫時間的話）
    setSpots(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 送出資料到 Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName || !newDesc) return alert("請填寫名稱與描述");

    try {
      await addDoc(collection(db, "spots"), {
        name: newName,
        description: newDesc,
        location: newLoc,
        image: `https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800`, // 暫時給一張預設圖
        createdAt: serverTimestamp()
      });
      
      // 清空表單並關閉視窗
      setNewName("");
      setNewDesc("");
      setNewLoc("");
      setShowModal(false);
      
      // 重新抓取資料
      fetchData();
    } catch (err) {
      console.error("新增失敗", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="p-6 bg-white border-b flex justify-between items-center">
        <h1 className="text-2xl font-black text-blue-600 tracking-tighter">MY TRAVELS</h1>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
          JD
        </div>
      </header>

      <main className="p-4 flex flex-col gap-6">
        {loading ? (
          <div className="flex justify-center py-20 italic text-gray-400">Loading...</div>
        ) : (
          spots.map(spot => (
            <div key={spot.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <img src={spot.image} alt={spot.name} className="w-full h-56 object-cover" />
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-gray-800">{spot.name}</h2>
                  <span className="text-blue-500 text-xs font-semibold uppercase tracking-wider">{spot.location}</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{spot.description}</p>
              </div>
            </div>
          ))
        )}
      </main>

      {/* 🚀 懸浮新增按鈕 (FAB) */}
      <button 
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-transform"
      >
        +
      </button>

      {/* 🖼️ 新增景點的彈出視窗 (Modal) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">新增景點</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                placeholder="景點名稱" 
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500"
                value={newName} onChange={(e) => setNewName(e.target.value)}
              />
              <input 
                placeholder="地點 (例如：日本、台北)" 
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500"
                value={newLoc} onChange={(e) => setNewLoc(e.target.value)}
              />
              <textarea 
                placeholder="分享一下你的心得..." 
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 h-32"
                value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
              />
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200"
              >
                發佈景點
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 底部導航 */}
      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-md border-t flex justify-around p-4">
        <span className="text-blue-600 font-bold">探索</span>
        <span className="text-gray-300">收藏</span>
        <span className="text-gray-300">個人</span>
      </nav>
    </div>
  );
}