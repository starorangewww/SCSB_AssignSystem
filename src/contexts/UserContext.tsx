import React, { createContext, useContext, useState } from "react";

export type UserRole =
  | "admin"
  | "general_manager"
  | "area_manager"
  | "branch_manager"
  | "rm";

export interface User {
  username: string;
  role: UserRole;
  area?: string;
  branch?: string;
  loginTime: string;
}

// 郵件結構
export interface Message {
  id: number;
  sender: string;
  receiver: string;
  role: string;
  subject: string;
  preview: string;
  content: string;
  time: string;
  starred: boolean;
  box: string;
  replies: { sender: string; content: string; time: string }[];
}

interface UserContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  globalMails: Message[];
  setGlobalMails: (m: Message[]) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [globalMails, setGlobalMails] = useState<Message[]>([]);

  return (
    <UserContext.Provider value={{ user, setUser, globalMails, setGlobalMails }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser 必須在 <UserProvider> 內使用");
  return ctx;
};
