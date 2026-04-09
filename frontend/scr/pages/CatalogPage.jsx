import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productService, categoryService } from '../services/api';

const CatalogPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        pet_type: searchParams.get('pet_type') || '',
        min_price: searchParams.get('min_price') || '',
        max_price: searchParams.get('max_price') || '',
        in_stock: searchParams.get('in_stock') || '',
    });

    useEffect(() => {
        const fetch = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    productService.getAll(filters),
                    categoryService.getAll(),
                ]);
                setProducts(prodRes.data.results || prodRes.data);
                setCategories(catRes.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch();
    }, [filters]);

    const handleFilter = (key, val) => {
        const newF = { ...filters, [key]: val };
        setFilters(newF);
        const params = new URLSearchParams();
        Object.entries(newF).forEach(([k,v]) => { if(v) params.set(k,v); });
        setSearchParams(params);
    };

    const petTypes = [
        {v:'dogs',l:'🐕 Собаки'},{v:'cats',l:'🐱 Кошки'},
        {v:'birds',l:'🦜 Птицы'},{v:'rodents',l:'🐹 Грызуны'},
        {v:'fish',l:'🐠 Рыбки'},{v:'reptiles',l:'🦎 Рептилии'},
    ];

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Каталог</h1>
            <div style={styles.layout}>
                <aside style={styles.sidebar}>
                    <div style={styles.filter}>
                        <h4>Категории</h4>
                        <select style={styles.select} value={filters.category}
                            onChange={e=>handleFilter('category',e.target.value)}>
                            <option value="">Все</option>
                            {categories.map(c=><option key={c.id} value={c.slug}>{c.name}</option>)}
                        </select>
                    </div>
                    <div style={styles.filter}>
                        <h4>Для кого</h4>
                        <select style={styles.select} value={filters.pet_type}
                            onChange={e=>handleFilter('pet_type',e.target.value)}>
                            <option value="">Все</option>
                            {petTypes.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}
                        </select>
                    </div>
                    <div style={styles.filter}>
                        <h4>Цена</h4>
                        <div style={styles.priceInp}>
                            <input type="number" placeholder="От" style={styles.inp}
                                value={filters.min_price}
                                onChange={e=>handleFilter('min_price',e.target.value)}/>
                            <input type="number" placeholder="До" style={styles.inp}
                                value={filters.max_price}
                                onChange={e=>handleFilter('max_price',e.target.value)}/>
                        </div>
                    </div>
                    <label style={styles.chk}>
                        <input type="checkbox" checked={filters.in_stock==='true'}
                            onChange={e=>handleFilter('in_stock',e.target.checked?'true':'')}/>
                        Только в наличии
                    </label>
                    <button style={styles.reset} onClick={()=>{
                        setFilters({category:'',pet_type:'',min_price:'',max_price:'',in_stock:''});
                        setSearchParams({});
                    }}>Сбросить</button>
                </aside>
                <main style={styles.main}>
                    {loading ? <div>Загрузка...</div> : (
                        <>
                            <div>Найдено: {products.length}</div>
                            <div style={styles.grid}>
                                {products.map(p=><ProductCard key={p.id} product={p}/>)}
                            </div>
                            {products.length===0 && <div style={styles.empty}>Товары не найдены</div>}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth:'1400px', margin:'0 auto', padding:'2rem' },
    title: { fontSize:'2.5rem', fontWeight:'bold', marginBottom:'2rem', color:'#2c3e50' },
    layout: { display:'grid', gridTemplateColumns:'280px 1fr', gap:'2rem' },
    sidebar: { backgroundColor:'white', padding:'1.5rem', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' },
    filter: { marginBottom:'1.5rem' },
    select: { width:'100%', padding:'0.75rem', border:'1px solid #ddd', borderRadius:'6px' },
    priceInp: { display:'flex', gap:'0.5rem' },
    inp: { flex:1, padding:'0.75rem', border:'1px solid #ddd', borderRadius:'6px' },
    chk: { display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer' },
    reset: { width:'100%', padding:'0.75rem', backgroundColor:'#95a5a6', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' },
    main: { backgroundColor:'white', padding:'1.5rem', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' },
    grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'1.5rem', marginTop:'1rem' },
    empty: { textAlign:'center', padding:'3rem', color:'#7f8c8d' },
};

export default CatalogPage;