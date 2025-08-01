import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, dbHelpers } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용해야 합니다.');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsChildInfo, setNeedsChildInfo] = useState(false);

  useEffect(() => {
    // 초기 세션 확인
    checkUser();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      console.log('useAuth: Checking user session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('useAuth: Session:', session);
      
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      console.log('useAuth: Setting loading to false');
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      console.log('useAuth: Loading user profile for:', userId);
      const profile = await dbHelpers.getUserProfile(userId);
      console.log('useAuth: Profile loaded:', profile);
      
      if (!profile) {
        // 프로필이 없으면 생성
        const newProfile = await dbHelpers.upsertUserProfile(userId, {
          home_lat: null,
          home_lng: null,
          home_address: null
        });
        setUserProfile(newProfile);
        setNeedsChildInfo(true);
      } else {
        setUserProfile(profile);
        // 자녀 정보가 없으면 입력 필요
        if (!profile.user_children || profile.user_children.length === 0) {
          console.log('No children info, showing child info modal');
          setNeedsChildInfo(true);
        } else {
          console.log('Children found:', profile.user_children.length);
          setNeedsChildInfo(false);
        }
      }
    } catch (error) {
      console.error('Profile load error:', error);
    }
  };

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (profileData) => {
    if (!user) return null;
    
    try {
      const updatedProfile = await dbHelpers.upsertUserProfile(user.id, profileData);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  };

  const addChild = async (childData) => {
    if (!user) return null;
    
    try {
      const child = await dbHelpers.addChild(user.id, childData);
      // 프로필 다시 로드하여 자녀 목록 업데이트
      await loadUserProfile(user.id);
      setNeedsChildInfo(false);
      return child;
    } catch (error) {
      console.error('Add child error:', error);
      return null;
    }
  };

  const skipChildInfo = () => {
    setNeedsChildInfo(false);
  };

  const value = {
    user,
    userProfile,
    loading,
    needsChildInfo,
    signUp,
    signIn,
    signOut,
    updateProfile,
    addChild,
    skipChildInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
