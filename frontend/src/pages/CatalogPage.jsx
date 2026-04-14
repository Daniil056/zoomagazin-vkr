import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI, categoriesAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

const DEFAULT_PAGE_SIZE = 12;
const SORT_OPTIONS = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'price-asc', label: 'Сначала дешёвые' },
  { value: 'price-desc', label: 'Сначала дорогие' },
  { value: 'name-asc', label: 'По названию (А-Я)' },
  { value: 'name-desc', label: 'По названию (Я-А)' },
  { value: 'newest', label: 'Сначала новые' }
];

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedPetType, setSelectedPetType] = useState(searchParams.get('pet_type') || '');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('min_price') || '',
    max: searchParams.get('max_price') || ''
  });
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'default');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (categories.length === 0) {
        const categoriesRes = await categoriesAPI.getAll();
        setCategories(categoriesRes.data || []);
      }
      
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedPetType) params.pet_type = selectedPetType;
      if (priceRange.min) params.min_price = priceRange.min;
      if (priceRange.max) params.max_price = priceRange.max;
      if (inStockOnly) params.in_stock = 'true';
      if (searchQuery) params.q = searchQuery;
      
      const productsRes = await productsAPI.getAll();
      let productsData = productsRes.data || [];
      
      if (selectedCategory) {
        productsData = productsData.filter(p => p.category?.slug === selectedCategory);
      }
      if (selectedPetType) {
        productsData = productsData.filter(p => p.for_pet_type === selectedPetType);
      }
      if (priceRange.min) {
        productsData = productsData.filter(p => p.price >= parseFloat(priceRange.min));
      }
      if (priceRange.max) {
        productsData = productsData.filter(p => p.price <= parseFloat(priceRange.max));
      }
      if (inStockOnly) {
        productsData = productsData.filter(p => p.in_stock && p.stock > 0);
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        productsData = productsData.filter(p => 
          p.name?.toLowerCase().includes(query) || 
          p.description?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
        );
      }
      
      productsData = sortProducts(productsData, sortBy);
      
      const startIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE;
      const paginatedProducts = productsData.slice(startIndex, startIndex + DEFAULT_PAGE_SIZE);
      
      setProducts(paginatedProducts);
      setTotalPages(Math.ceil(productsData.length / DEFAULT_PAGE_SIZE));
      
    } catch (err) {
      const message = handleApiError(err, 'Не удалось загрузить каталог');
      setError(message);
      console.error('Catalog fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedPetType, priceRange, inStockOnly, searchQuery, sortBy, currentPage, categories.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortProducts = (products, sortKey) => {
    const sorted = [...products];
    
    switch (sortKey) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name-desc':
        return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      default:
        return sorted;
    }
  };

  const handleCategoryChange = useCallback((slug) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
    updateUrlParams({ category: slug || undefined });
  }, []);

  const handlePetTypeChange = useCallback((type) => {
    setSelectedPetType(type);
    setCurrentPage(1);
    updateUrlParams({ pet_type: type || undefined });
  }, []);

  const handlePriceChange = useCallback((field, value) => {
    setPriceRange(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  }, []);

  const handlePriceApply = useCallback(() => {
    updateUrlParams({
      min_price: priceRange.min || undefined,
      max_price: priceRange.max || undefined
    });
    fetchData();
  }, [priceRange, fetchData]);

  const handleInStockChange = useCallback((checked) => {
    setInStockOnly(checked);
    setCurrentPage(1);
    updateUrlParams({ in_stock: checked ? 'true' : undefined });
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    setCurrentPage(1);
    updateUrlParams({ sort: value !== 'default' ? value : undefined });
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateUrlParams({ search: searchQuery || undefined });
    fetchData();
  }, [searchQuery, fetchData]);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (!value) {
      updateUrlParams({ search: undefined });
      fetchData();
    }
  }, [fetchData]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory('');
    setSelectedPetType('');
    setPriceRange({ min: '', max: '' });
    setInStockOnly(false);
    setSortBy('default');
    setSearchQuery('');
    setCurrentPage(1);
    setSearchParams({});
    fetchData();
  }, [fetchData, setSearchParams]);

  const updateUrlParams = useCallback((newParams) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      return params;
    });
  }, [setSearchParams]);

  const handleCartUpdate = useCallback(() => {
    console.log('Cart updated');
  }, []);

  if (loading && products.length === 0) {
    return (
      <div style={styles.container}>
        <aside style={styles.sidebar}>
          <div style={styles.skeletonFilter} />
          <div style={styles.skeletonFilter} />
          <div style={styles.skeletonFilter} />
        </aside>
        <main style={styles.main}>
          <div style={styles.skeletonTitle} />
          <div style={styles.skeletonGrid}>
            {[...Array(DEFAULT_PAGE_SIZE)].map((_, i) => (
              <div key={i} style={styles.skeletonCard} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <p>{error}</p>
          <button style={styles.retryBtn} onClick={fetchData}>
            Попробовать снова
          </button>
          <button style={styles.resetBtn} onClick={handleClearFilters}>
            Сбросить фильтры
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <div style={styles.container}>
        <aside style={styles.sidebar}>
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            selectedPetType={selectedPetType}
            priceRange={priceRange}
            inStockOnly={inStockOnly}
            onCategoryChange={handleCategoryChange}
            onPetTypeChange={handlePetTypeChange}
            onPriceChange={handlePriceChange}
            onPriceApply={handlePriceApply}
            onInStockChange={handleInStockChange}
            onClearFilters={handleClearFilters}
          />
        </aside>
        <main style={styles.main}>
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🔍</span>
            <h3>Товары не найдены</h3>
            <p>
              {searchQuery 
                ? `По запросу "${searchQuery}" ничего не найдено`
                : 'Попробуйте изменить параметры фильтрации'
              }
            </p>
            <div style={styles.emptyActions}>
              <button onClick={handleClearFilters} style={styles.btnSecondary}>
                Сбросить все фильтры
              </button>
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); handleSearchChange(''); }} style={styles.btnSecondary}>
                  Очистить поиск
                </button>
              )}
              <Link to="/" style={styles.btnPrimary}>
                На главную
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <FilterSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          selectedPetType={selectedPetType}
          priceRange={priceRange}
          inStockOnly={inStockOnly}
          onCategoryChange={handleCategoryChange}
          onPetTypeChange={handlePetTypeChange}
          onPriceChange={handlePriceChange}
          onPriceApply={handlePriceApply}
          onInStockChange={handleInStockChange}
          onClearFilters={handleClearFilters}
        />
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Каталог товаров</h1>
          
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="search"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={styles.searchInput}
              aria-label="Поиск товаров"
            />
            <button type="submit" style={styles.searchBtn} aria-label="Найти">
              🔍
            </button>
          </form>
          
          <div style={styles.controls}>
            <span style={styles.resultsCount}>
              Найдено: <strong>{products.length}</strong> {getProductCountWord(products.length)}
            </span>
            
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              style={styles.sortSelect}
              aria-label="Сортировка товаров"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(selectedCategory || selectedPetType || priceRange.min || priceRange.max || inStockOnly || searchQuery) && (
          <div style={styles.activeFilters}>
            <span style={styles.activeFiltersTitle}>Активные фильтры:</span>
            {selectedCategory && (
              <FilterTag 
                label={categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                onRemove={() => handleCategoryChange('')}
              />
            )}
            {selectedPetType && (
              <FilterTag 
                label={`Тип: ${getPetTypeLabel(selectedPetType)}`}
                onRemove={() => handlePetTypeChange('')}
              />
            )}
            {(priceRange.min || priceRange.max) && (
              <FilterTag 
                label={`Цена: ${priceRange.min || 0}–${priceRange.max || '∞'} ₽`}
                onRemove={() => { setPriceRange({ min: '', max: '' }); handlePriceApply(); }}
              />
            )}
            {inStockOnly && (
              <FilterTag 
                label="Только в наличии"
                onRemove={() => handleInStockChange(false)}
              />
            )}
            {searchQuery && (
              <FilterTag 
                label={`Поиск: "${searchQuery}"`}
                onRemove={() => { setSearchQuery(''); handleSearchChange(''); }}
              />
            )}
            <button onClick={handleClearFilters} style={styles.clearAllBtn}>
              Очистить всё
            </button>
          </div>
        )}

        <div style={styles.grid}>
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product}
              onCartUpdate={handleCartUpdate}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        <p style={styles.hint}>
          💡 Совет: используйте фильтры слева, чтобы быстрее найти нужные товары
        </p>
      </main>
    </div>
  );
};

const FilterSidebar = ({
  categories,
  selectedCategory,
  selectedPetType,
  priceRange,
  inStockOnly,
  onCategoryChange,
  onPetTypeChange,
  onPriceChange,
  onPriceApply,
  onInStockChange,
  onClearFilters
}) => {
  const petTypes = [
    { value: 'cats', label: '🐱 Кошки' },
    { value: 'dogs', label: '🐕 Собаки' },
    { value: 'birds', label: '🦜 Птицы' },
    { value: 'rodents', label: '🐹 Грызуны' },
    { value: 'fish', label: '🐠 Рыбки' },
    { value: 'reptiles', label: '🦎 Рептилии' }
  ];

  return (
    <div style={styles.sidebarContent}>
      <h3 style={styles.sidebarTitle}>Фильтры</h3>
      
      <div style={styles.filterSection}>
        <h4 style={styles.filterSectionTitle}>Категории</h4>
        <label style={styles.filterOption}>
          <input
            type="radio"
            name="category"
            checked={selectedCategory === ''}
            onChange={() => onCategoryChange('')}
          />
          <span>Все категории</span>
        </label>
        {categories.map(cat => (
          <label key={cat.id} style={styles.filterOption}>
            <input
              type="radio"
              name="category"
              checked={selectedCategory === cat.slug}
              onChange={() => onCategoryChange(cat.slug)}
            />
            <span>{cat.name}</span>
            {cat.products_count !== undefined && (
              <span style={styles.countBadge}>{cat.products_count}</span>
            )}
          </label>
        ))}
      </div>

      <div style={styles.filterSection}>
        <h4 style={styles.filterSectionTitle}>Для кого</h4>
        <label style={styles.filterOption}>
          <input
            type="radio"
            name="pet_type"
            checked={selectedPetType === ''}
            onChange={() => onPetTypeChange('')}
          />
          <span>Все животные</span>
        </label>
        {petTypes.map(type => (
          <label key={type.value} style={styles.filterOption}>
            <input
              type="radio"
              name="pet_type"
              checked={selectedPetType === type.value}
              onChange={() => onPetTypeChange(type.value)}
            />
            <span>{type.label}</span>
          </label>
        ))}
      </div>

      {/* 🔧 ИСПРАВЛЕНО: Поля цены теперь не выходят за пределы */}
      <div style={styles.filterSection}>
        <h4 style={styles.filterSectionTitle}>Цена, ₽</h4>
        <div style={styles.priceInputs}>
          <input
            type="number"
            placeholder="От"
            value={priceRange.min}
            onChange={(e) => onPriceChange('min', e.target.value)}
            style={styles.priceInput}
            min={0}
          />
          <span style={styles.priceSeparator}>—</span>
          <input
            type="number"
            placeholder="До"
            value={priceRange.max}
            onChange={(e) => onPriceChange('max', e.target.value)}
            style={styles.priceInput}
            min={0}
          />
        </div>
        <button onClick={onPriceApply} style={styles.applyBtn}>
          Применить
        </button>
      </div>

      <div style={styles.filterSection}>
        <label style={styles.checkboxOption}>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
          />
          <span>Только в наличии</span>
        </label>
      </div>

      <button onClick={onClearFilters} style={styles.resetFiltersBtn}>
        Сбросить фильтры
      </button>
    </div>
  );
};

const FilterTag = ({ label, onRemove }) => (
  <span style={styles.filterTag}>
    {label}
    <button onClick={onRemove} style={styles.filterTagRemove} aria-label="Удалить фильтр">
      ×
    </button>
  </span>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = useMemo(() => {
    const result = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    
    return result;
  }, [currentPage, totalPages]);

  return (
    <nav style={styles.pagination} aria-label="Навигация по страницам">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{...styles.paginationBtn, ...(currentPage === 1 ? styles.paginationBtnDisabled : {})}}
        aria-label="Предыдущая страница"
      >
        ←
      </button>
      
      {pages[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)} style={styles.paginationBtn}>1</button>
          {pages[0] > 2 && <span style={styles.paginationEllipsis}>…</span>}
        </>
      )}
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            ...styles.paginationBtn,
            ...(page === currentPage ? styles.paginationBtnActive : {})
          }}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span style={styles.paginationEllipsis}>…</span>
          )}
          <button onClick={() => onPageChange(totalPages)} style={styles.paginationBtn}>
            {totalPages}
          </button>
        </>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{...styles.paginationBtn, ...(currentPage === totalPages ? styles.paginationBtnDisabled : {})}}
        aria-label="Следующая страница"
      >
        →
      </button>
    </nav>
  );
};

const getPetTypeLabel = (value) => {
  const labels = {
    cats: 'Кошки',
    dogs: 'Собаки',
    birds: 'Птицы',
    rodents: 'Грызуны',
    fish: 'Рыбки',
    reptiles: 'Рептилии'
  };
  return labels[value] || value;
};

const getProductCountWord = (count) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'товаров';
  if (lastDigit === 1) return 'товар';
  if (lastDigit >= 2 && lastTwoDigits <= 4) return 'товара';
  return 'товаров';
};

const styles = {
  container: {
    display: 'flex',
    gap: '2rem',
    padding: '2rem 1rem',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  
  sidebar: {
    width: '280px',
    flexShrink: 0
  },
  
  sidebarContent: {
    position: 'sticky',
    top: '2rem',
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  
  sidebarTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#2c3e50',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f1f2f6'
  },
  
  filterSection: {
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #f1f2f6'
  },
  
  filterSectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#34495e'
  },
  
  filterOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#2c3e50'
  },
  
  checkboxOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#2c3e50'
  },
  
  countBadge: {
    marginLeft: 'auto',
    backgroundColor: '#f1f2f6',
    color: '#7f8c8d',
    fontSize: '0.8rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '20px'
  },
  
  // 🔧 ИСПРАВЛЕНО: Добавлено flexWrap и proper flex settings
  priceInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    flexWrap: 'nowrap'
  },
  
  // 🔧 ИСПРАВЛЕНО: Добавлено minWidth: 0 для правильного сжатия
  priceInput: {
    flex: 1,
    minWidth: 0,
    padding: '0.5rem 0.5rem',
    border: '2px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '0.9rem',
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%'
  },
  
  priceSeparator: {
    color: '#7f8c8d',
    fontWeight: '500',
    fontSize: '0.9rem',
    flexShrink: 0
  },
  
  applyBtn: {
    width: '100%',
    padding: '0.625rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  
  resetFiltersBtn: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'transparent',
    color: '#e74c3c',
    border: '2px solid #e74c3c',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  
  main: {
    flex: 1,
    minWidth: 0
  },
  
  header: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#2c3e50',
    margin: 0
  },
  
  searchForm: {
    display: 'flex',
    gap: '0.5rem',
    maxWidth: '400px'
  },
  
  searchInput: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  
  searchBtn: {
    padding: '0.75rem 1.25rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  
  resultsCount: {
    fontSize: '0.95rem',
    color: '#7f8c8d'
  },
  
  sortSelect: {
    padding: '0.5rem 1rem',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '0.95rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none'
  },
  
  activeFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '1.5rem'
  },
  
  activeFiltersTitle: {
    fontSize: '0.9rem',
    color: '#7f8c8d',
    marginRight: '0.5rem'
  },
  
  filterTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    backgroundColor: '#3498db',
    color: 'white',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  
  filterTagRemove: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    marginLeft: '0.25rem'
  },
  
  clearAllBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: '#e74c3c',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: '500',
    textDecoration: 'underline'
  },
  
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '1.5rem 0',
    borderTop: '1px solid #eee'
  },
  
  paginationBtn: {
    minWidth: '36px',
    height: '36px',
    padding: '0 0.75rem',
    border: '2px solid #dee2e6',
    backgroundColor: 'white',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  paginationBtnActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
    color: 'white'
  },
  
  paginationBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  
  paginationEllipsis: {
    padding: '0 0.5rem',
    color: '#7f8c8d'
  },
  
  hint: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: '0.9rem',
    fontStyle: 'italic',
    marginTop: '1rem'
  },
  
  errorBox: {
    textAlign: 'center',
    padding: '3rem 2rem',
    backgroundColor: '#fff5f5',
    border: '2px solid #feb2b2',
    borderRadius: '12px',
    maxWidth: '500px',
    margin: '3rem auto',
    color: '#c53030'
  },
  
  errorIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    display: 'block'
  },
  
  retryBtn: {
    marginTop: '1rem',
    marginRight: '0.75rem',
    padding: '0.625rem 1.25rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  
  resetBtn: {
    marginTop: '1rem',
    padding: '0.625rem 1.25rem',
    backgroundColor: 'transparent',
    color: '#e74c3c',
    border: '2px solid #e74c3c',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px'
  },
  
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    display: 'block'
  },
  
  emptyActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '1.5rem',
    flexWrap: 'wrap'
  },
  
  btnPrimary: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  btnSecondary: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'white',
    color: '#2c3e50',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  
  skeletonFilter: {
    height: '40px',
    backgroundColor: '#f1f2f6',
    borderRadius: '6px',
    marginBottom: '0.75rem',
    animation: 'pulse 1.5s infinite'
  },
  
  skeletonTitle: {
    height: '32px',
    width: '200px',
    backgroundColor: '#f1f2f6',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    animation: 'pulse 1.5s infinite'
  },
  
  skeletonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.5rem'
  },
  
  skeletonCard: {
    height: '380px',
    backgroundColor: '#f1f2f6',
    borderRadius: '12px',
    animation: 'pulse 1.5s infinite'
  }
};

export default CatalogPage;