import React, { useState,useEffect  } from "react";
import { useUser } from "../contexts/UserContext";
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
} from "lucide-react";
import { initSharedMessages } from "../Utils/initSharedMessages";
//icon
import Home from "../AI_icon/icon_home.svg";
import Anal from "../AI_icon/icon_analyze.svg";
import Message from "../AI_icon/icon_message.svg";
import Setting from "../AI_icon/icon_settings.svg";
import Logout from "../AI_icon/icon_log-out.svg";
import SCSB from "../AI_icon/logo_scsb.svg";

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

const regionImage = "/images/region1.png";

const AreaManagerDashboard: React.FC = () => {
  const { user, setUser } = useUser();
  const [hasNotification, setHasNotification] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: "2025-01-01",
    end: "2025-09-28",
  });

  const handleDateChange = (type: "start" | "end", value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const [activeTab, setActiveTab] = useState<"all" | "region" | "analysis" | "message">("all");
    // ====== 圖片預覽用 state ======
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const openImage = (src: string) => setPreviewImage(src);
    const closeImage = () => setPreviewImage(null);

  // ---------------- 郵件邏輯 ----------------
  const [mailBox, setMailBox] = useState("收件夾");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("最新");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  // ✅ 監聽 localStorage 同步
  useEffect(() => {
    initSharedMessages();

    const loadMessages = () => {
      const stored = localStorage.getItem("sharedMessages");
      if (stored) {
        const allMessages = JSON.parse(stored);

        // ✅ 根據使用者角色過濾（共用邏輯）
        const related = allMessages.filter(
          (msg: any) =>
            msg.senderRole === user?.role ||
            msg.recipientRole === user?.role ||
            msg.ownerRole === user?.role
        );

        setMessages(related);
      }
    };

    loadMessages();
    window.addEventListener("storage", loadMessages);
    return () => window.removeEventListener("storage", loadMessages);
  }, [user]);

  // ---------------- 篩選與操作邏輯 ----------------
  const filteredMessages = messages
    .filter((msg) => msg.box === mailBox)
    .filter(
      (msg) =>
        msg.subject.includes(searchTerm) ||
        msg.sender.includes(searchTerm) ||
        msg.preview.includes(searchTerm)
    );

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

  // ---------------- 回覆邏輯 ----------------
  const handleReplySend = () => {
  if (!replyContent.trim()) return alert("請輸入回覆內容！");

  const currentUser = user?.username || "北一區協理";

  const stored = localStorage.getItem("sharedMessages");
  const allMessages = stored ? JSON.parse(stored) : [];

  const updated = allMessages.map((msg: any) =>
    msg.id === selectedMessage.id
      ? {
          ...msg,
          replies: [
            ...(msg.replies || []),
            {
              sender: currentUser,
              senderRole: "area_manager", // ✅ 修正錯誤角色
              content: replyContent,
              time: new Date().toLocaleTimeString("zh-TW", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ],
        }
      : msg
  );

  localStorage.setItem("sharedMessages", JSON.stringify(updated));
  setReplyContent("");
  setShowReplyBox(false);
  window.dispatchEvent(new Event("storage")); // ✅ 確保其他頁即時更新
  alert("✅ 回覆已寄出！（總經理或分行經理將會看到這封回覆）");
};

const handleSendToBranchManager = () => {
  const newMessage = {
    id: Date.now(),
    sender: user?.username || "北一區協理辦公室",
    senderRole: "區協理",
    recipientRole: "分行經理",
    ownerRole: "區協理", // ✅ 加入歸屬角色
    subject: "最新行銷指示",
    preview: "請各分行依照最新方案調整行銷推廣進度。",
    content: "請於下週三前提交各分行的推廣進度與成果報告。",
    time: new Date().toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    starred: true,
    box: "寄件備份", // ✅ 改為寄件備份
    replies: [],
  };

  const stored = localStorage.getItem("sharedMessages");
  const allMessages = stored ? JSON.parse(stored) : [];
  allMessages.push(newMessage);
  localStorage.setItem("sharedMessages", JSON.stringify(allMessages));
  window.dispatchEvent(new Event("storage"));
  alert("✅ 郵件已寄出！分行經理將收到新信件。");
};

  return (
    <div className="relative min-h-screen bg-[#f8f8f8] text-gray-800">
      {/* ======================== 上方橘色導覽列 ======================== */}
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
              {user?.username || "北一區協理"}
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
          <button className="hover:text-yellow-200">
            <MoreVertical size={22} />
          </button>
        </div>
      </header>

      {/* ======================== 左側浮動工具欄 ======================== */}
      <div className="fixed top-1/3 left-6 h-[45vh] w-14 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col items-center py-4 space-y-6 overflow-hidden">
        <SideIcon icon={<img src={Home} alt="首頁" className="w-20 h-20"/>} label="首頁" active={activeTab === "all"|| activeTab === "region"} onClick={() => setActiveTab("all")} />
        <SideIcon icon={<img src={Anal} alt="分析" className="w-20 h-20"/>} label="分析" active={activeTab === "analysis"} onClick={() => setActiveTab("analysis")} />
        <SideIcon icon={<img src={Message} alt="訊息" className="w-20 h-20"/>} label="訊息" active={activeTab === "message"} onClick={() => setActiveTab("message")} />
        <SideIcon icon={<img src={Setting} alt="設定" className="w-20 h-20"/>} label="設定" onClick={() => alert("設定功能開發中")} />
        <SideIcon icon={<img src={Logout} alt="登出" className="w-20 h-20"/>} label="登出" onClick={() => setUser(null)} />
      </div>

      {/* ======================== 主內容 ======================== */}
      <main className="pt-24 px-28 pb-20">
        {/* ======= 分頁1：業績現況分析表 ======= */}
        {activeTab === "all" || activeTab === "region" ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                業績現況分析表
              </h2>
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
                  label="區域"
                  active={activeTab === "all"}
                  onClick={() => setActiveTab("all")}
                  width="w-28"
                />
                <TabButton
                  label="分行"
                  active={activeTab === "region"}
                  onClick={() => setActiveTab("region")}
                  width="w-28"
                />
              </div>

              <div className="p-8 min-h-[450px] text-gray-700 text-base">
                {activeTab === "all" ? (
                  <div className="flex flex-col space-y-10">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                      貢獻成效及執行進度分析
                    </h2>
                    {/* 第一列：四個主要 KPI */}
                    <div className="grid grid-cols-4 gap-4 justify-items-center items-center mx-auto max-w-[1240px]">
                      {[
                        { src: "/agm_img/agm_1_1_1.png", alt: "預測貢獻度" },
                        { src: "/agm_img/agm_1_1_2.png", alt: "原始貢獻度" },
                        { src: "/agm_img/agm_1_1_3.png", alt: "開發潛力" },
                        { src: "/agm_img/agm_1_1_4.png", alt: "已新增貢獻度" },
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
                    <div className="grid grid-cols-2 gap-6 justify-items-center items-start mx-auto max-w-[1240px] mt-2">
                      <img
                        src="/agm_img/agm_1_2_1.png"
                        alt="新增貢獻度（月）"
                        className="w-[630px] h-auto object-contain cursor-pointer align-top"
                        onClick={() => openImage("/agm_img/agm_1_2_1.png")}
                      />
                      <img
                        src="/agm_img/agm_1_2_2.png"
                        alt="分派狀態"
                        className="w-[570px] h-auto object-contain cursor-pointer align-top"
                        onClick={() => openImage("/agm_img/agm_1_2_2.png")}
                      />
                    </div>
                  </div>
                ) : (
                    <div className="flex flex-col space-y-10">
                      {/* 第一列：貢獻度成效分析 */}
                      <section className="flex flex-col items-center">
                        <div className="w-full max-w-[1100px]">
                          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-left pl-2">
                            貢獻度成效分析
                          </h2>
                          <div className="grid grid-cols-3 gap-8 justify-items-center items-start">
                            {[
                              { src: "/agm_img/agm_2_1_1.png", alt: "開發潛力" },
                              { src: "/agm_img/agm_2_1_2.png", alt: "貢獻度達成率" },
                              { src: "/agm_img/agm_2_1_3.png", alt: "新增貢獻度" },
                            ].map((img, idx) => (
                              <img
                                key={idx}
                                src={img.src}
                                alt={img.alt}
                                className="w-[330px] h-auto object-contain cursor-pointer"
                                onClick={() => openImage(img.src)}
                              />
                            ))}
                          </div>
                        </div>
                      </section>

                      {/* 第二列：執行進度分析 */}
                      <section className="flex flex-col items-center">
                        <div className="w-full max-w-[1100px]">
                          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-left pl-2">
                            執行進度分析
                          </h2>
                          <div className="grid grid-cols-3 gap-8 justify-items-center items-start">
                            {[
                              { src: "/agm_img/agm_2_2_1.png", alt: "名單處理建議" },
                              { src: "/agm_img/agm_2_2_2.png", alt: "客戶分配率" },
                              { src: "/agm_img/agm_2_2_3.png", alt: "處理進度" },
                            ].map((img, idx) => (
                              <img
                                key={idx}
                                src={img.src}
                                alt={img.alt}
                                className="w-[330px] h-auto object-contain cursor-pointer"
                                onClick={() => openImage(img.src)}
                              />
                            ))}
                          </div>
                        </div>
                      </section>
                    </div>
                )}
              </div>
            </div>
          </>
        ) : activeTab === "analysis" ? (
          /* ======= 分頁2：潛力名單分析 ======= */
        <div>
          {/* 標題與日期同行 */}
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
        ) : (
          /* ======= 分頁3：通知訊息 ======= */
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

/* ===== 通知訊息元件 ===== */
const MessageCenter = ({
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
}: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
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

    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 min-h-[500px]">
      <div className="grid grid-cols-[360px_1fr] gap-6">
        {/* 左側信件清單 */}
        <div className="flex flex-col border-r border-gray-200 pr-4">
          <div className="flex space-x-6 mb-4 border-b border-gray-200 pb-2">
            {["收件夾", "寄件備份", "垃圾桶"].map((tab) => (
              <button
                key={tab}
                onClick={() => setMailBox(tab)}
                className={`text-sm font-semibold pb-2 ${
                  mailBox === tab
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-500 hover:text-orange-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col divide-y divide-gray-100 overflow-y-auto max-h-[600px]">
            {filteredMessages.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-10">
                無郵件內容
              </div>
            ) : (
              filteredMessages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`py-3 px-2 flex justify-between items-center cursor-pointer transition ${
                    selectedMessage?.id === msg.id
                      ? "bg-orange-50 border-l-4 border-orange-400"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    onClick={() => {
                      setSelectedMessage(msg);
                      setShowReplyBox(false);
                    }}
                    className="flex-1"
                  >
                    <h4 className="text-sm font-semibold text-gray-800">
                      {msg.sender}
                    </h4>
                    <h5 className="text-sm font-semibold text-gray-700 mt-1">
                      {msg.subject}
                    </h5>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {msg.preview}
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
              ))
            )}
          </div>
        </div>

        {/* 右側信件內容 */}
        <div className="flex flex-col justify-between">
          {selectedMessage ? (
            <>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1">
                  {selectedMessage.sender}
                </h4>
                <h5 className="text-base font-semibold text-gray-800 mb-3">
                  {selectedMessage.subject}
                </h5>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedMessage.content}
                </p>

                {selectedMessage.replies?.length > 0 && (
                  <div className="mt-6 border-t border-gray-200 pt-3">
                    <h6 className="text-sm font-semibold text-gray-700 mb-2">
                      回覆紀錄：
                    </h6>
                    {selectedMessage.replies.map((r: any, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold text-orange-600">
                          {r.sender}：
                        </span>{" "}
                        {r.content}{" "}
                        <span className="text-xs text-gray-400 ml-2">
                          {r.time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-6 border-t pt-3 text-sm text-gray-600">
                <div className="flex space-x-6">
                  <button
                    onClick={() => setShowReplyBox(true)}
                    className="hover:text-orange-600 transition"
                  >
                    ↩ 回覆
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="hover:text-red-600 transition"
                >
                  🗑 刪除
                </button>
              </div>

              {showReplyBox && (
                <div className="mt-4 border-t pt-4">
                  <div className="text-sm text-gray-600 mb-2 text-left">
                    To: {selectedMessage.sender}
                  </div>
                  <textarea
                    placeholder="輸入回覆內容..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                  ></textarea>
                  <div className="flex justify-end mt-3 space-x-3">
                    <button
                      onClick={() => setShowReplyBox(false)}
                      className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleReplySend}
                      className="px-4 py-2 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600 transition"
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
  </div>
);

/* ===== 左側按鈕元件 ===== */
interface SideIconProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}
const SideIcon: React.FC<SideIconProps> = ({ icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all group
      ${
        active
          ? "bg-orange-100 text-orange-600"
          : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
      }`}
  >
    {icon}
    <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {label}
    </span>
  </button>
);

/* ===== 分頁按鈕 ===== */
interface TabButtonProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  width?: string;
}
const TabButton: React.FC<TabButtonProps> = ({
  label,
  active,
  onClick,
  width,
}) => (
  <button
    onClick={onClick}
    className={`text-sm font-semibold py-3 border-b-2 transition-colors ${
      width || "w-24"
    } ${
      active
        ? "border-orange-600 text-orange-600"
        : "border-transparent text-gray-500 hover:text-orange-500"
    }`}
  >
    {label}
  </button>
);

export default AreaManagerDashboard;
