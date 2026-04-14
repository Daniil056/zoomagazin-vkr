import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          🐾 Zooshop
        </Link>
        
        <nav style={styles.nav}>
          <Link to="/catalog" style={styles.navLink}>Каталог</Link>
          <Link to="/categories" style={styles.navLink}>Категории</Link>
          <Link to="/about" style={styles.navLink}>О нас</Link>
          <Link to="/contacts" style={styles.navLink}>Контакты</Link>
        </nav>
        
        <div style={styles.actions}>
          <Link to="/search" style={styles.actionBtn}>🔍</Link>
          <Link to="/profile" style={styles.actionBtn}>👤</Link>
          <Link to="/cart" style={styles.actionBtn}>
            🛒
            <span style={styles.cartBadge}>0</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    textDecoration: 'none'
  },
  nav: {
    display: 'flex',
    gap: '2rem'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'opacity 0.2s'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  actionBtn: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.25rem',
    position: 'relative'
  },
  cartBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#e74c3c',
    color: 'white',
    fontSize: '0.75rem',
    padding: '0.125rem 0.375rem',
    borderRadius: '10px',
    fontWeight: 'bold'
  }
};

export default Header;