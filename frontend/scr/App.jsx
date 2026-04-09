import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/product/:slug" element={<ProductPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/categories" element={<CatalogPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;