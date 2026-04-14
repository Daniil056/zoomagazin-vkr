import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoriesAPI.getAll();
        
        // API должен вернуть categories с products_count
        setCategories(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Не удалось загрузить категории');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Иконки для типов животных
  const petTypeIcons = {
    dogs: '🐕',
    cats: '🐱',
    birds: '🦜',
    rodents: '🐹',
    fish: '🐠',
    reptiles: '🦎',
    all: '🐾'
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>📦 Все категории товаров</h1>
        <div style={styles.loading}>
          <span style={styles.spinner}>⏳</span>
          <p>Загрузка категорий...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>📦 Все категории товаров</h1>
        <div style={styles.error}>
          <span>⚠️</span> {error}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>📦 Все категории товаров</h1>
        <div style={styles.empty}>
          <p>Категории пока не добавлены</p>
          <Link to="/catalog" style={styles.link}>Перейти в каталог</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📦 Все категории товаров</h1>
      
      <div style={styles.grid}>
        {categories.map(cat => {
          const icon = petTypeIcons[cat.slug] || petTypeIcons.all;
          const count = cat.products_count || 0;
          
          return (
            <Link 
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              style={styles.card}
            >
              <div style={styles.icon}>{icon}</div>
              <h3 style={styles.name}>{cat.name}</h3>
              <span style={styles.count}>
                {count} {getProductCountWord(count)}
              </span>
            </Link>
          );
        })}
      </div>
      
      <div style={styles.hint}>
        💡 Нажмите на категорию, чтобы увидеть все товары для ваших питомцев
      </div>
    </div>
  );
};

// Вспомогательная функция для склонения слов
const getProductCountWord = (count) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'товаров';
  if (lastDigit === 1) return 'товар';
  if (lastDigit >= 2 && lastTwoDigits <= 4) return 'товара';
  return 'товаров';
};

const styles = {
  container: {
    maxWidth: '1200px',
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
  error: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#fff5f5',
    border: '1px solid #feb2b2',
    borderRadius: '8px',
    color: '#c53030'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px'
  },
  link: {
    display: 'inline-block',
    marginTop: '1rem',
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: '500'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem 1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
    textDecoration: 'none',
    color: '#2c3e50',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  name: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
    color: '#2c3e50'
  },
  count: {
    fontSize: '0.9rem',
    color: '#7f8c8d'
  },
  hint: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: '0.95rem',
    fontStyle: 'italic',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  }
};

export default CategoriesPage;