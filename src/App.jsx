import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Products from './pages/Products';
import Buyers from './pages/Buyers';
import Suppliers from './pages/Suppliers';
import Billing from './pages/Billing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes Wrapper */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/products" replace />} />
          <Route path="products" element={<Products />} />
          <Route path="buyers" element={<Buyers />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="billing" element={<Billing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
