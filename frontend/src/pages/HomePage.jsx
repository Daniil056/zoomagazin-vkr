import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI, categoriesAPI } from '../services/api';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    productsAPI.getAll(),
                    categoriesAPI.getAll(),
                ]);
                setProducts(productsRes.data.slice(0, 8));
                setCategories(categoriesRes.data);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div style={{textAlign:'center',padding:'4rem'}}>Загрузка...</div>;

    return (
        <div>
            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>🐾 Всё для ваших питомцев!</h1>
                <p style={styles.heroSubtitle}>Корма, игрушки, аксессуары с доставкой</p>
                <Link to="/catalog" style={styles.heroBtn}>Перейти в каталог</Link>
            </section>

            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Категории</h2>
                <div style={styles.catGrid}>
                    {categories.slice(0,4).map(cat => (
                        <Link key={cat.id} to={`/catalog?category=${cat.slug}`} style={styles.catCard}>
                            <div style={styles.catIcon}>🐾</div>
                            <h3>{cat.name}</h3>
                            <span>{cat.products_count} товаров</span>
                        </Link>
                    ))}
                </div>
            </section>

            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Популярные товары</h2>
                <div style={styles.prodGrid}>
                    {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
                <div style={styles.center}>
                    <Link to="/catalog" style={styles.moreBtn}>Все товары</Link>
                </div>
            </section>
        </div>
    );
};

const styles = {
    hero: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 2rem',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '3rem',
    },
    heroTitle: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' },
    heroSubtitle: { fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 },
    heroBtn: {
        display: 'inline-block',
        backgroundColor: 'white',
        color: '#667eea',
        padding: '1rem 2rem',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
    section: { marginBottom: '4rem' },
    sectionTitle: {
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        color: '#2c3e50',
    },
    catGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem',
    },
    catCard: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        textAlign: 'center',
        textDecoration: 'none',
        color: 'inherit',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    catIcon: { fontSize: '3rem', marginBottom: '1rem' },
    prodGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
    },
    center: { textAlign: 'center', marginTop: '2rem' },
    moreBtn: {
        display: 'inline-block',
        backgroundColor: '#3498db',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
};

export default HomePage;