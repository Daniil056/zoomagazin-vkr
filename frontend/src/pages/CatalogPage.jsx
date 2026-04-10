import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI, categoriesAPI } from '../services/api';

const CatalogPage = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsRes, categoriesRes] = await Promise.all([
                    productsAPI.getAll(),
                    categoriesAPI.getAll(),
                ]);
                setCategories(categoriesRes.data);
                
                let productsData = productsRes.data;
                if (selectedCategory) {
                    productsData = productsData.filter(p => p.category?.slug === selectedCategory);
                }
                setProducts(productsData);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedCategory]);

    const handleCategoryChange = (slug) => {
        setSelectedCategory(slug);
    };

    if (loading) return <div style={{textAlign:'center',padding:'4rem'}}>Загрузка...</div>;

    return (
        <div style={styles.container}>
            <aside style={styles.sidebar}>
                <h3 style={styles.sidebarTitle}>Фильтры</h3>
                <div style={styles.filterGroup}>
                    <h4>Категории</h4>
                    <label style={styles.filterLabel}>
                        <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === ''}
                            onChange={() => handleCategoryChange('')}
                        /> Все
                    </label>
                    {categories.map(cat => (
                        <label key={cat.id} style={styles.filterLabel}>
                            <input
                                type="radio"
                                name="category"
                                checked={selectedCategory === cat.slug}
                                onChange={() => handleCategoryChange(cat.slug)}
                            /> {cat.name}
                        </label>
                    ))}
                </div>
            </aside>

            <main style={styles.main}>
                <h1 style={styles.title}>Каталог товаров</h1>
                <div style={styles.grid}>
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <p>Товары не найдены</p>
                    )}
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        gap: '2rem',
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    sidebar: {
        width: '250px',
        flexShrink: 0,
    },
    sidebarTitle: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#2c3e50',
    },
    filterGroup: {
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
    },
    filterLabel: {
        display: 'block',
        margin: '0.5rem 0',
        cursor: 'pointer',
    },
    main: {
        flex: 1,
    },
    title: {
        fontSize: '2rem',
        marginBottom: '2rem',
        color: '#2c3e50',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
    },
};

export default CatalogPage;