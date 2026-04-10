import React from 'react';
import { Link } from 'react-router-dom';
import { cartAPI } from '../services/api';

const ProductCard = ({ product }) => {
    const handleAddToCart = async (e) => {
        e.preventDefault();
        try {
            await cartAPI.addItem(product.id, 1);
            alert('✅ Товар добавлен в корзину!');
        } catch (err) {
            alert('❌ Ошибка при добавлении в корзину');
        }
    };

    return (
        <div style={styles.card}>
            <Link to={`/product/${product.slug}`} style={styles.link}>
                <img 
                    src={product.image || 'https://via.placeholder.com/300'} 
                    alt={product.name}
                    style={styles.image}
                />
                <h3 style={styles.name}>{product.name}</h3>
                <div style={styles.priceBlock}>
                    <span style={styles.price}>{product.price} ₽</span>
                    {product.old_price && (
                        <span style={styles.oldPrice}>{product.old_price} ₽</span>
                    )}
                </div>
                {product.discount > 0 && (
                    <span style={styles.discount}>-{product.discount}%</span>
                )}
                {!product.in_stock && (
                    <span style={styles.outOfStock}>Нет в наличии</span>
                )}
            </Link>
            <button 
                style={styles.btnAdd}
                onClick={handleAddToCart}
                disabled={!product.in_stock}
            >
                {product.in_stock ? '🛒 В корзину' : 'Нет в наличии'}
            </button>
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
    },
    link: {
        textDecoration: 'none',
        color: 'inherit',
        flex: 1,
    },
    image: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '8px',
        marginBottom: '1rem',
    },
    name: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: '#2c3e50',
    },
    priceBlock: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
    },
    price: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#27ae60',
    },
    oldPrice: {
        fontSize: '1rem',
        color: '#95a5a6',
        textDecoration: 'line-through',
    },
    discount: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        backgroundColor: '#e74c3c',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
    },
    outOfStock: {
        color: '#e74c3c',
        fontSize: '0.9rem',
        fontWeight: 'bold',
    },
    btnAdd: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: 'auto',
    },
};

export default ProductCard;