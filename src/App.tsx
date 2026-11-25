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
  const { state, setState, resetToSeed } = useAdminStore();
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [globalQuery, setGlobalQuery] = useState('');
  const [locked, setLocked] = useState(false);

  if (locked) {
    return <LoginScreen onLogin={() => setLocked(false)} />;
  }

  return (
    <AdminLayout
      activeSection={section}
      onNavigate={setSection}
      globalQuery={globalQuery}
      onGlobalQueryChange={setGlobalQuery}
      state={state}
      onResetSeed={resetToSeed}
      onLockScreen={() => setLocked(true)}
    >
      {section === 'dashboard' && <DashboardPage state={state} onNavigate={setSection} />}
      {section === 'catalog' && (
        <CatalogPage state={state} setState={setState} globalQuery={globalQuery} />
      )}
      {section === 'products' && (
        <ProductsPage state={state} setState={setState} globalQuery={globalQuery} />
      )}
      {section === 'orders' && (
        <OrdersPage state={state} setState={setState} globalQuery={globalQuery} />
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
