import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { UserModel } from "@/shared/domain/entities/user-model";
import { AuthHelper } from "@/features/auth/domain/utils/auth-helper";

interface UserContextType {
  user: UserModel | null;
  updateUser: (user: UserModel | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from StorageManager on mount
    const loadUserFromStorage = () => {
      try {
        const storedUser = AuthHelper.getUserData();
        setUser(storedUser);
      } catch (error) {
        console.error("Failed to load user from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const updateUser = (newUser: UserModel | null) => {
    setUser(newUser);
    if (newUser) {
      AuthHelper.setUserData({ userData: newUser });
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
