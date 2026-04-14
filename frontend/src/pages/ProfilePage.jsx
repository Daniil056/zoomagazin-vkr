import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем данные пользователя (заглушка для демо)
        // В реальном проекте: const userRes = await authAPI.me();
        const userData = {
          first_name: 'Даниил',
          last_name: 'Сорокин',
          email: 'user@example.com',
          phone: '+7 (999) 123-45-67'
        };
        setUser(userData);
        
        // Получаем заказы пользователя
        const ordersRes = await ordersAPI.getAll();
        setOrders(ordersRes.data || []);
        
        setError(null);
      } catch (err) {
        const message = handleApiError(err, 'Не удалось загрузить данные профиля');
        setError(message);
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Состояние загрузки
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <span style={styles.spinner}>⏳</span>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <span>⚠️</span> {error}
          <button onClick={() => window.location.reload()} style={styles.retryBtn}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован (заглушка)
  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.authPrompt}>
          <h2>🔐 Необходима авторизация</h2>
          <p>Войдите в аккаунт, чтобы просматривать личный кабинет</p>
          <div style={styles.authActions}>
            <Link to="/auth" style={styles.btnPrimary}>Войти</Link>
            <button onClick={() => navigate(-1)} style={styles.btnSecondary}>
              Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>👤 Личный кабинет</h1>
      
      {/* Информация о пользователе */}
      <section style={styles.section}>
        <h2>Мои данные</h2>
        <div style={styles.userInfo}>
          <div style={styles.userField}>
            <strong>Имя:</strong> {user.first_name} {user.last_name}
          </div>
          <div style={styles.userField}>
            <strong>Email:</strong> {user.email}
          </div>
          <div style={styles.userField}>
            <strong>Телефон:</strong> {user.phone}
          </div>
        </div>
        <button onClick={handleLogout} style={styles.btnLogout}>
          🚪 Выйти из аккаунта
        </button>
      </section>

      {/* История заказов */}
      <section style={styles.section}>
        <h2>📦 История заказов</h2>
        
        {orders.length === 0 ? (
          <div style={styles.emptyOrders}>
            <p>У вас пока нет заказов</p>
            <Link to="/catalog" style={styles.btnPrimary}>
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {orders.map(order => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <strong>Заказ №{order.order_number}</strong>
                  <span style={styles.orderStatus(order.status)}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div style={styles.orderDetails}>
                  <p>📅 {new Date(order.created_at).toLocaleDateString('ru-RU')}</p>
                  <p>💰 {order.total_price} ₽</p>
                  <p>📍 {order.delivery_address}, {order.city}</p>
                </div>
                <details style={styles.orderItems}>
                  <summary>Товары в заказе</summary>
                  {order.items?.map(item => (
                    <div key={item.id} style={styles.orderItem}>
                      <span>{item.product_name}</span>
                      <span>{item.quantity} × {item.price} ₽</span>
                    </div>
                  ))}
                </details>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

// Вспомогательная функция для статуса заказа
const getStatusLabel = (status) => {
  const labels = {
    pending: '⏳ В обработке',
    confirmed: '✅ Подтверждён',
    processing: '🔄 В сборке',
    shipped: '🚚 Отправлен',
    delivered: '📦 Доставлен',
    cancelled: '❌ Отменён'
  };
  return labels[status] || status;
};

// === Стили ===
const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem 1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  
  section: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  
  loading: {
    textAlign: 'center',
    padding: '4rem',
    color: '#7f8c8d'
  },
  
  spinner: {
    display: 'inline-block',
    fontSize: '2rem',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  
  errorBox: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#fff5f5',
    border: '2px solid #feb2b2',
    borderRadius: '12px',
    color: '#c53030'
  },
  
  retryBtn: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  
  authPrompt: {
    textAlign: 'center',
    padding: '3rem 2rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px'
  },
  
  authActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '1.5rem'
  },
  
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.5rem'
  },
  
  userField: {
    fontSize: '1rem',
    color: '#34495e'
  },
  
  btnPrimary: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  btnSecondary: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'white',
    color: '#2c3e50',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none'
  },
  
  btnLogout: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  
  emptyOrders: {
    textAlign: 'center',
    padding: '2rem',
    color: '#7f8c8d'
  },
  
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  
  orderCard: {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#fafafa'
  },
  
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #eee'
  },
  
  orderDetails: {
    fontSize: '0.95rem',
    color: '#34495e',
    marginBottom: '0.75rem'
  },
  
  orderItems: {
    fontSize: '0.9rem',
    color: '#7f8c8d'
  },
  
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.25rem 0'
  }
};

// Динамический стиль для статуса
styles.orderStatus = (status) => ({
  padding: '0.25rem 0.75rem',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: '500',
  backgroundColor: {
    pending: '#fff3cd',
    confirmed: '#d1ecf1',
    processing: '#cce5ff',
    shipped: '#d4edda',
    delivered: '#c3e6cb',
    cancelled: '#f8d7da'
  }[status] || '#f1f2f6',
  color: {
    pending: '#856404',
    confirmed: '#0c5460',
    processing: '#004085',
    shipped: '#155724',
    delivered: '#155724',
    cancelled: '#721c24'
  }[status] || '#2c3e50'
});

export default ProfilePage;