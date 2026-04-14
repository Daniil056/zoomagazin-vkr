import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

// Константы для повторного использования
const PLACEHOLDER_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f1f2f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='14' fill='%2395a5a6' text-anchor='middle' dy='.3em'%3ENet foto%3C/text%3E%3C/svg%3E`;
const MAX_QUICK_ADD_ATTEMPTS = 3;

const ProductCard = ({ product, onCartUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState(null);
    const [addSuccess, setAddSuccess] = useState(false);
    const [quickAddCount, setQuickAddCount] = useState(0);

    // Обработчик добавления в корзину с защитой от частых кликов
    const handleAddToCart = useCallback(async (e) => {
        e?.preventDefault();
        
        // Защита от слишком частых кликов (anti-spam)
        if (quickAddCount >= MAX_QUICK_ADD_ATTEMPTS) {
            setAddError('Подождите немного перед следующим добавлением');
            setTimeout(() => setQuickAddCount(0), 2000);
            return;
        }
        
        // Валидация продукта
        if (!product?.id) {
            setAddError('Некорректные данные товара');
            return;
        }
        
        // Если товар не в наличии — блокируем добавление
        if (!product.in_stock) {
            setAddError('Товар временно отсутствует');
            return;
        }
        
        try {
            setIsAdding(true);
            setAddError(null);
            setAddSuccess(false);
            
            // Запрос к API
            await cartAPI.addItem(product.id, 1);
            
            // Успех: визуальная обратная связь
            setAddSuccess(true);
            setQuickAddCount(prev => prev + 1);
            
            // Уведомляем родительский компонент об обновлении корзины
            if (onCartUpdate) {
                onCartUpdate();
            }
            
            // Сброс состояния успеха через 2 секунды
            setTimeout(() => setAddSuccess(false), 2000);
            
        } catch (err) {
            const message = handleApiError(err, 'Не удалось добавить товар в корзину');
            setAddError(message);
            console.error('Add to cart error:', err);
            
            // Авто-скрытие ошибки через 4 секунды
            setTimeout(() => setAddError(null), 4000);
            
        } finally {
            setIsAdding(false);
        }
    }, [product, onCartUpdate, quickAddCount]);

    // Обработчик наведения для анимации
    const [isHovered, setIsHovered] = useState(false);

    // === Рендеринг ===

    // Защита от некорректных данных
    if (!product) {
        return (
            <div style={styles.card}>
                <div style={styles.errorState}>
                    <span>⚠️</span>
                    <p>Ошибка загрузки товара</p>
                </div>
            </div>
        );
    }

    // Безопасное получение данных с дефолтными значениями
    const {
        id,
        name = 'Без названия',
        slug = '#',
        price = 0,
        old_price = null,
        discount = 0,
        image = null,
        brand = null,
        for_pet_type = null,
        in_stock = true,
        stock = 0
    } = product;

    // Форматирование цены
    const formattedPrice = new Intl.NumberFormat('ru-RU').format(price);
    const formattedOldPrice = old_price 
        ? new Intl.NumberFormat('ru-RU').format(old_price) 
        : null;

    // Иконка типа животного
    const petTypeIcons = {
        cats: '🐱',
        dogs: '🐕',
        birds: '🦜',
        rodents: '🐹',
        fish: '🐠',
        reptiles: '🦎',
        all: '🐾'
    };
    const petIcon = petTypeIcons[for_pet_type] || '🐾';

    return (
        <article 
            style={{...styles.card, ...(isHovered ? styles.cardHovered : {})}}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label={`Товар: ${name}, цена: ${formattedPrice} рублей`}
        >
            {/* Бейдж скидки */}
            {discount > 0 && in_stock && (
                <span style={styles.badgeDiscount} aria-label={`Скидка ${discount} процентов`}>
                    -{discount}%
                </span>
            )}
            
            {/* Бейдж "Нет в наличии" */}
            {!in_stock && (
                <span style={styles.badgeOutOfStock} aria-label="Товар отсутствует">
                    Нет в наличии
                </span>
            )}
            
            {/* Бейдж типа животного */}
            {for_pet_type && (
                <span style={styles.badgePetType} title={`Для: ${for_pet_type}`}>
                    {petIcon}
                </span>
            )}

            {/* Ссылка на товар */}
            <Link 
                to={`/product/${slug}`} 
                style={styles.link}
                onClick={() => setIsHovered(false)}
                aria-label={`Подробнее о товаре ${name}`}
            >
                {/* Изображение товара */}
                <div style={styles.imageWrapper}>
                    <img 
                        src={image || PLACEHOLDER_IMAGE} 
                        alt={name}
                        style={{
                            ...styles.image,
                            ...(isHovered ? styles.imageZoom : {})
                        }}
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE;
                            e.target.alt = 'Изображение недоступно';
                        }}
                    />
                    
                    {/* Быстрый просмотр при наведении */}
                    {isHovered && in_stock && (
                        <div style={styles.quickView}>
                            <span>👁️ Быстрый просмотр</span>
                        </div>
                    )}
                </div>

                {/* Информация о товаре */}
                <div style={styles.info}>
                    {brand && (
                        <span style={styles.brand}>{brand}</span>
                    )}
                    
                    <h3 style={styles.name} title={name}>
                        {name.length > 40 ? name.slice(0, 40) + '…' : name}
                    </h3>
                    
                    {/* Цена */}
                    <div style={styles.priceBlock}>
                        <span style={styles.price}>{formattedPrice} ₽</span>
                        {formattedOldPrice && (
                            <span style={styles.oldPrice}>{formattedOldPrice} ₽</span>
                        )}
                    </div>
                    
                    {/* Остаток на складе */}
                    {in_stock && stock <= 5 && stock > 0 && (
                        <span style={styles.lowStock}>
                            Осталось: {stock} шт.
                        </span>
                    )}
                </div>
            </Link>

            {/* Кнопка добавления в корзину */}
            <div style={styles.actions}>
                <button 
                    style={{
                        ...styles.btnAdd,
                        ...(isAdding ? styles.btnAddLoading : {}),
                        ...(addSuccess ? styles.btnAddSuccess : {}),
                        ...(!in_stock ? styles.btnAddDisabled : {})
                    }}
                    onClick={handleAddToCart}
                    disabled={!in_stock || isAdding}
                    aria-busy={isAdding}
                    aria-label={in_stock ? `Добавить ${name} в корзину` : 'Товар недоступен'}
                >
                    {isAdding ? (
                        <span style={styles.spinner}>⏳</span>
                    ) : addSuccess ? (
                        <span>✅ Добавлено!</span>
                    ) : in_stock ? (
                        <span>🛒 В корзину</span>
                    ) : (
                        <span>Нет в наличии</span>
                    )}
                </button>
                
                {/* Сообщение об ошибке */}
                {addError && (
                    <span style={styles.errorMessage} role="alert">
                        ⚠️ {addError}
                    </span>
                )}
            </div>
        </article>
    );
};

// === Стили ===
const styles = {
    // Карточка товара
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        minHeight: '380px'
    },
    
    cardHovered: {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
    },
    
    // Состояние ошибки
    errorState: {
        textAlign: 'center',
        padding: '2rem',
        color: '#e74c3c',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem'
    },
    
    // Бейджи
    badgeDiscount: {
        position: 'absolute',
        top: '0.75rem',
        left: '0.75rem',
        backgroundColor: '#e74c3c',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        zIndex: 2
    },
    
    badgeOutOfStock: {
        position: 'absolute',
        top: '0.75rem',
        left: '0.75rem',
        backgroundColor: '#95a5a6',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '500',
        zIndex: 2
    },
    
    badgePetType: {
        position: 'absolute',
        top: '0.75rem',
        right: '0.75rem',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: '0.25rem 0.5rem',
        borderRadius: '20px',
        fontSize: '1rem',
        zIndex: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    
    // Ссылка
    link: {
        textDecoration: 'none',
        color: 'inherit',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    
    // Изображение
    imageWrapper: {
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '0.75rem',
        backgroundColor: '#f8f9fa',
        aspectRatio: '1/1'
    },
    
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease'
    },
    
    imageZoom: {
        transform: 'scale(1.05)'
    },
    
    quickView: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(52, 152, 219, 0.9)',
        color: 'white',
        padding: '0.5rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        fontWeight: '500',
        transform: 'translateY(100%)',
        transition: 'transform 0.2s'
    },
    
    // Информация о товаре
    info: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    
    brand: {
        fontSize: '0.8rem',
        color: '#7f8c8d',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    
    name: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#2c3e50',
        margin: 0,
        lineHeight: 1.4,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    
    priceBlock: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: 'auto'
    },
    
    price: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#27ae60'
    },
    
    oldPrice: {
        fontSize: '0.95rem',
        color: '#95a5a6',
        textDecoration: 'line-through'
    },
    
    lowStock: {
        fontSize: '0.8rem',
        color: '#e67e22',
        fontWeight: '500'
    },
    
    // Действия
    actions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginTop: '0.75rem'
    },
    
    btnAdd: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '0.875rem',
        borderRadius: '8px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
    },
    
    btnAddLoading: {
        backgroundColor: '#95a5a6',
        cursor: 'wait'
    },
    
    btnAddSuccess: {
        backgroundColor: '#27ae60'
    },
    
    btnAddDisabled: {
        backgroundColor: '#bdc3c7',
        cursor: 'not-allowed',
        opacity: 0.8
    },
    
    spinner: {
        display: 'inline-block',
        animation: 'spin 1s linear infinite'
    },
    
    errorMessage: {
        fontSize: '0.8rem',
        color: '#e74c3c',
        textAlign: 'center',
        backgroundColor: '#fff5f5',
        padding: '0.375rem 0.5rem',
        borderRadius: '4px',
        border: '1px solid #feb2b2'
    }
};



export default React.memo(ProductCard);