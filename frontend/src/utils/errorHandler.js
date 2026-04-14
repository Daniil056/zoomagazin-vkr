export const handleApiError = (error, defaultMessage = 'Произошла ошибка') => {
  // Нет интернета
  if (!navigator.onLine) {
    return 'Нет подключения к интернету. Проверьте соединение.';
  }
  
  // Ошибки ответа сервера
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    // Возвращаем сообщение от сервера если есть
    if (data?.error || data?.detail || data?.message) {
      return data.error || data.detail || data.message;
    }
    
    // Стандартные коды ошибок
    switch (status) {
      case 400: return 'Неверные данные в запросе';
      case 401: return 'Необходимо авторизоваться';
      case 403: return 'Доступ запрещён';
      case 404: return 'Ресурс не найден';
      case 422: return 'Ошибка валидации данных';
      case 500: return 'Ошибка сервера. Попробуйте позже';
      default: return defaultMessage;
    }
  }
  
  // Ошибки запроса (таймаут, сеть)
  if (error.request) {
    return 'Сервер не отвечает. Проверьте подключение и попробуйте снова.';
  }
  
  // Остальные ошибки
  return error.message || defaultMessage;
};