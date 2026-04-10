import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cartAPI } from '../services/api';

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await cartAPI.getCart();
            setCart(response.data);
            setError(null);
            console.log('Cart loaded:', response.data);
        } catch (err) {
            console.error('Error fetching cart:', err);
            setError('Не удалось загрузить корзину. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemoveItem = async (productId) => {
        try {
            await cartAPI.removeItem(productId);
            fetchCart();
        } catch (err) {
            console.error('Error removing item:', err);
            alert('❌ Не удалось удалить товар');
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveItem(productId);
            return;
        }
        try {
            await cartAPI.updateQuantity(productId, newQuantity);
            fetchCart();
        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };

    if (loading) return <div style={{textAlign:'center',padding:'4rem'}}>Загрузка корзины...</div>;
    if (error) return <div style={{textAlign:'center',padding:'4rem',color:'red'}}>{error}</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>🛒 Корзина</h1>
            
            {!cart || !cart.items || cart.items.length === 0 ? (
                <div style={styles.empty}>
                    <p>Корзина пуста</p>
                    <Link to="/catalog" style={styles.link}>Перейти в каталог</Link>
                </div>
            ) : (
                <>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Товар</th>
                                <th>Цена</th>
                                <th>Количество</th>
                                <th>Сумма</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.items.map(item => (
                                <tr key={item.id || item.product?.id}>
                                    <td>
                                        <Link to={`/product/${item.product?.slug || '#'}`}>
                                            {item.product?.name || 'Товар'}
                                        </Link>
                                    </td>
                                    <td>{item.product?.price || item.price} ₽</td>
                                    <td>
                                        <div style={styles.quantity}>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.product?.id, (item.quantity || 1) - 1)}
                                                style={styles.btnQty}
                                            >−</button>
                                            <span>{item.quantity || 1}</span>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.product?.id, (item.quantity || 1) + 1)}
                                                style={styles.btnQty}
                                            >+</button>
                                        </div>
                                    </td>
                                    <td>{item.total_price || (item.product?.price * (item.quantity || 1))} ₽</td>
                                    <td>
                                        <button 
                                            onClick={() => handleRemoveItem(item.product?.id)}
                                            style={styles.btnRemove}
                                        >
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={styles.total}>
                        <h3>Итого: {cart.total_price || 0} ₽</h3>
                        <p>Товаров: {cart.total_items || cart.items?.length || 0}</p>
                        <button style={styles.btnCheckout} onClick={() => alert('Оформление заказа будет доступно в ЛР-5')}>
                            Оформить заказ
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
    title: { fontSize: '2rem', marginBottom: '2rem', color: '#2c3e50' },
    empty: { textAlign: 'center', padding: '4rem', backgroundColor: '#f8f9fa', borderRadius: '12px' },
    link: { display: 'inline-block', marginTop: '1rem', color: '#3498db', textDecoration: 'none', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' },
    'table th': { textAlign: 'left', padding: '1rem', borderBottom: '2px solid #ddd', backgroundColor: '#f8f9fa' },
    'table td': { padding: '1rem', borderBottom: '1px solid #ddd' },
    quantity: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
    btnQty: { width: '30px', height: '30px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer', borderRadius: '4px' },
    btnRemove: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
    total: { backgroundColor: '#f8f9fa', padding: '2rem', borderRadius: '12px', textAlign: 'right' },
    btnCheckout: { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' },
};

export default CartPage;