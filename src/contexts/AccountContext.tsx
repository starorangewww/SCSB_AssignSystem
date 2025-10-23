import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ===== 角色定義 =====
export type AccountRole =
  | "admin"
  | "general_manager"
  | "area_manager"
  | "branch_manager"
  | "rm";

// ===== 帳號結構 =====
export interface Account {
  id: string;
  username: string;
  password: string;
  role: AccountRole;
  area?: string;   // 區域
  branch?: string; // 分行
}

// ===== Context 型別 =====
interface AccountsContextType {
  accounts: Account[];
  setAccounts: (a: Account[]) => void;
  addAccount: (acc: Account) => void;
  updateAccount: (id: string, updated: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  areaOptions: string[];
  branchOptions: string[];
}

// ===== LocalStorage Key =====
const STORAGE_KEY = "myapp_accounts_v2";

// ===== 預設帳號 =====
const defaultAccounts: Account[] = [
  { id: "admin-001", username: "admin", password: "68128", role: "admin" },
  { id: "gm-001", username: "gm", password: "gm123", role: "general_manager" },
  {
    id: "areagm-001",
    username: "Areagm",
    password: "area123",
    role: "area_manager",
    area: "北一區",
  }
];

// ===== 區協理選項 =====
const AREA_OPTIONS = [
  "北一區",
  "北二區",
  "新北區",
  "桃竹區",
  "中區",
  "南區",
  "國營二部",
];

// ===== 分行選項 =====
const BRANCH_OPTIONS = [
  "北中和分行",
  "永和分行",
  "中和分行",
  "華江分行",
  "土城分行",
  "二重分行",
  "北三重分行",
  "蘆洲分行",
  "龍山分行",
  "城中分行",
  "仁愛分行",
  "基隆分行",
  "東台北分行",
  "儲蓄部分行",
  "民生分行",
  "南京東路分行",
  "承德分行",
  "中山分行",
  "松江分行",
  "營業部",
  "國外部",
  "內湖科技園區分行",
  "西湖分行",
  "樹林分行",
  "汐止分行",
  "信義分行",
  "松南分行",
  "敦北分行",
  "忠孝分行",
  "三民分行",
  "世貿分行",
  "永吉分行",
  "松山分行",
  "南港分行",
  "內湖分行",
  "士林分行",
  "天母分行",
  "丹鳳分行",
  "板橋分行",
  "三重分行",
  "文山分行",
  "新店分行",
  "林口分行",
  "北新莊分行",
  "新莊分行",
  "南崁分行",
  "觀音分行",
  "桃園分行",
  "北桃園分行",
  "延平分行",
  "中壢分行",
  "楊梅分行",
  "新竹分行",
  "竹科分行",
  "北新竹分行",
  "竹北分行",
  "宜蘭分行",
  "苗栗分行",
  "台中分行",
  "市政分行",
  "南屯分行",
  "中港分行",
  "大里分行",
  "豐原分行",
  "員林分行",
  "東台南分行",
  "南科分行",
  "台南分行",
  "永康分行",
  "高雄分行",
  "前金分行",
  "東高雄分行",
  "鳳山分行",
  "北高雄分行",
  "屏東分行",
];

// ===== Context 建立 =====
const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export const AccountsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Account[];
    } catch {}
    return defaultAccounts;
  });

  // 同步儲存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    } catch {}
  }, [accounts]);

  // CRUD
  const addAccount = (acc: Account) => setAccounts((s) => [...s, acc]);
  const updateAccount = (id: string, updated: Partial<Account>) =>
    setAccounts((s) => s.map((a) => (a.id === id ? { ...a, ...updated } : a)));
  const removeAccount = (id: string) =>
    setAccounts((s) => s.filter((a) => a.id !== id));

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        setAccounts,
        addAccount,
        updateAccount,
        removeAccount,
        areaOptions: AREA_OPTIONS,
        branchOptions: BRANCH_OPTIONS,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccounts = (): AccountsContextType => {
  const ctx = useContext(AccountsContext);
  if (!ctx) throw new Error("useAccounts 必須在 AccountsProvider 內使用");
  return ctx;
};
