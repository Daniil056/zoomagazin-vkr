import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productsAPI, cartAPI } from '../services/api';

const ProductPage = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productsAPI.getBySlug(slug);
                setProduct(response.data);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const handleAddToCart = async () => {
        try {
            await cartAPI.addItem(product.id, 1);
            alert('✅ Товар добавлен в корзину!');
        } catch (err) {
            alert('❌ Ошибка при добавлении в корзину');
        }
    };

    if (loading) return <div style={{textAlign:'center',padding:'4rem'}}>Загрузка...</div>;
    if (!product) return <div style={{textAlign:'center',padding:'4rem'}}>Товар не найден</div>;

    return (
        <div style={styles.container}>
            <div style={styles.imageSection}>
                <img 
                    src={product.image || 'https://via.placeholder.com/400'} 
                    alt={product.name}
                    style={styles.image}
                />
            </div>
            
            <div style={styles.infoSection}>
                <h1 style={styles.title}>{product.name}</h1>
                <p style={styles.category}>Категория: {product.category_name}</p>
                
                <div style={styles.priceBlock}>
                    <span style={styles.price}>{product.price} ₽</span>
                    {product.old_price && (
                        <span style={styles.oldPrice}>{product.old_price} ₽</span>
                    )}
                    {product.discount > 0 && (
                        <span style={styles.discount}>-{product.discount}%</span>
                    )}
                </div>

                <p style={styles.description}>{product.description}</p>
                
                <div style={styles.details}>
                    <p><strong>Бренд:</strong> {product.brand || '—'}</p>
                    <p><strong>В наличии:</strong> {product.stock} шт.</p>
                    <p><strong>Для:</strong> {product.for_pet_type}</p>
                </div>

                <button 
                    style={styles.btnAdd}
                    onClick={handleAddToCart}
                    disabled={!product.in_stock}
                >
                    {product.in_stock ? '🛒 В корзину' : 'Нет в наличии'}
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        gap: '3rem',
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    imageSection: {
        flex: 1,
    },
    image: {
        width: '100%',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    infoSection: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    title: {
        fontSize: '2rem',
        color: '#2c3e50',
        margin: 0,
    },
    category: {
        color: '#7f8c8d',
        margin: 0,
    },
    priceBlock: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    price: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#27ae60',
    },
    oldPrice: {
        fontSize: '1.25rem',
        color: '#95a5a6',
        textDecoration: 'line-through',
    },
    discount: {
        backgroundColor: '#e74c3c',
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontWeight: 'bold',
    },
    description: {
        color: '#34495e',
        lineHeight: 1.6,
    },
    details: {
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
    },
    btnAdd: {
        backgroundColor: '#3498db',
        color: 'white',
        padding: '1rem 2rem',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '1rem',
    },
};

export default ProductPage;