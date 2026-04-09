import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>🐾 Zooshop</Link>
                
                <nav style={styles.nav}>
                    <Link to="/catalog" style={styles.navLink}>Каталог</Link>
                    <Link to="/categories" style={styles.navLink}>Категории</Link>
                    <Link to="/about" style={styles.navLink}>О нас</Link>
                    <Link to="/contacts" style={styles.navLink}>Контакты</Link>
                </nav>

                <div style={styles.actions}>
                    <Link to="/search" style={styles.actionBtn}>🔍</Link>
                    <Link to="/login" style={styles.actionBtn}>👤</Link>
                    <Link to="/cart" style={styles.cartBtn}>
                        🛒
                        <span style={styles.badge}>0</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};

const styles = {
    header: {
        backgroundColor: '#2c3e50',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    logo: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: 'white',
        textDecoration: 'none',
    },
    nav: {
        display: 'flex',
        gap: '2rem',
    },
    navLink: {
        color: 'white',
        textDecoration: 'none',
        fontWeight: '500',
    },
    actions: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
    },
    actionBtn: {
        fontSize: '1.5rem',
        color: 'white',
        textDecoration: 'none',
    },
    cartBtn: {
        fontSize: '1.5rem',
        color: 'white',
        textDecoration: 'none',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#e74c3c',
        color: 'white',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        fontSize: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
    },
};

export default Header;