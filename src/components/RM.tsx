// =============================================
// RMDashboard.tsx（最終版）
// 理專（RM）Dashboard（完全同步分行經理框架設定）
// =============================================
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart4,
  MessageSquareText,
  Settings,
  LogOut,
  Bell,
  MoreVertical,
  UserCircle,
  Star,
  FileText,
  X,
} from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { initSharedMessages } from "../Utils/initSharedMessages";
import potentialData from "../data/potential_data.json";

//icon
import Home from "../AI_icon/icon_home.svg";
import Anal from "../AI_icon/icon_analyze.svg";
import Message from "../AI_icon/icon_message.svg";
import Setting from "../AI_icon/icon_settings.svg";
import Logout from "../AI_icon/icon_log-out.svg";
import SCSB from "../AI_icon/logo_scsb.svg";
import List from "../AI_icon/icon_list.svg";
// ====================== 型別 ======================
interface Message {
  id: number;
  sender: string;
  senderRole: string;
  recipientRole: string;
  ownerRole?: string;
  subject: string;
  preview: string;
  content: string;
  time: string;
  starred: boolean;
  box: string;
  replies: { sender: string; senderRole: string; content: string; time: string }[];
}


// ====================== 主元件 ======================
const RMDashboard: React.FC = () => {
  const { user, setUser } = useUser();
  const [hasNotification, setHasNotification] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "region" | "analysis" | "message" | "potential">("all");

  const [dateRange, setDateRange] = useState({
    start: "2025-01-01",
    end: "2025-09-28",
  });

  const handleDateChange = (type: "start" | "end", value: string) => {
    setDateRange((prev) => ({ ...prev, [type]: value }));
  };
  // ====== 圖片預覽用 state ======
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const openImage = (src: string) => setPreviewImage(src);
  const closeImage = () => setPreviewImage(null);

  // ---------------- 郵件邏輯 ----------------
  const [mailBox, setMailBox] = useState("收件夾");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

  useEffect(() => {
  initSharedMessages();

  const loadMessages = () => {
    const stored = localStorage.getItem("sharedMessages");
    if (stored) {
      const allMessages = JSON.parse(stored);
      // ✅ 只顯示 RM 相關信件
      const related = allMessages.filter(
        (msg: any) =>
          msg.senderRole === "rm" ||
          msg.recipientRole === "rm" ||
          msg.ownerRole === "rm"
      );
      setMessages(related);
    }
  };

  loadMessages();
  window.addEventListener("storage", loadMessages);
  return () => window.removeEventListener("storage", loadMessages);
  }, []);

  const filteredMessages = messages.filter((msg: Message) => msg.box === mailBox);

  const handleDelete = (id: number) => {
    const msg = messages.find((m) => m.id === id);
    if (msg?.starred) {
      if (!window.confirm("⚠️ 此信件已被註記為重要信件，確定要刪除嗎？")) return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMessage?.id === id) setSelectedMessage(null);
  };

  const toggleStar = (id: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m))
    );
  };

  const handleReplySend = () => {
    if (!replyContent.trim()) return alert("請輸入回覆內容！");

    const currentUser = user?.username || "理專";
    const stored = localStorage.getItem("sharedMessages");
    const allMessages = stored ? JSON.parse(stored) : [];

    const updated = allMessages.map((msg: any) => {
      if (msg.id === selectedMessage?.id) {
        const newReply = {
          sender: currentUser,
          senderRole: "rm", // ✅ 統一小寫
          content: replyContent,
          time: new Date().toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        // ✅ 同時新增 reply 並確保同步更新給對方（分行經理）
        return {
          ...msg,
          replies: [...(msg.replies || []), newReply],
        };
      }
      return msg;
    });

    localStorage.setItem("sharedMessages", JSON.stringify(updated));

    // ✅ 廣播更新事件
    window.dispatchEvent(new Event("storage"));

    setReplyContent("");
    setShowReplyBox(false);
    alert("✅ 回覆已寄出，分行經理已同步收到。");
  };

  // ======================== 主畫面 ========================
  return (
    <div className="relative min-h-screen bg-[#f8f8f8] text-gray-800">
      {/* 上方橘色導覽列 */}
      <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#D23F06] to-[#E45E06] text-white shadow-md py-3 px-8 flex justify-between items-center">
        <h1 className="text-lg font-semibold tracking-wide">
        <img
          src={SCSB}
          alt="上海商業儲蓄銀行"
          className="h-10 w-auto object-contain"
        />
      </h1>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <UserCircle size={26} />
            <span className="text-sm font-medium">
              {user?.username || "理專 (RM)"}
            </span>
          </div>
          <button
            onClick={() => setHasNotification(false)}
            className="relative hover:text-yellow-200 transition-all"
          >
            <Bell size={22} />
            {hasNotification && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
          <MoreVertical size={22} className="cursor-pointer" />
        </div>
      </header>

      {/* 左側功能列 */}
      <div className="fixed top-1/3 left-6 h-[55vh] w-14 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col items-center py-4 space-y-6 overflow-hidden">
        <SideIcon icon={<img src={Home} alt="首頁" className="w-20 h-20"/>} label="首頁" active={activeTab === "all"|| activeTab === "region"} onClick={() => setActiveTab("all")} />
        <SideIcon icon={<img src={Anal} alt="分析" className="w-20 h-20"/>} label="分析" active={activeTab === "analysis"} onClick={() => setActiveTab("analysis")} />
        <SideIcon icon={<img src={List} alt="列表" className="w-20 h-20"/>} label="列表" active={activeTab === "potential"} onClick={() => setActiveTab("potential")} />
        <SideIcon icon={<img src={Message} alt="訊息" className="w-20 h-20"/>} label="訊息" active={activeTab === "message"} onClick={() => setActiveTab("message")} />
        <SideIcon icon={<img src={Setting} alt="設定" className="w-20 h-20"/>} label="設定" onClick={() => alert("設定功能開發中")} />
        <SideIcon icon={<img src={Logout} alt="登出" className="w-20 h-20"/>} label="登出" onClick={() => setUser(null)} />
      </div>

      {/* ======================== 主內容 ======================== */}
      <main className="pt-24 px-28 pb-20">
        {activeTab === "all" || activeTab === "region" ? (
          <RMAnalysisTab
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            dateRange={dateRange}
            handleDateChange={handleDateChange}
            openImage={openImage}
          />
        ) : activeTab === "analysis" ? (
          <AnalysisDashboard 
          dateRange={dateRange}
          handleDateChange={handleDateChange}
          />
        ) : activeTab === "potential" ? (
          <PotentialListDashboard
            dateRange={dateRange}
            handleDateChange={handleDateChange}
          />
        ) : (
          <MessageCenter
            mailBox={mailBox}
            setMailBox={setMailBox}
            filteredMessages={filteredMessages}
            selectedMessage={selectedMessage}
            setSelectedMessage={setSelectedMessage}
            toggleStar={toggleStar}
            handleDelete={handleDelete}
            showReplyBox={showReplyBox}
            setShowReplyBox={setShowReplyBox}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleReplySend={handleReplySend}
            dateRange={dateRange}
            handleDateChange={handleDateChange}
          />
        )}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            onClick={closeImage}
          >
            <div
              className="relative bg-white rounded-lg shadow-2xl p-2"
              onClick={(e) => e.stopPropagation()} // 防止點擊背景就關閉
            >
              {/* ❌ 關閉按鈕（右上角） */}
              <button
                onClick={closeImage}
                className="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-80 rounded-full p-1 transition"
              >
                ✕
              </button>

              {/* 圖片本體 */}
              <img
                src={previewImage}
                alt="預覽圖片"
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-md"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// ======================== 首頁分析（框架同步分行經理） ========================
const RMAnalysisTab = ({
  activeTab,
  setActiveTab,
  dateRange,
  handleDateChange,
  openImage
}: any) => (
  <>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-800">業績現況分析表</h2>
      <div className="flex flex-col items-end">
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateChange("start", e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          <span>至</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateChange("end", e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center border-b border-gray-100 relative px-6 space-x-10">
        <TabButton
          label="客戶"
          active={activeTab === "all"}
          onClick={() => setActiveTab("all")}
          width="w-28"
        />
      </div>

      <div className="p-8 min-h-[450px] text-gray-700 text-base">
        <div className="flex flex-col space-y-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            貢獻成效及執行進度分析
          </h2>
          {/* 第一列：四個主要 KPI */}
          <div className="grid grid-cols-4 gap-4 justify-items-center items-center mx-auto max-w-[1240px]">
            {[
              { src: "/rm_img/rm_1_1_1.png", alt: "預測貢獻度" },
              { src: "/rm_img/rm_1_1_2.png", alt: "原始貢獻度" },
              { src: "/rm_img/rm_1_1_3.png", alt: "開發潛力" },
              { src: "/rm_img/rm_1_1_4.png", alt: "已新增貢獻度" },
            ].map((img, idx) => (
              <img
                key={idx}
                src={img.src}
                alt={img.alt}
                className="w-[280px] h-auto object-contain cursor-pointer"
                onClick={() => openImage(img.src)}
              />
            ))}
          </div>

          {/* 第二列：新增貢獻度(月) + 分派狀態 */}
          <div className="grid grid-cols-2 gap-1 justify-items-center items-start mx-auto max-w-[1240px] mt-2">
            <img
              src="/rm_img/rm_1_2_1.png"
              alt="新增貢獻度（月）"
              className="w-[630px] h-auto object-contain cursor-pointer align-top"
              onClick={() => openImage("/rm_img/rm_1_2_1.png")}
            />
            <img
              src="/rm_img/rm_1_2_2.png"
              alt="分派狀態"
              className="w-[570px] h-auto object-contain cursor-pointer align-top"
              onClick={() => openImage("/rm_img/rm_1_2_2.png")}
            />
          </div>
        </div>
      </div>
    </div>
  </>
);

// ======================== 潛力名單分析（RM專屬圖片） ========================
const AnalysisDashboard = (
  {
  dateRange,
  handleDateChange,
  }: {
  dateRange: { start: string; end: string };
  handleDateChange: (type: "start" | "end", value: string) => void;
  }
) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-800">潛力名單分析</h2>

      {/* 日期區段（與業績分析一致） */}
      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => handleDateChange("start", e.target.value)}
          className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-1 focus:ring-orange-400"
        />
        <span>至</span>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => handleDateChange("end", e.target.value)}
          className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-1 focus:ring-orange-400"
        />
      </div>
    </div>
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
      <div className="grid grid-cols-2 justify-center">
        <div className="flex flex-col items-left space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            法人｜高貢獻度客戶特徵分析
          </h3>
          <div
            className="border rounded-xl shadow-sm bg-white p-6 flex items-center justify-center"
            style={{ width: "500px", height: "600px" }}
          >
            <img
              src="/images/corporate_analysis.png"
              alt="法人分析"
              className="max-h-[630px] object-contain rounded-lg"
            />
          </div>
        </div>

        <div className="flex flex-col items-left space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            自然人｜高貢獻度客戶特徵分析
          </h3>
          <div
            className="border rounded-xl shadow-sm bg-white p-6 flex items-center justify-center"
            style={{ width: "500px", height: "600px" }}
          >
            <img
              src="/images/individual_analysis.png"
              alt="自然人分析"
              className="max-h-[630px] object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ======================== 潛力名單情報站 ========================
const PotentialListDashboard: React.FC<{
  dateRange: { start: string; end: string };
  handleDateChange: (type: "start" | "end", value: string) => void;
}> = ({ dateRange, handleDateChange }) => {
  const { user } = useUser(); // ✅ 登入 RM 帳號
  const [currentPage, setCurrentPage] = useState(1);
  const [showMemo, setShowMemo] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rmData, setRmData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<{ [id: string]: string }>({});

  const itemsPerPage = 10;
  const progressOptions = ["未聯繫", "已聯繫", "已完成"];

  // ✅ 初始載入：只取負責RM = 登入帳號的資料
  useEffect(() => {
    if (user?.username) {
      const updates = JSON.parse(localStorage.getItem("potential_updates") || "[]");

      // 找出目前 RM 被指派的流水號清單
      const assignedIds = updates
        .filter((d: any) => d.assignedRM === user.username)
        .map((d: any) => String(d.id));

      // 根據指派結果過濾出屬於這位 RM 的客戶
      const filtered = potentialData.filter((item) =>
        assignedIds.includes(String(item["ID流水號"]))
      );

      setRmData(filtered);
    }

    const stored = localStorage.getItem("rmProgressData");
    if (stored) setProgressData(JSON.parse(stored));
  }, [user]);

  // ✅ 更新進度並同步儲存
const handleProgressChange = (流水號: string, newStatus: string) => {
  const updated = { ...progressData, [流水號]: newStatus };
  setProgressData(updated);
  localStorage.setItem("rmProgressData", JSON.stringify(updated));

  // ✅ 更新 potential_data.json 中的對應項目（模擬寫回）
  const updatedData = potentialData.map((item) =>
    String(item["ID流水號"]) === String(流水號)
      ? { ...item, 處理進度: newStatus }
      : item
  );
  localStorage.setItem("potential_data", JSON.stringify(updatedData));
};

  // ✅ 分頁
  const totalItems = rmData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = rmData.slice(startIdx, startIdx + itemsPerPage);

  // ✅ 開啟各 Modal
  const handleOpen = (type: string, item: any) => {
    setSelectedItem(item);
    if (type === "memo") setShowMemo(true);
    if (type === "info") setShowInfo(true);
    if (type === "suggestion") setShowSuggestion(true);
  };

  return (
    <div className="pt-4">
      {/* === 日期區（右上角） === */}
      <div className="flex justify-end mb-2">
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateChange("start", e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-1 focus:ring-orange-400"
          />
          <span>至</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateChange("end", e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-1 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* === 標題與搜尋 === */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">潛力名單情報站</h2>
      </div>

      {/* === 白底表格 === */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] text-center text-sm border-collapse">
            <thead className="bg-orange-50 border-b border-orange-200">
              <tr>
                {[
                  "編號",
                  "自然人/法人",
                  "客戶名稱",
                  "潛力貢獻度預測",
                  "處理建議",
                  "處理進度",
                  "負責RM",
                  "開發成效追蹤",
                  "基本資訊",
                  "MEMO",
                ].map((h) => (
                  <th key={h} className="py-3 font-semibold text-gray-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {currentData.map((item: any, index: number) => {
                const progress = progressData[item.ID流水號] || item.處理進度 || "未聯繫";

                return (
                  <tr key={item.ID流水號} className="border-b hover:bg-orange-50 transition">
                    <td className="py-4 font-medium text-gray-800">{item["ID流水號"]}</td>
                    <td>{item["自然人/法人"]}</td>
                    <td>{item["客戶名稱"]}</td>
                    <td>{item["潛力貢獻度預測"]}</td>

                    {/* ✅ 處理建議 */}
                    <td>
                      <div className="flex justify-between items-center w-[150px] mx-auto">
                        <span>{item["處理建議"]}</span>
                        <button
                          onClick={() => handleOpen("suggestion", item)}
                          className="bg-orange-500 text-white px-3 py-[5px] rounded hover:bg-orange-600 text-xs shadow-sm"
                        >
                          檢視
                        </button>
                      </div>
                    </td>

                    {/* ✅ 可修改進度 */}
                    <td>
                      <select
                        value={progress}
                        onChange={(e) =>
                          handleProgressChange(item.ID流水號, e.target.value)
                        }
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-orange-400"
                      >
                        {progressOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="text-blue-600 font-medium">{user?.username}</td>

                    {/* ✅ 開發成效追蹤 */}
                    <td>
                        <div className="flex justify-center items-center space-x-1">
                          <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  Math.max((parseFloat(item["開發成效追蹤"]) || 0) * 100, 0),
                                  100
                                ).toFixed(0)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {`${Math.min(
                              Math.max((parseFloat(item["開發成效追蹤"]) || 0) * 100, 0),
                              100
                            ).toFixed(1)}%`}
                          </span>
                        </div>
                    </td>

                    {/* ✅ 基本資訊 */}
                    <td>
                      <button
                        onClick={() => handleOpen("info", item)}
                        className="bg-orange-500 text-white px-3 py-[5px] rounded hover:bg-orange-600 text-xs shadow-sm"
                      >
                        檢視
                      </button>
                    </td>

                    {/* ✅ MEMO */}
                    <td>
                      <button
                        onClick={() => handleOpen("memo", item)}
                        className="bg-orange-500 text-white px-3 py-[5px] rounded hover:bg-orange-600 text-xs shadow-sm"
                      >
                        檢視
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ✅ 分頁控制 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-3 mt-6 border-t pt-4">
            <button
              className="px-3 py-1 border rounded-md text-sm hover:bg-orange-100 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              上一頁
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === i + 1
                    ? "bg-orange-500 text-white"
                    : "border border-gray-300 hover:bg-orange-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 border rounded-md text-sm hover:bg-orange-100 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              下一頁
            </button>
          </div>
        )}
      </div>

      {/* ✅ Modal 區 */}
      {showMemo && <MemoModal item={selectedItem} onClose={() => setShowMemo(false)} />}
      {showInfo && <InfoModal item={selectedItem} onClose={() => setShowInfo(false)} />}
      {showSuggestion && (
        <SuggestionModal item={selectedItem} onClose={() => setShowSuggestion(false)} />
      )}
    </div>
  );
};
// ======================== 各模態視窗 ========================
const ProgressLine: React.FC<{ status: string }> = ({ status }) => {
  const getColor = (s: string) =>
    s === "已完成" ? "bg-green-500" : s === "已聯繫" ? "bg-yellow-500" : "bg-gray-300";

  const current = status === "已完成" ? 3 : status === "已聯繫" ? 2 : 1;

  return (
    <div className="flex items-center justify-center space-x-2 w-[160px] mx-auto">
      {[1, 2, 3].map((i) => (
        <React.Fragment key={i}>
          <div
            className={`w-3 h-3 rounded-full ${
              i <= current ? getColor(status) : "bg-gray-200"
            }`}
          ></div>
          {i < 3 && (
            <div
              className={`flex-1 h-0.5 ${
                i < current ? getColor(status) : "bg-gray-200"
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ======================== 各模態視窗 ========================
const ModalWrapper: React.FC<{
  title: string;
  onClose: () => void;
  children: any;
}> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-[750px] max-h-[85vh] overflow-y-auto">
      <div className="bg-orange-50 px-6 py-3 flex justify-between items-center border-b">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <button onClick={onClose}>
          <X className="text-gray-600 hover:text-orange-500" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);



// ========================== MEMO Modal ==========================
const MemoModal = ({ item, onClose }: any) => (
  <ModalWrapper title={`MEMO｜${item?.客戶名稱 || ""}`} onClose={onClose}>
    <div className="space-y-4 text-sm text-gray-700">
      <p>{item?.備註 || "目前尚無 MEMO 記錄。"}</p>
    </div>
  </ModalWrapper>
);


// ========================== 基本資訊 Modal ==========================
const InfoModal = ({ item, onClose }: any) => {
  const leftFields = [
    "生日/成立日",
    "行業別/職稱",
    "年收入/營收",
    "最高學歷(自然人)",
    "任職公司名稱及職稱(自然人)",
    "法人企業評等/自然人等級",
    "高階管理人",
    "高階管理人員本行客戶(Y/N)",
    "實質受益人(法人)",
    "實質受益人本行客戶(Y/N)",
  ];

  const rightFields = [
    "往來分行",
    "目前業務往來類別",
    "年/月均存款",
    "外匯實績",
    "授信餘額",
    "網路銀行登錄次數",
    "去年整年度貢獻度",
    "今年累積貢獻度",
  ];

  const data = item?.基本資訊及現況 || {};
  const [showSubInfo, setShowSubInfo] = React.useState(false);

  // ✅ 同時支援「內層」或「外層」的法人高階管理人員資料
  const subInfo =
    data["法人高階管理人員本行客戶"] ||
    item?.法人高階管理人員本行客戶 ||
    null;

  // ✅ 判斷是否為本行客戶（去除空白）
  const isManagerBankClient =
    (data["高階管理人員本行客戶(Y/N)"] || "").trim().toUpperCase() === "Y";

  console.log("🟧 高階管理人員本行客戶(Y/N)：", data["高階管理人員本行客戶(Y/N)"]);
  console.log("🟧 是否顯示超連結：", isManagerBankClient && !!subInfo);
  console.log("🟧 subInfo 來源：", subInfo ? "✅ 有資料" : "❌ 無資料");

  return (
    <>
      <ModalWrapper title={`基本資訊與現況｜${item?.客戶名稱 || ""}`} onClose={onClose}>
        <div className="grid grid-cols-2 gap-6 text-sm text-gray-700">
          {/* 左側欄 */}
          <div className="space-y-2">
            {leftFields.map((field) => (
              <div key={field} className="flex justify-between">
                <span className="font-medium">{field}：</span>

                {/* ✅ 當高階管理人員為本行客戶且有資料時 → 顯示藍色連結 */}
                {field === "實質受益人(法人)" && isManagerBankClient && subInfo ? (
                  <button
                    onClick={() => setShowSubInfo(true)}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {data[field] || "—"}
                  </button>
                ) : (
                  <span>{data[field] || "—"}</span>
                )}
              </div>
            ))}
          </div>

          {/* 右側欄 */}
          <div className="space-y-2">
            {rightFields.map((field) => (
              <div key={field} className="flex justify-between">
                <span className="font-medium">{field}：</span>
                <span>{data[field] || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </ModalWrapper>

      {/* ✅ 第二層 Modal：法人高階管理人員本行客戶 */}
      {showSubInfo && subInfo && (
        <ModalWrapper
          title={`${data["實質受益人(法人)"] || ""} – 法人高階管理人員資料`}
          onClose={() => setShowSubInfo(false)}
        >
          <div className="grid grid-cols-2 gap-6 text-sm text-gray-700">
            {/* 左側欄 */}
            <div className="space-y-2">
              {[
                "生日/成立日",
                "行業別/職稱",
                "年收入/營收",
                "最高學歷(自然人)",
                "任職公司名稱(自然人)",
                "法人企業評等/自然人等級",
              ].map((f) => (
                <div key={f} className="flex justify-between">
                  <span className="font-medium">{f}：</span>
                  <span>{subInfo[f] || "—"}</span>
                </div>
              ))}
            </div>

            {/* 右側欄 */}
            <div className="space-y-2">
              {[
                "往來分行",
                "目前業務往來類別",
                "年/月均存款",
                "外匯實績",
                "授信額度",
                "網路銀行登錄次數",
                "去年整年度貢獻度",
                "今年累積貢獻度",
              ].map((f) => (
                <div key={f} className="flex justify-between">
                  <span className="font-medium">{f}：</span>
                  <span>{subInfo[f] || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </ModalWrapper>
      )}
    </>
  );
};


// ========================== 處理建議 Modal ==========================
const SuggestionModal = ({ item, onClose }: any) => {
  // 對應 shapplot/<流水號>.png
  const shapImagePath = `/shapplot/${item?.ID流水號}.png`;

  // 確認圖片是否存在（React無法直接同步檢查 public，使用onError兜底）
  const [imgError, setImgError] = React.useState(false);

  return (
    <ModalWrapper title={`處理建議｜${item?.客戶名稱 || ""}`} onClose={onClose}>
      <div className="flex flex-col items-center text-gray-700 text-sm space-y-3">
        <p className="text-lg font-bold text-gray-800">可解釋視覺化圖</p>

        {/* 預留 SHAP 圖展示區 */}
        {!imgError ? (
          <div className="w-full overflow-x-auto mt-4 flex justify-center">
            <img
              src={shapImagePath}
              alt="SHAP 分析圖"
              className="min-w-[500px] max-w-none h-auto rounded-md shadow-md border border-gray-200"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="w-[90%] h-[320px] bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border mt-4">
            尚無 SHAP 分析圖
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

// ======================== Message Center ========================
const MessageCenter = (props: any) => {
  const {
    mailBox,
    setMailBox,
    filteredMessages,
    selectedMessage,
    setSelectedMessage,
    toggleStar,
    handleDelete,
    showReplyBox,
    setShowReplyBox,
    replyContent,
    setReplyContent,
    handleReplySend,
    dateRange,
    handleDateChange,
  } = props;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">通知訊息</h2>

        {/* 日期區段 */}
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateChange("start", e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-1 focus:ring-orange-400"
          />
          <span>至</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateChange("end", e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-1 focus:ring-orange-400"
          />
        </div>
      </div>
      <div className="grid grid-cols-[360px_1fr] gap-6">
        {/* 左側清單 */}
        <div className="border-r pr-4 flex flex-col">
          <div className="flex space-x-4 mb-3 border-b pb-2">
            {["收件夾", "寄件備份", "垃圾桶"].map((tab) => (
              <button
                key={tab}
                onClick={() => setMailBox(tab)}
                className={`text-sm font-semibold ${
                  mailBox === tab
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-500 hover:text-orange-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="overflow-y-auto divide-y max-h-[600px]">
            {filteredMessages.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-10">
                無郵件內容
              </div>
            ) : (
              filteredMessages.map((msg: any) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    setShowReplyBox(false);
                  }}
                  className={`py-3 px-2 cursor-pointer ${
                    selectedMessage?.id === msg.id
                      ? "bg-orange-50 border-l-4 border-orange-400"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">
                        {msg.sender}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {msg.subject}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleStar(msg.id)}
                      className={`ml-2 ${
                        msg.starred
                          ? "text-orange-500"
                          : "text-gray-400 hover:text-orange-400"
                      }`}
                    >
                      <Star size={16} fill={msg.starred ? "#f97316" : "none"} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 右側內容 */}
        <div className="flex flex-col justify-between">
          {selectedMessage ? (
            <>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  {selectedMessage.sender}
                </h4>
                <h5 className="text-base font-semibold mb-3">
                  {selectedMessage.subject}
                </h5>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {selectedMessage.content}
                </p>
                  {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div className="mt-6 border-t pt-3">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">💬 回覆記錄：</h5>
                    {selectedMessage.replies.map((r: any, idx: number) => (
                      <div key={idx} className="mb-2 pl-2 border-l-2 border-orange-300">
                        <p className="text-xs text-gray-600">
                          <strong>{r.sender}</strong>（{r.senderRole}） {r.time}
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between text-sm text-gray-600">
                <button
                  onClick={() => setShowReplyBox(true)}
                  className="hover:text-orange-600"
                >
                  ↩ 回覆
                </button>
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="hover:text-red-600"
                >
                  🗑 刪除
                </button>
              </div>

              {showReplyBox && (
                <div className="mt-4 border-t pt-4">
                  <textarea
                    placeholder="輸入回覆內容..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={4}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-orange-400"
                  ></textarea>
                  <div className="flex justify-end mt-3 space-x-3">
                    <button
                      onClick={() => setShowReplyBox(false)}
                      className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleReplySend}
                      className="px-4 py-2 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600"
                    >
                      傳送
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-400 text-center py-40">
              請從左側選取一封郵件以查看內容
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ======================== 共用元件 ========================
const TabButton = ({ label, active, onClick, width }: any) => (
  <button
    onClick={onClick}
    className={`py-3 text-sm font-medium ${
      active
        ? "text-orange-600 border-b-2 border-orange-600"
        : "text-gray-500 hover:text-orange-500"
    } ${width}`}
  >
    {label}
  </button>
);

const SideIcon = ({ icon, label, onClick, active }: any) => (
  <button
    onClick={onClick}
    className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all group ${
      active
        ? "bg-orange-100 text-orange-600"
        : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
    }`}
  >
    {icon}
    <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
      {label}
    </span>
  </button>
);

export default RMDashboard;
