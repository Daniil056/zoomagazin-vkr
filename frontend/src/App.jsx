import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// === ИМПОРТЫ СТРАНИЦ ===
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import CategoriesPage from './pages/CategoriesPage';

// === ИМПОРТЫ КОМПОНЕНТОВ ===
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// === Страница поиска (ИСПРАВЛЕНО: используем useLocation) ===
const SearchPage = () => {
  const location = useLocation();  // ← Используем хук!
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1>🔍 Поиск</h1>
      {query ? (
        <>
          <p>Результаты поиска по запросу: <strong>"{query}"</strong></p>
          <p>Поиск будет реализован в следующей версии</p>
          <a href={`/catalog?search=${encodeURIComponent(query)}`} 
             style={{ color: '#3498db', textDecoration: 'none' }}>
            → Показать товары в каталоге
          </a>
        </>
      ) : (
        <p>Введите поисковый запрос в строку поиска</p>
      )}
    </div>
  );
};

// === Остальные страницы ===
const AboutPage = () => (
  <div style={{ 
    padding: '2rem', 
    textAlign: 'center', 
    maxWidth: '800px', 
    margin: '0 auto' 
  }}>
    <h1>🐾 О проекте ZooShop</h1>
    <p>Интернет-зоомагазин для покупки товаров для домашних животных.</p>
    <p>Проект разработан в рамках выпускной квалификационной работы.</p>
  </div>
);

const ContactsPage = () => (
  <div style={{ 
    padding: '2rem', 
    textAlign: 'center', 
    maxWidth: '800px', 
    margin: '0 auto' 
  }}>
    <h1>📞 Контакты</h1>
    <p>📧 Email: support@zooshop.ru</p>
    <p>📱 Телефон: +7 (999) 123-45-67</p>
    <p>🕒 Режим работы: Пн-Вс, 9:00–21:00</p>
  </div>
);

const NotFoundPage = () => (
  <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
    <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
    <p style={{ fontSize: '1.25rem', color: '#7f8c8d' }}>Страница не найдена</p>
    <a href="/" style={{ color: '#3498db', textDecoration: 'none' }}>
      ← Вернуться на главную
    </a>
  </div>
);

export default App;