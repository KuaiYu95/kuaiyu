import Layout from '@/components/Layout';
import { ToastProvider } from '@/components/Toast';
import Analytics from '@/pages/Analytics';
import BillEdit from '@/pages/BillEdit';
import Bills from '@/pages/Bills';
import Comments from '@/pages/Comments';
import Life from '@/pages/Life';
import LifeEdit from '@/pages/LifeEdit';
import Login from '@/pages/Login';
import PostEdit from '@/pages/PostEdit';
import Posts from '@/pages/Posts';
import Tags from '@/pages/Tags';
import { useAuthStore } from '@/store/auth';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

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
    <ToastProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
        }}
      >
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
                    <Route path="/bills" element={<Bills />} />
                    <Route path="/bills/new" element={<BillEdit />} />
                    <Route path="/bills/:id" element={<BillEdit />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

