import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/api';

const ProductPage = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        productService.getBySlug(slug).then(res => {
            setProduct(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [slug]);

    if (loading) return <div style={{textAlign:'center',padding:'4rem'}}>Загрузка...</div>;
    if (!product) return <div>Товар не найден <Link to="/catalog">← Назад</Link></div>;

    return (
        <div style={styles.container}>
            <Link to="/catalog" style={styles.back}>← Каталог</Link>
            <div style={styles.grid}>
                <div style={styles.imgSec}>
                    {product.image ? (
                        <img src={product.image} alt={product.name} style={styles.img}/>
                    ) : <div style={styles.placeholder}>🐾</div>}
                </div>
                <div style={styles.info}>
                    <div style={styles.cat}>{product.category_name}</div>
                    <h1 style={styles.title}>{product.name}</h1>
                    {product.brand && <div style={styles.brand}>{product.brand}</div>}
                    <div style={styles.price}>
                        {product.old_price && <span style={styles.old}>{product.old_price} ₽</span>}
                        <span style={styles.cur}>{product.price} ₽</span>
                        {product.discount>0 && <span style={styles.disc}>-{product.discount}%</span>}
                    </div>
                    <div style={styles.stock}>
                        {product.in_stock ? 
                            <span style={styles.ok}>✓ В наличии: {product.stock} шт.</span> :
                            <span style={styles.no}>✗ Нет в наличии</span>}
                    </div>
                    <div style={styles.desc}>
                        <h4>Описание</h4>
                        <p>{product.description}</p>
                    </div>
                    <div style={styles.actions}>
                        <div style={styles.qty}>
                            <button style={styles.qbtn} onClick={()=>setQty(Math.max(1,qty-1))}>−</button>
                            <span style={styles.qval}>{qty}</span>
                            <button style={styles.qbtn} onClick={()=>setQty(qty+1)}>+</button>
                        </div>
                        <button style={product.in_stock?styles.add:styles.disabled} disabled={!product.in_stock}>
                            {product.in_stock?'В корзину':'Нет в наличии'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth:'1200px', margin:'0 auto', padding:'2rem' },
    back: { color:'#3498db', textDecoration:'none', display:'inline-block', marginBottom:'2rem' },
    grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem', backgroundColor:'white', padding:'2rem', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' },
    imgSec: { backgroundColor:'#f8f9fa', borderRadius:'8px', padding:'2rem', display:'flex', alignItems:'center', justifyContent:'center' },
    img: { maxWidth:'100%', maxHeight:'500px', objectFit:'contain' },
    placeholder: { fontSize:'8rem' },
    info: { display:'flex', flexDirection:'column', gap:'1.5rem' },
    cat: { color:'#3498db', fontSize:'0.875rem', fontWeight:'bold', textTransform:'uppercase' },
    title: { fontSize:'2rem', fontWeight:'bold', color:'#2c3e50', margin:0 },
    brand: { color:'#7f8c8d' },
    price: { display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' },
    old: { textDecoration:'line-through', color:'#95a5a6', fontSize:'1.25rem' },
    cur: { fontSize:'2rem', fontWeight:'bold', color:'#2c3e50' },
    disc: { backgroundColor:'#e74c3c', color:'white', padding:'0.5rem 1rem', borderRadius:'4px', fontWeight:'bold' },
    stock: { padding:'1rem', backgroundColor:'#f8f9fa', borderRadius:'4px' },
    ok: { color:'#27ae60', fontWeight:'bold' },
    no: { color:'#e74c3c', fontWeight:'bold' },
    desc: { padding:'1.5rem', backgroundColor:'#f8f9fa', borderRadius:'8px' },
    actions: { display:'flex', gap:'1rem', alignItems:'center' },
    qty: { display:'flex', alignItems:'center', gap:'1rem', border:'2px solid #ddd', borderRadius:'8px', padding:'0.5rem' },
    qbtn: { width:'40px', height:'40px', border:'none', backgroundColor:'#f8f9fa', fontSize:'1.5rem', cursor:'pointer', borderRadius:'4px' },
    qval: { fontSize:'1.25rem', fontWeight:'bold', minWidth:'40px', textAlign:'center' },
    add: { flex:1, backgroundColor:'#27ae60', color:'white', border:'none', padding:'1rem 2rem', borderRadius:'8px', fontWeight:'bold', fontSize:'1.1rem', cursor:'pointer' },
    disabled: { flex:1, backgroundColor:'#95a5a6', color:'white', border:'none', padding:'1rem 2rem', borderRadius:'8px', fontWeight:'bold', fontSize:'1.1rem', cursor:'not-allowed' },
};

export default ProductPage;