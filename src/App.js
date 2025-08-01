import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Events from './pages/Events';
import MyPage from './pages/MyPage';
import PlaceDetail from './pages/PlaceDetail';

// Components
import MobileNav from './components/MobileNav';
import ChildInfoModal from './components/ChildInfoModal';

import './App.css';

// 보호된 라우트 컴포넌트
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

// 메인 앱 컴포넌트
function AppContent() {
  const { user, needsChildInfo, skipChildInfo } = useAuth();
  
  return (
    <Router>
      <Routes>
        {/* 공개 라우트 */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" replace /> : <Login />
          } 
        />
        <Route 
          path="/signup" 
          element={
            user ? <Navigate to="/" replace /> : <Signup />
          } 
        />
        
        {/* 보호된 라우트 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="app">
                <Home />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <div className="app">
                <Events />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <div className="app">
                <MyPage />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/place/:id"
          element={
            <ProtectedRoute>
              <div className="app">
                <PlaceDetail />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
      
      {/* 아이 정보 입력 모달 */}
      <ChildInfoModal 
        isOpen={needsChildInfo} 
        onClose={skipChildInfo}
      />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
