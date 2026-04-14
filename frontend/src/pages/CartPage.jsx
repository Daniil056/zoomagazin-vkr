import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI, ordersAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

const CartPage = () => {
    const navigate = useNavigate();
    
    // Состояния корзины
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    
    // Состояния формы оформления заказа
    const [isCheckout, setIsCheckout] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(null);
    
    // Данные формы заказа
    const [orderForm, setOrderForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        delivery_address: '',
        city: '',
        postal_code: '',
        payment_method: 'card',
        notes: ''
    });
    
    // Ошибки валидации формы
    const [formErrors, setFormErrors] = useState({});

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    
    // Безопасное форматирование цены: строка или число → "0.00"
    const formatPrice = (value) => {
        if (value === null || value === undefined) return '0.00';
        const num = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(num)) return '0.00';
        return num.toFixed(2);
    };
    
    // Безопасное получение количества
    const getQuantity = (item) => {
        const qty = item?.quantity;
        return typeof qty === 'number' ? qty : 1;
    };
    
    // Расчёт суммы позиции: цена × количество
    const calcItemTotal = (item) => {
        const price = parseFloat(item?.product?.price) || 0;
        const qty = getQuantity(item);
        return (price * qty).toFixed(2);
    };

    // Загрузка корзины
    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await cartAPI.getCart();
            
            if (!response.data || typeof response.data !== 'object') {
                throw new Error('Некорректный формат данных');
            }
            
            setCart(response.data);
            setError(null);
        } catch (err) {
            const message = handleApiError(err, 'Не удалось загрузить корзину');
            setError(message);
            console.error('Cart fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // Валидация формы заказа
    const validateOrderForm = (data) => {
        const errors = {};
        const phoneRegex = /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/;
        
        if (!data.first_name?.trim()) errors.first_name = 'Введите имя';
        if (!data.last_name?.trim()) errors.last_name = 'Введите фамилию';
        if (!data.email?.trim()) {
            errors.email = 'Введите email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'Введите корректный email';
        }
        if (!data.phone?.trim()) {
            errors.phone = 'Введите номер телефона';
        } else if (!phoneRegex.test(data.phone)) {
            errors.phone = 'Формат: +7 (999) 123-45-67';
        }
        if (!data.delivery_address?.trim()) errors.delivery_address = 'Укажите адрес доставки';
        if (!data.city?.trim()) errors.city = 'Укажите город';
        
        return errors;
    };

    const handleFormChange = (field, value) => {
        setOrderForm(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setOrderError(null);
        setOrderSuccess(null);
        
        const errors = validateOrderForm(orderForm);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        if (!cart?.items?.length) {
            setOrderError('Корзина пуста');
            return;
        }
        
        try {
            setOrderLoading(true);
            
            const response = await ordersAPI.create({
                ...orderForm,
                total_price: parseFloat(cart.total_price) || 0
            });
            
            await cartAPI.clearCart();
            setOrderSuccess({
                orderNumber: response.data.order_number,
                total: formatPrice(response.data.total_price)
            });
            
            setOrderForm({
                first_name: '', last_name: '', email: '', phone: '',
                delivery_address: '', city: '', postal_code: '',
                payment_method: 'card', notes: ''
            });
            
            setCart(prev => prev ? { ...prev, items: [], total_price: 0, total_items: 0 } : null);
            
        } catch (err) {
            const message = handleApiError(err, 'Не удалось оформить заказ');
            setOrderError(message);
            console.error('Order error:', err);
        } finally {
            setOrderLoading(false);
        }
    };

    const handleRemoveItem = async (productId) => {
        if (!window.confirm('Удалить этот товар из корзины?')) return;
        
        try {
            setUpdating(true);
            await cartAPI.removeItem(productId);
            fetchCart();
        } catch (err) {
            const message = handleApiError(err, 'Не удалось удалить товар');
            setError(message);
            console.error('Remove item error:', err);
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        const quantity = Math.max(1, Math.min(99, parseInt(newQuantity) || 1));
        
        try {
            setUpdating(true);
            await cartAPI.updateQuantity(productId, quantity);
            fetchCart();
        } catch (err) {
            const message = handleApiError(err, 'Не удалось обновить количество');
            setError(message);
            console.error('Update quantity error:', err);
        } finally {
            setUpdating(false);
        }
    };

    const handleBackToCart = () => {
        setOrderSuccess(null);
        setIsCheckout(false);
        fetchCart();
    };

    // Форматирование телефона при вводе
    const formatPhone = (value) => {
        let cleaned = value.replace(/\D/g, '');
        if (cleaned.startsWith('8')) {
            cleaned = '7' + cleaned.slice(1);
        }
        
        if (!cleaned.startsWith('7')) {
            cleaned = '7' + cleaned;
        }
        
        cleaned = cleaned.slice(0, 11);
        
        if (cleaned.length > 10) {
            return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
        } else if (cleaned.length > 7) {
            return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}${cleaned.length > 9 ? '-' : ''}`;
        } else if (cleaned.length > 4) {
            return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}`;
        } else if (cleaned.length > 1) {
            return `+${cleaned[0]} (${cleaned.slice(1, 4)}`;
        } else if (cleaned.length > 0) {
            return `+${cleaned[0]}`;
        }
        
        return '';
    };

    // === Рендеринг ===

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <span style={styles.spinner}>⏳</span>
                    <p>Загрузка корзины...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorBox}>
                    <span style={styles.errorIcon}>⚠️</span>
                    <p>{error}</p>
                    <button style={styles.retryBtn} onClick={fetchCart}>Попробовать снова</button>
                </div>
            </div>
        );
    }

    if (orderSuccess) {
        return (
            <div style={styles.container}>
                <div style={styles.successBox}>
                    <span style={styles.successIcon}>✅</span>
                    <h2>Заказ оформлен!</h2>
                    <p><strong>Номер заказа:</strong> {orderSuccess.orderNumber}</p>
                    <p><strong>Сумма:</strong> {orderSuccess.total} ₽</p>
                    <p>Менеджер свяжется с вами в ближайшее время</p>
                    <div style={styles.successActions}>
                        <button style={styles.btnPrimary} onClick={() => navigate('/catalog')}>Продолжить покупки</button>
                        <button style={styles.btnSecondary} onClick={() => navigate('/profile')}>Мои заказы</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>🛒</span>
                    <h3>Ваша корзина пуста</h3>
                    <p>Добавьте товары из каталога, чтобы оформить заказ</p>
                    <Link to="/catalog" style={styles.btnPrimary}>Перейти в каталог</Link>
                </div>
            </div>
        );
    }

    if (isCheckout) {
        return (
            <div style={styles.container}>
                <button style={styles.backBtn} onClick={() => setIsCheckout(false)}>← Назад к корзине</button>
                <h1 style={styles.title}>📦 Оформление заказа</h1>
                
                {orderError && (
                    <div style={styles.errorBox}><span>⚠️</span> {orderError}</div>
                )}
                
                <form onSubmit={handleCheckout} style={styles.checkoutForm}>
                    <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                            <label>Имя *</label>
                            <input type="text" value={orderForm.first_name}
                                onChange={(e) => handleFormChange('first_name', e.target.value)}
                                style={{...styles.input, ...(formErrors.first_name ? styles.inputError : {})}}
                                placeholder="Иван" required />
                            {formErrors.first_name && <span style={styles.errorText}>{formErrors.first_name}</span>}
                        </div>
                        <div style={styles.formGroup}>
                            <label>Фамилия *</label>
                            <input type="text" value={orderForm.last_name}
                                onChange={(e) => handleFormChange('last_name', e.target.value)}
                                style={{...styles.input, ...(formErrors.last_name ? styles.inputError : {})}}
                                placeholder="Иванов" required />
                            {formErrors.last_name && <span style={styles.errorText}>{formErrors.last_name}</span>}
                        </div>
                        <div style={styles.formGroup}>
                            <label>Email *</label>
                            <input type="email" value={orderForm.email}
                                onChange={(e) => handleFormChange('email', e.target.value)}
                                style={{...styles.input, ...(formErrors.email ? styles.inputError : {})}}
                                placeholder="example@mail.ru" required />
                            {formErrors.email && <span style={styles.errorText}>{formErrors.email}</span>}
                        </div>
                        <div style={styles.formGroup}>
                            <label>Телефон *</label>
                            <input type="tel" value={orderForm.phone}
                                onChange={(e) => handleFormChange('phone', formatPhone(e.target.value))}
                                style={{...styles.input, ...(formErrors.phone ? styles.inputError : {})}}
                                placeholder="+7 (999) 123-45-67" required />
                            {formErrors.phone && <span style={styles.errorText}>{formErrors.phone}</span>}
                        </div>
                        <div style={styles.formGroupFull}>
                            <label>Город *</label>
                            <input type="text" value={orderForm.city}
                                onChange={(e) => handleFormChange('city', e.target.value)}
                                style={{...styles.input, ...(formErrors.city ? styles.inputError : {})}}
                                placeholder="Москва" required />
                            {formErrors.city && <span style={styles.errorText}>{formErrors.city}</span>}
                        </div>
                        <div style={styles.formGroupFull}>
                            <label>Адрес доставки *</label>
                            <input type="text" value={orderForm.delivery_address}
                                onChange={(e) => handleFormChange('delivery_address', e.target.value)}
                                style={{...styles.input, ...(formErrors.delivery_address ? styles.inputError : {})}}
                                placeholder="ул. Примерная, д. 1, кв. 1" required />
                            {formErrors.delivery_address && <span style={styles.errorText}>{formErrors.delivery_address}</span>}
                        </div>
                        <div style={styles.formGroup}>
                            <label>Индекс</label>
                            <input type="text" value={orderForm.postal_code}
                                onChange={(e) => handleFormChange('postal_code', e.target.value)}
                                style={styles.input} placeholder="123456" maxLength={6} />
                        </div>
                        <div style={styles.formGroup}>
                            <label>Способ оплаты</label>
                            <select value={orderForm.payment_method}
                                onChange={(e) => handleFormChange('payment_method', e.target.value)}
                                style={styles.select}>
                                <option value="card">💳 Банковская карта</option>
                                <option value="cash">💵 Наличные при получении</option>
                                <option value="online">🌐 Онлайн-оплата</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style={styles.formGroupFull}>
                        <label>Комментарий к заказу</label>
                        <textarea value={orderForm.notes}
                            onChange={(e) => handleFormChange('notes', e.target.value)}
                            style={styles.textarea} placeholder="Например: позвонить за 30 минут до доставки" rows={3} />
                    </div>
                    
                    <div style={styles.orderSummary}>
                        <h4>Итого к оплате</h4>
                        <div style={styles.summaryRow}>
                            <span>Товары ({cart.total_items} шт.)</span>
                            <span>{formatPrice(cart.total_price)} ₽</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span>Доставка</span>
                            <span>Бесплатно</span>
                        </div>
                        <div style={styles.summaryTotal}>
                            <strong>Итого:</strong>
                            <strong>{formatPrice(cart.total_price)} ₽</strong>
                        </div>
                    </div>
                    
                    <button type="submit" 
                        style={{...styles.btnPrimary, ...(orderLoading ? styles.btnDisabled : {})}}
                        disabled={orderLoading}>
                        {orderLoading ? 'Оформление...' : '✅ Подтвердить заказ'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>🛒 Корзина</h1>
            
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.thProduct}>Товар</th>
                        <th style={styles.thPrice}>Цена</th>
                        <th style={styles.thQty}>Количество</th>
                        <th style={styles.thSum}>Сумма</th>
                        <th style={styles.thActions}>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.items.map(item => {
                        const product = item.product || {};
                        const quantity = getQuantity(item);
                        
                        return (
                            <tr key={item.id || product.id} style={styles.tr}>
                                <td style={styles.tdProduct}>
                                    <Link to={`/product/${product.slug || '#'}`} style={styles.productLink}>
                                        {product.image && (
                                            <img src={product.image} alt={product.name}
                                                style={styles.productImage}
                                                onError={(e) => { e.target.src = '/placeholder-product.jpg'; }} />
                                        )}
                                        <span>{product.name || 'Товар'}</span>
                                    </Link>
                                </td>
                                {/* 🔧 ИСПРАВЛЕНО: formatPrice вместо .toFixed() */}
                                <td style={styles.tdPrice}>{formatPrice(product.price)} ₽</td>
                                <td style={styles.tdQty}>
                                    <div style={styles.quantityControl}>
                                        <button onClick={() => handleUpdateQuantity(product.id, quantity - 1)}
                                            style={{...styles.btnQty, ...(updating ? styles.btnDisabled : {})}}
                                            disabled={updating || quantity <= 1}>−</button>
                                        <span style={styles.quantityValue}>{quantity}</span>
                                        <button onClick={() => handleUpdateQuantity(product.id, quantity + 1)}
                                            style={{...styles.btnQty, ...(updating ? styles.btnDisabled : {})}}
                                            disabled={updating}>+</button>
                                    </div>
                                </td>
                                {/* 🔧 ИСПРАВЛЕНО: calcItemTotal вместо .toFixed() */}
                                <td style={styles.tdSum}>{calcItemTotal(item)} ₽</td>
                                <td style={styles.tdActions}>
                                    <button onClick={() => handleRemoveItem(product.id)}
                                        style={{...styles.btnRemove, ...(updating ? styles.btnDisabled : {})}}
                                        disabled={updating} title="Удалить товар">🗑️</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            
            <div style={styles.cartFooter}>
                <div style={styles.cartTotal}>
                    <div style={styles.totalRow}>
                        <span>Товары ({cart.total_items} шт.)</span>
                        {/* 🔧 ИСПРАВЛЕНО: formatPrice вместо .toFixed() */}
                        <span>{formatPrice(cart.total_price)} ₽</span>
                    </div>
                    <div style={styles.totalRow}>
                        <span>Доставка</span>
                        <span style={styles.freeShipping}>Бесплатно</span>
                    </div>
                    <div style={styles.totalFinal}>
                        <strong>Итого к оплате:</strong>
                        {/* 🔧 ИСПРАВЛЕНО: formatPrice вместо .toFixed() */}
                        <strong>{formatPrice(cart.total_price)} ₽</strong>
                    </div>
                </div>
                
                <div style={styles.cartActions}>
                    <Link to="/catalog" style={styles.btnSecondary}>← Продолжить покупки</Link>
                    <button onClick={() => setIsCheckout(true)}
                        style={styles.btnPrimary} disabled={updating}>📦 Оформить заказ</button>
                </div>
            </div>
            
            <p style={styles.hint}>💡 При оформлении заказа менеджер свяжется с вами для подтверждения</p>
        </div>
    );
};

// === Стили (без изменений) ===
const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    title: { fontSize: '2rem', marginBottom: '2rem', color: '#2c3e50', textAlign: 'center' },
    loading: { textAlign: 'center', padding: '4rem', color: '#7f8c8d' },
    spinner: { display: 'inline-block', fontSize: '2rem', animation: 'spin 1s linear infinite', marginBottom: '1rem' },
    errorBox: { backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c53030' },
    errorIcon: { fontSize: '1.25rem' },
    errorText: { fontSize: '0.875rem', color: '#c53030', marginTop: '0.25rem', display: 'block' },
    retryBtn: { backgroundColor: '#e53e3e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem' },
    successBox: { textAlign: 'center', padding: '3rem 2rem', backgroundColor: '#f0fff4', border: '2px solid #68d391', borderRadius: '12px', maxWidth: '500px', margin: '2rem auto' },
    successIcon: { fontSize: '3rem', marginBottom: '1rem', display: 'block' },
    successActions: { display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' },
    emptyState: { textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#f8f9fa', borderRadius: '12px' },
    emptyIcon: { fontSize: '4rem', marginBottom: '1rem', display: 'block' },
    btnPrimary: { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s', textDecoration: 'none', display: 'inline-block' },
    btnSecondary: { backgroundColor: '#f8f9fa', color: '#2c3e50', border: '2px solid #dee2e6', padding: '0.875rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none', display: 'inline-block' },
    btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    backBtn: { background: 'none', border: 'none', color: '#3498db', fontSize: '1rem', cursor: 'pointer', padding: '0.5rem 0', marginBottom: '1rem' },
    table: { width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    thProduct: { textAlign: 'left', padding: '1rem 1.5rem', backgroundColor: '#f8f9fa', fontWeight: '600', color: '#2c3e50' },
    thPrice: { textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', fontWeight: '600', color: '#2c3e50' },
    thQty: { textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', fontWeight: '600', color: '#2c3e50' },
    thSum: { textAlign: 'right', padding: '1rem 1.5rem', backgroundColor: '#f8f9fa', fontWeight: '600', color: '#2c3e50' },
    thActions: { textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', fontWeight: '600', color: '#2c3e50' },
    tr: { borderBottom: '1px solid #eee' },
    tdProduct: { padding: '1rem 1.5rem', verticalAlign: 'middle' },
    tdPrice: { padding: '1rem', textAlign: 'center', verticalAlign: 'middle', fontWeight: '500' },
    tdQty: { padding: '1rem', textAlign: 'center', verticalAlign: 'middle' },
    tdSum: { padding: '1rem 1.5rem', textAlign: 'right', verticalAlign: 'middle', fontWeight: '600', color: '#27ae60' },
    tdActions: { padding: '1rem', textAlign: 'center', verticalAlign: 'middle' },
    productLink: { display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: '#2c3e50', fontWeight: '500' },
    productImage: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#f8f9fa' },
    quantityControl: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '6px', padding: '0.25rem' },
    btnQty: { width: '32px', height: '32px', border: '1px solid #dee2e6', backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s' },
    quantityValue: { minWidth: '32px', textAlign: 'center', fontWeight: '500' },
    btnRemove: { backgroundColor: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' },
    cartFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap', backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' },
    cartTotal: { minWidth: '280px' },
    totalRow: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1rem', color: '#34495e' },
    freeShipping: { color: '#27ae60', fontWeight: '500' },
    totalFinal: { display: 'flex', justifyContent: 'space-between', padding: '1rem 0', marginTop: '0.5rem', borderTop: '2px solid #dee2e6', fontSize: '1.25rem', color: '#2c3e50' },
    cartActions: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
    hint: { textAlign: 'center', color: '#7f8c8d', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '1rem' },
    checkoutForm: { backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '2rem' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    formGroupFull: { display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' },
    input: {
        padding: '0.875rem 1rem',
        border: '2px solid #dee2e6',
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'all 0.2s',
        outline: 'none'
        },

    inputError: {
        border: '2px solid #e74c3c'  // ✅ Полная замена border
    },
    select: { padding: '0.875rem 1rem', border: '2px solid #dee2e6', borderRadius: '8px', fontSize: '1rem', backgroundColor: 'white', cursor: 'pointer' },
    textarea: { padding: '0.875rem 1rem', border: '2px solid #dee2e6', borderRadius: '8px', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit', outline: 'none' },
    orderSummary: { backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#34495e' },
    summaryTotal: { display: 'flex', justifyContent: 'space-between', padding: '1rem 0', marginTop: '0.5rem', borderTop: '2px solid #dee2e6', fontSize: '1.25rem', color: '#2c3e50' }
};

export default CartPage;