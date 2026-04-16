import React, { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app); // 初始化儲存空間

export default function App() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // 上傳狀態

  // 表單狀態
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // 檔案狀態
  const [previewUrl, setPreviewUrl] = useState(null); // 預覽圖

  const fetchData = async () => {
    setLoading(true);
    // 按時間排序，最新發佈的在最上面
    const q = query(collection(db, "spots"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSpots(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 處理檔案選擇與預覽
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName || !selectedFile) return alert("請填寫名稱並選擇照片");

    setIsUploading(true);
    try {
      // 1. 先把照片上傳到 Firebase Storage
      const storageRef = ref(storage, `images/${Date.now()}_${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      const imageUrl = await getDownloadURL(storageRef);

      // 2. 再把資料（含圖片網址）存到 Firestore
      await addDoc(collection(db, "spots"), {
        name: newName,
        description: newDesc,
        location: newLoc,
        image: imageUrl, // 使用剛才取得的雲端圖片網址
        createdAt: serverTimestamp()
      });

      // 3. 重設狀態
      setNewName(""); setNewDesc(""); setNewLoc(""); setSelectedFile(null); setPreviewUrl(null);
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("上傳失敗", err);
      alert("上傳失敗，請檢查網路");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="p-6 bg-white border-b flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-black text-blue-600">MY TRAVELS</h1>
      </header>

      <main className="p-4 flex flex-col gap-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400">讀取中...</div>
        ) : (
          spots.map(spot => (
            <div key={spot.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-in fade-in duration-500">
              <img src={spot.image} alt={spot.name} className="w-full h-64 object-cover" />
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-gray-800">{spot.name}</h2>
                  <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest">{spot.location}</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{spot.description}</p>
              </div>
            </div>
          ))
        )}
      </main>

      <button onClick={() => setShowModal(true)} className="fixed bottom-24 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl z-40"> + </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">新增旅程</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 圖片選擇區域 */}
              <div className="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">點擊上傳照片</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <input placeholder="景點名稱" className="w-full p-4 bg-gray-50 rounded-xl" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <input placeholder="地點" className="w-full p-4 bg-gray-50 rounded-xl" value={newLoc} onChange={(e) => setNewLoc(e.target.value)} />
              <textarea placeholder="寫下你的回憶..." className="w-full p-4 bg-gray-50 rounded-xl h-24" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
              
              <button 
                disabled={isUploading}
                className={`w-full py-4 rounded-xl font-bold text-white ${isUploading ? 'bg-gray-400' : 'bg-blue-600'}`}
              >
                {isUploading ? "上傳中..." : "發佈景點"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}