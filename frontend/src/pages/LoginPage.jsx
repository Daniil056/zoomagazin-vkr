import { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({email:'',password:'',firstName:'',lastName:''});

    const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});
    const handleSubmit = (e) => { e.preventDefault(); alert(isLogin?'Вход (демо)':'Регистрация (демо)'); };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>{isLogin?'Вход':'Регистрация'}</h1>
                <form onSubmit={handleSubmit} style={styles.form}>
                    {!isLogin && <>
                        <div style={styles.grp}>
                            <label>Имя</label>
                            <input type="text" name="firstName" value={form.firstName} onChange={handleChange} style={styles.inp} required={!isLogin}/>
                        </div>
                        <div style={styles.grp}>
                            <label>Фамилия</label>
                            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} style={styles.inp} required={!isLogin}/>
                        </div>
                    </>}
                    <div style={styles.grp}>
                        <label>Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} style={styles.inp} required/>
                    </div>
                    <div style={styles.grp}>
                        <label>Пароль</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} style={styles.inp} required/>
                    </div>
                    <button type="submit" style={styles.btn}>{isLogin?'Войти':'Зарегистрироваться'}</button>
                </form>
                <div style={styles.footer}>
                    <p>{isLogin?'Нет аккаунта?':'Уже есть?'} <button type="button" style={styles.link} onClick={()=>setIsLogin(!isLogin)}>{isLogin?'Зарегистрироваться':'Войти'}</button></p>
                    <Link to="/" style={styles.back}>← На главную</Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'70vh', padding:'2rem' },
    card: { backgroundColor:'white', padding:'2.5rem', borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', width:'100%', maxWidth:'450px' },
    title: { fontSize:'1.8rem', fontWeight:'bold', marginBottom:'2rem', textAlign:'center', color:'#2c3e50' },
    form: { display:'flex', flexDirection:'column', gap:'1.5rem' },
    grp: { display:'flex', flexDirection:'column', gap:'0.5rem' },
    inp: { padding:'0.75rem', border:'1px solid #ddd', borderRadius:'6px', fontSize:'1rem' },
    btn: { backgroundColor:'#3498db', color:'white', padding:'0.875rem', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer', marginTop:'1rem' },
    footer: { marginTop:'2rem', textAlign:'center', display:'flex', flexDirection:'column', gap:'1rem' },
    link: { background:'none', border:'none', color:'#3498db', fontWeight:'bold', cursor:'pointer', marginLeft:'0.5rem' },
    back: { color:'#7f8c8d', textDecoration:'none' },
};

export default LoginPage;