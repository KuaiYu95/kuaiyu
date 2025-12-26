import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Posts from '@/pages/Posts';
import PostEdit from '@/pages/PostEdit';
import Life from '@/pages/Life';
import LifeEdit from '@/pages/LifeEdit';
import Comments from '@/pages/Comments';
import Tags from '@/pages/Tags';
import Settings from '@/pages/Settings';
import Analytics from '@/pages/Analytics';

// ===========================================
// 路由守卫
// ===========================================

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// ===========================================
// 应用入口
// ===========================================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Analytics />} />
                  <Route path="/posts" element={<Posts />} />
                  <Route path="/posts/new" element={<PostEdit />} />
                  <Route path="/posts/:id" element={<PostEdit />} />
                  <Route path="/life" element={<Life />} />
                  <Route path="/life/new" element={<LifeEdit />} />
                  <Route path="/life/:id" element={<LifeEdit />} />
                  <Route path="/comments" element={<Comments />} />
                  <Route path="/tags" element={<Tags />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

