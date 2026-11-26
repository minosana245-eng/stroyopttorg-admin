import { useState } from 'react';
import { AdminSection } from './types/admin';
import { useAdminStore } from './store/useAdminStore';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { CustomersPage } from './pages/CustomersPage';
import { PromosPage } from './pages/PromosPage';
import { ContentPage } from './pages/ContentPage';
import { RequestsPage } from './pages/RequestsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginScreen } from './pages/LoginScreen';

export function App() {
  const {
    state,
    setState,
    resetToSeed,
    authSession,
    login,
    logout,
    isSyncing,
    apiConnected,
    syncError,
    syncFromApi,
    saveCategoryApi,
    deleteCategoryApi,
    saveBrandApi,
    deleteBrandApi,
    saveProductApi,
    deleteProductApi,
    bulkUpdateProductsApi,
    updateOrderStatusApi,
    createOrderApi,
    isAuthError,
  } = useAdminStore();

  const [section, setSection] = useState<AdminSection>('dashboard');
  const [globalQuery, setGlobalQuery] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);

  const handleAuthRequired = (message?: string) => {
    setLoginNotice(message ?? 'Для сохранения изменений требуется вход в API.');
    setLoginOpen(true);
  };

  if (loginOpen) {
    return (
      <LoginScreen
        notice={loginNotice}
        onLogin={async (email, password) => {
          await login(email, password);
          setLoginNotice(null);
          setLoginOpen(false);
        }}
        onContinueReadOnly={() => {
          setLoginNotice(null);
          setLoginOpen(false);
        }}
      />
    );
  }

  return (
    <AdminLayout
      activeSection={section}
      onNavigate={setSection}
      globalQuery={globalQuery}
      onGlobalQueryChange={setGlobalQuery}
      state={state}
      authSession={authSession}
      apiConnected={apiConnected}
      isSyncing={isSyncing}
      syncError={syncError}
      onSyncApi={syncFromApi}
      onResetSeed={resetToSeed}
      onOpenLogin={() => {
        setLoginNotice(null);
        setLoginOpen(true);
      }}
      onLogout={() => {
        logout();
        setLoginNotice(null);
        setLoginOpen(true);
      }}
    >
      {section === 'dashboard' && <DashboardPage state={state} onNavigate={setSection} />}
      {section === 'catalog' && (
        <CatalogPage
          state={state}
          globalQuery={globalQuery}
          onSaveCategory={saveCategoryApi}
          onDeleteCategory={deleteCategoryApi}
          onSaveBrand={saveBrandApi}
          onDeleteBrand={deleteBrandApi}
          isAuthError={isAuthError}
          onAuthRequired={handleAuthRequired}
        />
      )}
      {section === 'products' && (
        <ProductsPage
          state={state}
          globalQuery={globalQuery}
          onSaveProduct={saveProductApi}
          onDeleteProduct={deleteProductApi}
          onBulkUpdateProducts={bulkUpdateProductsApi}
          isAuthError={isAuthError}
          onAuthRequired={handleAuthRequired}
        />
      )}
      {section === 'orders' && (
        <OrdersPage
          state={state}
          globalQuery={globalQuery}
          onUpdateOrderStatus={updateOrderStatusApi}
          onCreateOrder={createOrderApi}
          isAuthError={isAuthError}
          onAuthRequired={handleAuthRequired}
        />
      )}
      {section === 'customers' && (
        <CustomersPage state={state} setState={setState} globalQuery={globalQuery} />
      )}
      {section === 'promos' && <PromosPage state={state} setState={setState} />}
      {section === 'content' && <ContentPage state={state} setState={setState} />}
      {section === 'requests' && <RequestsPage state={state} setState={setState} />}
      {section === 'settings' && <SettingsPage state={state} setState={setState} />}
    </AdminLayout>
  );
}

export default App;
