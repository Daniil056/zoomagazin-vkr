from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class Category(models.Model):
    """Категории товаров для животных"""
    name = models.CharField(max_length=100, verbose_name="Название категории")
    slug = models.SlugField(unique=True, blank=True, verbose_name="URL")
    description = models.TextField(blank=True, verbose_name="Описание")
    image = models.ImageField(
        upload_to='categories/', 
        blank=True, 
        null=True, 
        verbose_name="Изображение"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    """Товары зоомагазина"""
    PET_TYPES = [
        ('dogs', '🐕 Собаки'),
        ('cats', '🐱 Кошки'),
        ('birds', '🦜 Птицы'),
        ('rodents', '🐹 Грызуны'),
        ('fish', '🐠 Рыбки'),
        ('reptiles', '🦎 Рептилии'),
        ('all', 'Все животные'),
    ]

    name = models.CharField(max_length=200, verbose_name="Название товара")
    slug = models.SlugField(unique=True, blank=True, verbose_name="URL")
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name="Категория"
    )
    description = models.TextField(verbose_name="Описание")
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Цена"
    )
    old_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        verbose_name="Старая цена"
    )
    image = models.ImageField(
        upload_to='products/%Y/%m/', 
        blank=True, 
        null=True, 
        verbose_name="Изображение"
    )
    stock = models.PositiveIntegerField(default=0, verbose_name="Остаток на складе")
    brand = models.CharField(max_length=100, blank=True, verbose_name="Бренд")
    for_pet_type = models.CharField(
        max_length=20,
        choices=PET_TYPES,
        default='all',
        verbose_name="Для какого животного"
    )
    is_available = models.BooleanField(default=True, verbose_name="Доступен к продаже")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def discount_percent(self):
        """Процент скидки"""
        if self.old_price and self.old_price > self.price:
            return int(((self.old_price - self.price) / self.old_price) * 100)
        return 0

    @property
    def in_stock(self):
        """Товар в наличии"""
        return self.stock > 0 and self.is_available


class Cart(models.Model):
    """Корзина покупок"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='carts', 
        null=True, 
        blank=True
    )
    session_key = models.CharField(max_length=40, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Корзина"
        verbose_name_plural = "Корзины"

    def __str__(self):
        return f"Корзина #{self.id}"

    def get_total_price(self):
        """Общая стоимость"""
        return sum(item.get_total_price() for item in self.items.all())

    def get_total_items(self):
        """Общее количество товаров"""
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    """Позиция в корзине"""
    cart = models.ForeignKey(
        Cart, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Товар в корзине"
        verbose_name_plural = "Товары в корзине"
        unique_together = ['cart', 'product']

    def __str__(self):
        return f"{self.product.name} × {self.quantity}"

    def get_total_price(self):
        """Стоимость позиции"""
        return self.product.price * self.quantity


class Order(models.Model):
    """Заказ покупателя"""
    STATUS_CHOICES = [
        ('pending', 'Ожидает подтверждения'),
        ('confirmed', 'Подтверждён'),
        ('processing', 'В обработке'),
        ('shipped', 'Отправлен'),
        ('delivered', 'Доставлен'),
        ('cancelled', 'Отменён'),
    ]

    PAYMENT_CHOICES = [
        ('card', 'Банковская карта'),
        ('cash', 'Наличные при получении'),
        ('online', 'Онлайн-оплата'),
    ]

    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='orders'
    )
    order_number = models.CharField(max_length=20, unique=True, verbose_name="№ заказа")
    first_name = models.CharField(max_length=100, verbose_name="Имя")
    last_name = models.CharField(max_length=100, verbose_name="Фамилия")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    delivery_address = models.TextField(verbose_name="Адрес доставки")
    city = models.CharField(max_length=100, verbose_name="Город")
    postal_code = models.CharField(max_length=20, blank=True, verbose_name="Индекс")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name="Статус"
    )
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_CHOICES, 
        verbose_name="Способ оплаты"
    )
    total_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Общая сумма"
    )
    notes = models.TextField(blank=True, verbose_name="Комментарий")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ['-created_at']

    def __str__(self):
        return f"Заказ №{self.order_number}"


class OrderItem(models.Model):
    """Позиция в заказе"""
    order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.SET_NULL, 
        null=True
    )
    product_name = models.CharField(max_length=200, verbose_name="Название")
    quantity = models.PositiveIntegerField(verbose_name="Количество")
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Цена"
    )

    class Meta:
        verbose_name = "Позиция заказа"
        verbose_name_plural = "Позиции заказа"

    def __str__(self):
        return f"{self.product_name} × {self.quantity}"

    def get_total_price(self):
        return self.price * self.quantity


class Review(models.Model):
    """Отзыв о товаре"""
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        related_name='reviews'
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(
        choices=[(i, i) for i in range(1, 6)], 
        verbose_name="Оценка"
    )
    text = models.TextField(verbose_name="Текст отзыва")
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False, verbose_name="Одобрен")

    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        ordering = ['-created_at']

    def __str__(self):
        return f"Отзыв на {self.product.name}"