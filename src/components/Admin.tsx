import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 加入導向功能
import { useAccounts } from "../contexts/AccountContext";
import { UserCircle, Plus, Edit, Trash2, Eye, EyeOff, Save, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import SCSB from "../AI_icon/logo_scsb.svg";
import Logout from "../AI_icon/icon_log-out.svg"; // ✅ 登出 icon

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate(); // ✅ react-router 導向 hook
  const { accounts, addAccount, removeAccount, updateAccount, areaOptions, branchOptions } =
    useAccounts();

  const [newAccount, setNewAccount] = useState<{
    username: string;
    password: string;
    role: "admin" | "general_manager" | "area_manager" | "branch_manager" | "rm";
    area: string;
    branch: string;
  }>({
    username: "",
    password: "",
    role: "rm",
    area: "",
    branch: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [showPasswordId, setShowPasswordId] = useState<string | null>(null);

  // === 新增帳號 ===
  const handleAddAccount = () => {
    if (!newAccount.username.trim() || !newAccount.password.trim()) {
      alert("請輸入使用者名稱與密碼！");
      return;
    }

    if (newAccount.role === "area_manager" && !newAccount.area) {
      alert("請選擇區域！");
      return;
    }
    if (
      (newAccount.role === "branch_manager" || newAccount.role === "rm") &&
      !newAccount.branch
    ) {
      alert("請選擇分行！");
      return;
    }

    const acc = {
      id: uuidv4(),
      username: newAccount.username.trim(),
      password: newAccount.password.trim(),
      role: newAccount.role,
      area: newAccount.role === "area_manager" ? newAccount.area : "-",
      branch:
        newAccount.role === "branch_manager" || newAccount.role === "rm"
          ? newAccount.branch
          : "-",
    };

    addAccount(acc);
    alert(`✅ 已新增帳號：${newAccount.username}`);
    setNewAccount({ username: "", password: "", role: "rm", area: "", branch: "" });
  };

  // === 編輯帳號 ===
  const handleEdit = (acc: any) => {
    setEditingId(acc.id);
    setEditingData({ ...acc });
  };

  const handleSaveEdit = () => {
    if (!editingData.username.trim() || !editingData.password.trim()) {
      alert("請輸入完整資料！");
      return;
    }
    updateAccount(editingData.id, editingData);
    setEditingId(null);
    setEditingData(null);
    alert("✅ 修改已儲存！");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
  };

  // === 登出 ===
  const handleLogout = () => {
    if (window.confirm("確定要登出嗎？")) {
      // ✅ 清除登入狀態
      localStorage.removeItem("currentUser");
      sessionStorage.clear();

      // ✅ 阻止返回（清除歷史記錄）
      navigate("/", { replace: true });

      // ✅ 再加一道防護：強制刷新，確保返回無效
      window.location.replace("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* ====== 頂部橘條 ====== */}
      <header className="bg-gradient-to-r from-[#D23F06] to-[#E45E06] text-white py-3 px-8 flex justify-between items-center shadow-md">
        {/* 左側 Logo */}
        <h1 className="text-lg font-semibold tracking-wide">
          <img src={SCSB} alt="上海商業儲蓄銀行" className="h-10 w-auto object-contain" />
        </h1>

        {/* 右側使用者資訊 + 登出 */}
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-2">
            <UserCircle size={24} />
            <span className="text-sm">您好，admin</span>
          </div>

          {/* 登出按鈕 */}
          <button
            onClick={handleLogout}
            className="flex items-center bg-white text-[#D23F06] px-3 py-1.5 rounded-md shadow hover:bg-gray-100 transition"
          >
            <img src={Logout} alt="登出" className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">登出</span>
          </button>
        </div>
      </header>

      {/* ====== 主內容 ====== */}
      <main className="p-10">
        <h2 className="text-xl font-bold text-center text-orange-600 mb-6">帳號管理平台</h2>

        {/* === 新增帳號區 === */}
        <div className="flex flex-wrap items-center justify-center space-x-3 mb-6">
          <input
            type="text"
            placeholder="使用者名稱"
            value={newAccount.username}
            onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-1 focus:ring-orange-400"
          />
          <input
            type="password"
            placeholder="密碼"
            value={newAccount.password}
            onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-1 focus:ring-orange-400"
          />

          <select
            value={newAccount.role}
            onChange={(e) =>
              setNewAccount({
                ...newAccount,
                role: e.target.value as
                  | "admin"
                  | "general_manager"
                  | "area_manager"
                  | "branch_manager"
                  | "rm",
              })
            }
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-1 focus:ring-orange-400"
          >
            <option value="admin">Admin</option>
            <option value="general_manager">總經理</option>
            <option value="area_manager">區協理</option>
            <option value="branch_manager">分行經理</option>
            <option value="rm">理專(RM)</option>
          </select>

          {newAccount.role === "area_manager" && (
            <select
              value={newAccount.area}
              onChange={(e) => setNewAccount({ ...newAccount, area: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-1 focus:ring-orange-400"
            >
              <option value="">選擇區域</option>
              {areaOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}

          {(newAccount.role === "branch_manager" || newAccount.role === "rm") && (
            <select
              value={newAccount.branch}
              onChange={(e) => setNewAccount({ ...newAccount, branch: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-1 focus:ring-orange-400 max-w-[220px]"
            >
              <option value="">選擇分行</option>
              {branchOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleAddAccount}
            className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm"
          >
            <Plus size={16} />
            <span>新增</span>
          </button>
        </div>

        {/* === 帳號表格 === */}
        <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-200">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-orange-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">使用者名稱</th>
                <th className="px-6 py-3 text-left font-semibold">角色</th>
                <th className="px-6 py-3 text-left font-semibold">密碼</th>
                <th className="px-6 py-3 text-left font-semibold">區域</th>
                <th className="px-6 py-3 text-left font-semibold">分行</th>
                <th className="px-6 py-3 text-left font-semibold text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id} className="border-b last:border-none hover:bg-gray-50 transition">
                  {/* 編輯模式 */}
                  {editingId === acc.id ? (
                    <>
                      <td className="px-6 py-3">
                        <input
                          value={editingData.username}
                          onChange={(e) =>
                            setEditingData({ ...editingData, username: e.target.value })
                          }
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm w-32"
                        />
                      </td>
                      <td className="px-6 py-3">{translateRole(editingData.role)}</td>
                      <td className="px-6 py-3 flex items-center space-x-2">
                        <input
                          type={showPasswordId === acc.id ? "text" : "password"}
                          value={editingData.password}
                          onChange={(e) =>
                            setEditingData({ ...editingData, password: e.target.value })
                          }
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm w-32"
                        />
                        <button
                          onClick={() =>
                            setShowPasswordId(
                              showPasswordId === acc.id ? null : acc.id
                            )
                          }
                          className="text-gray-500 hover:text-orange-500"
                        >
                          {showPasswordId === acc.id ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-3">{editingData.area || "-"}</td>
                      <td className="px-6 py-3">{editingData.branch || "-"}</td>
                      <td className="px-6 py-3 text-center space-x-3">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-3">{acc.username}</td>
                      <td className="px-6 py-3">{translateRole(acc.role)}</td>
                      <td className="px-6 py-3 flex items-center space-x-2">
                        <span>
                          {showPasswordId === acc.id ? acc.password : "••••••"}
                        </span>
                        <button
                          onClick={() =>
                            setShowPasswordId(
                              showPasswordId === acc.id ? null : acc.id
                            )
                          }
                          className="text-gray-500 hover:text-orange-500"
                        >
                          {showPasswordId === acc.id ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-3">{acc.area || "-"}</td>
                      <td className="px-6 py-3">{acc.branch || "-"}</td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleEdit(acc)}
                          className="text-blue-500 hover:text-blue-700 mr-3"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(`確定要刪除帳號「${acc.username}」嗎？`)
                            )
                              removeAccount(acc.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

const translateRole = (r: string) => {
  switch (r) {
    case "admin":
      return "管理員";
    case "general_manager":
      return "總經理";
    case "area_manager":
      return "區協理";
    case "branch_manager":
      return "分行經理";
    case "rm":
      return "理財專員";
    default:
      return r;
  }
};

export default AdminDashboard;
