import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const endpoint = isLogin ? '/api/auth/login/' : '/api/auth/register/';
    
    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        const err = await response.json();
        setError(err.detail || 'Ошибка авторизации');
      }
    } catch (err) {
      setError('Не удалось подключиться к серверу');
    }
  };

  return (
    <div className="auth-page">
      <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Имя пользователя"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </>
        )}
        
        <input
          type="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        
        {!isLogin && (
          <input
            type="password"
            placeholder="Повторите пароль"
            value={formData.password2}
            onChange={(e) => setFormData({...formData, password2: e.target.value})}
            required
          />
        )}
        
        <button type="submit">{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
      </form>
      
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Войти'}
      </button>
    </div>
  );
};

export default AuthPage;