import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { initKakao } from './utils/kakao';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

import LoginPage from './pages/Login';
import AppInstallGuidePage from './pages/AppInstallGuide';
import ItemsPage from './pages/Items';
import BOMDetailPage from './pages/BOMDetail';
import OrdersPage from './pages/Orders';
import ProfitPage from './pages/Profit';
import ExpensesPage from './pages/Expenses';
import ConfigPage from './pages/Config';
import DashboardPage from './pages/Dashboard';
import ShopPage from './pages/Shop';
import InventoryCheckPage from './pages/InventoryCheck';
import './styles/index.css';

function App() {
  useEffect(() => {
    initKakao();
  }, []);

  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/install-guide" element={<AppInstallGuidePage />} />
          <Route path="/shop/:shopId" element={<ShopPage />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/items" element={<ItemsPage />} />
                    <Route path="/items/:id" element={<BOMDetailPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/profit" element={<ProfitPage />} />
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/inventory-check" element={<InventoryCheckPage />} />
                    <Route path="/config" element={<ConfigPage />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


export default App;
