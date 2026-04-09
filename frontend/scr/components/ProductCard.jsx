import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const discount = product.discount || 0;
    const inStock = product.in_stock || product.stock > 0;

    return (
        <Link to={`/product/${product.slug}`} style={styles.card}>
            <div style={styles.imageWrap}>
                {product.image ? (
                    <img src={product.image} alt={product.name} style={styles.image} />
                ) : (
                    <div style={styles.placeholder}>🐾</div>
                )}
                {discount > 0 && (
                    <span style={styles.badge}>-{discount}%</span>
                )}
            </div>
            <div style={styles.content}>
                <div style={styles.category}>{product.category_name}</div>
                <h3 style={styles.name}>{product.name}</h3>
                {product.brand && <div style={styles.brand}>{product.brand}</div>}
                <div style={styles.footer}>
                    <div style={styles.priceBlock}>
                        {product.old_price && (
                            <span style={styles.oldPrice}>{product.old_price} ₽</span>
                        )}
                        <span style={styles.price}>{product.price} ₽</span>
                    </div>
                    <button 
                        style={inStock ? styles.btn : styles.btnDisabled}
                        disabled={!inStock}
                        onClick={(e) => e.preventDefault()}
                    >
                        {inStock ? 'В корзину' : 'Нет в наличии'}
                    </button>
                </div>
            </div>
        </Link>
    );
};

const styles = {
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
    },
    imageWrap: {
        position: 'relative',
        height: '220px',
        backgroundColor: '#f8f9fa',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '4rem',
    },
    badge: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: '#e74c3c',
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontWeight: 'bold',
        fontSize: '0.875rem',
    },
    content: {
        padding: '1.25rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    category: {
        color: '#3498db',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    name: {
        fontSize: '1.1rem',
        fontWeight: '600',
        margin: '0.5rem 0',
    },
    brand: {
        color: '#7f8c8d',
        fontSize: '0.875rem',
        marginBottom: '1rem',
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    priceBlock: {
        display: 'flex',
        flexDirection: 'column',
    },
    oldPrice: {
        textDecoration: 'line-through',
        color: '#95a5a6',
        fontSize: '0.875rem',
    },
    price: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    btn: {
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        padding: '0.6rem 1.2rem',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    btnDisabled: {
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        padding: '0.6rem 1.2rem',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'not-allowed',
    },
};

export default ProductCard;