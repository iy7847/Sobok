import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/layout/Sidebar';
import LoginPage from './pages/Login';
import ItemsPage from './pages/Items';
import BOMDetailPage from './pages/BOMDetail';
import OrdersPage from './pages/Orders';
import ProfitPage from './pages/Profit';
import ExpensesPage from './pages/Expenses';
import ConfigPage from './pages/Config';
import DashboardPage from './pages/Dashboard';
import './styles/index.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <main className="main-content flex-1">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/items" element={<ItemsPage />} />
                    <Route path="/items/:id" element={<BOMDetailPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/profit" element={<ProfitPage />} />
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/config" element={<ConfigPage />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
