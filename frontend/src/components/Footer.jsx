const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.content}>
                <div style={styles.section}>
                    <h3 style={styles.title}>🐾 Zooshop</h3>
                    <p style={styles.text}>
                        Всё для ваших питомцев в одном месте!
                    </p>
                </div>
                <div style={styles.section}>
                    <h3 style={styles.title}>Категории</h3>
                    <ul style={styles.list}>
                        <li>Для собак</li>
                        <li>Для кошек</li>
                        <li>Для птиц</li>
                        <li>Для грызунов</li>
                    </ul>
                </div>
                <div style={styles.section}>
                    <h3 style={styles.title}>Контакты</h3>
                    <ul style={styles.list}>
                        <li>📞 8 (800) 123-45-67</li>
                        <li>✉️ info@zoomarket.ru</li>
                    </ul>
                </div>
            </div>
            <div style={styles.copyright}>
                © 2024 ZooMarket. Все права защищены.
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: '#2c3e50',
        color: 'white',
        marginTop: 'auto',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        padding: '3rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    title: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
    },
    text: {
        color: '#bdc3c7',
        lineHeight: '1.6',
    },
    list: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        color: '#bdc3c7',
    },
    copyright: {
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid #34495e',
        color: '#95a5a6',
    },
};

export default Footer;