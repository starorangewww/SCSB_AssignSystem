import React, { useState, FormEvent, MouseEvent} from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAccounts } from "../contexts/AccountContext";
import { useUser } from "../contexts/UserContext"; // 你的 user context
import { useNavigate } from "react-router-dom";  // ✅ 加這行
import SCSB from "../AI_icon/logo_scsb.svg";
// 定義使用者類型
type UserType = 'user' | 'admin';

// 定義目前使用者介面
interface CurrentUser {
  username: string;
  type: UserType;
  loginTime: string;
}

// ======================= 登入頁面元件 =======================
const LoginPage: React.FC<{
  userType: UserType;
  setUserType: (type: UserType) => void;
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  handleLogin: (e: FormEvent<HTMLFormElement>) => void;
  handleForgotPassword: () => void;
  handleContactAdmin: () => void;
}> = ({
  userType,
  setUserType,
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleLogin,
  handleForgotPassword,
  handleContactAdmin,
}) => (
  <div className="min-h-screen relative">
    {/* 上半部漸層背景 */}
    <div
      className="absolute top-0 left-0 right-0 h-1/2"
      style={{
        background:
          'linear-gradient(90deg, #D23F06 0%, #FF7012 77%, #FFAC12 100%)',
      }}
    >
      <div className="p-6">
        <h1 className="text-lg font-semibold tracking-wide">
        <img
          src={SCSB}
          alt="上海商業儲蓄銀行"
          className="h-10 w-auto object-contain"
        />
      </h1>
      </div>
    </div>

    {/* 下半部白色背景 */}
    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white"></div>

    {/* 登入框框 */}
    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-6 z-10">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* 標題 */}
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          AI慧選潛客
        </h2>

        {/* 使用者類型選擇 */}
        <div className="mb-8">
          <div className="flex justify-center space-x-12">
            <button
              onClick={() => setUserType('user')}
              className={`pb-2 text-lg font-semibold transition-colors ${
                userType === 'user'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-orange-400'
              }`}
            >
              使用者
            </button>
            <button
              onClick={() => setUserType('admin')}
              className={`pb-2 text-lg font-semibold transition-colors ${
                userType === 'admin'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-orange-400'
              }`}
            >
              管理員
            </button>
          </div>
        </div>

        {/* 登入表單 */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* 帳號輸入 */}
          <div>
            <label className="block text-xl text-left font-medium text-gray-700 mb-2">
              帳號
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="請輸入帳號"
              required
            />
          </div>

          {/* 密碼輸入 */}
          <div>
            <label className="block text-xl text-left font-medium text-gray-700 mb-2">
              密碼
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="請輸入密碼"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
              >
                忘記密碼
              </button>
            </div>
          </div>

          {/* 按鈕區域 */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleContactAdmin}
              className="flex-1 py-3 text-center transition-all flex items-center justify-center gap-2"
              style={{ color: '#D23F06' }}
              onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.color = '#FF7012';
              }}
              onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.color = '#D23F06';
              }}
            >
              聯絡管理員
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              登入
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

// ======================= 主平台元件 =======================
const LoginPlatform: React.FC = () => {
  const [userType, setUserType] = useState<UserType>('user');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const { accounts } = useAccounts();
  const { setUser } = useUser();
  const navigate = useNavigate(); 

  const handleLogin = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!username || !password) {
      alert("請輸入帳號與密碼");
      return;
    }

    const matched = accounts.find((a) => a.username === username);
    if (!matched) {
      alert("帳號不存在");
      return;
    }

    if (matched.password !== password) {
      alert("密碼錯誤");
      return;
    }

    // === 驗證 userType 與角色對應 ===
    const adminRoles = ["admin"];
    const userRoles = ["general_manager", "area_manager", "branch_manager", "rm"];

    if (
      (userType === "admin" && !adminRoles.includes(matched.role)) ||
      (userType === "user" && !userRoles.includes(matched.role))
    ) {
      alert(`⚠️ 您的帳號類型為「${translateRole(matched.role)}」，不可從「${userType === 'admin' ? '管理員' : '使用者'}」入口登入。`);
      return;
    }

    // === 通過驗證 ===
    const now = new Date().toLocaleString("zh-TW");
    setUser({
      username: matched.username,
      role: matched.role,
      area: matched.area || "",
      branch: matched.branch || "",
      loginTime: now,
    });

    setCurrentUser({
      username: matched.username,
      type: userType,
      loginTime: now,
    });

    setIsLoggedIn(true);

    // ✅ 登入後依角色導向對應頁面
    switch (matched.role) {
      case "admin":
        navigate("/Admin_Dashboard");
        break;

      case "general_manager":
        navigate("/General_Manager");
        break;

      case "area_manager":
        navigate(`/Area_Manager/${matched.area}`);
        break;

      case "branch_manager":
        navigate(`/Branch_Manager/${matched.branch}`);
        break;

      case "rm":
        navigate(`/RM/${matched.branch}`);
        break;

      default:
        alert("無法辨識的角色類型");
        break;
    }
  };

  // 登出
  const handleLogout = (): void => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setUserType('user');
  };

  const handleContactAdmin = (): void => {
    alert('聯絡管理員功能將在此處實現');
  };

  const handleForgotPassword = (): void => {
    alert('忘記密碼功能將在此處實現');
  };

  const MainPage: React.FC = () => (
    <div className="min-h-screen bg-gray-50">
      <nav
        className="shadow-lg"
        style={{
          background:
            'linear-gradient(90deg, #D23F06 0%, #FF7012 77%, #FFAC12 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-white text-xl font-bold">上海商業儲蓄銀行</h1>
            <span className="ml-4 text-xl text-white opacity-90">
              AI慧選潛客系統
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-white">
              <span className="opacity-90">歡迎，</span>
              <span className="font-semibold">{currentUser?.username}</span>
              <span className="ml-2 px-2 py-1 bg-white/20 rounded text-sm">
                {currentUser?.type === 'admin' ? '管理員' : '使用者'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-orange-500 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <LogIn size={16} className="rotate-180" />
              登出
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-600">
        <h2 className="text-3xl font-bold mb-4">
          歡迎進入 {currentUser?.type === 'admin' ? '管理員控制台' : '使用者儀表板'}
        </h2>
        <p>登入時間：{currentUser?.loginTime}</p>
      </div>
    </div>
  );

  return isLoggedIn ? (
    <MainPage />
  ) : (
    <LoginPage
      userType={userType}
      setUserType={setUserType}
      username={username}
      setUsername={setUsername}
      password={password}
      setPassword={setPassword}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      handleLogin={handleLogin}
      handleForgotPassword={handleForgotPassword}
      handleContactAdmin={handleContactAdmin}
    />
  );
};

// 翻譯角色
const translateRole = (role: string) => {
  switch (role) {
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
      return "未知角色";
  }
};

export default LoginPlatform;
