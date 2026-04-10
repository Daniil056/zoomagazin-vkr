import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div style={styles.layout}>
            <Header />
            <main style={styles.main}>{children}</main>
            <Footer />
        </div>
    );
};

const styles = {
    layout: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
    },
    main: {
        flex: 1,
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
    },
};

export default Layout;