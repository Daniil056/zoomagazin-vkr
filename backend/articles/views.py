from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Avg
from .models import Category, Product, Cart, CartItem, Order, OrderItem, Review
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    CartSerializer, CartItemSerializer, OrderSerializer, ReviewSerializer
)
import uuid


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для категорий товаров"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для товаров"""
    queryset = Product.objects.filter(is_available=True)
    filter_backends = [
        # search и ordering подключаются через REST_FRAMEWORK settings
    ]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(is_available=True)
        
        # Фильтр по категории
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Фильтр по типу животного
        pet_type = self.request.query_params.get('pet_type')
        if pet_type:
            queryset = queryset.filter(for_pet_type=pet_type)
        
        # Фильтр по цене
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Только в наличии
        if self.request.query_params.get('in_stock') == 'true':
            queryset = queryset.filter(stock__gt=0)
        
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request, pk=None):
        """Добавить отзыв к товару"""
        product = self.get_object()
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CartViewSet(viewsets.ViewSet):
    """ViewSet для работы с корзиной"""
    permission_classes = [IsAuthenticatedOrReadOnly]

    def _get_cart(self, request):
        """Получить или создать корзину"""
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
        else:
            session_key = request.session.session_key
            if not session_key:
                session_key = request.session.create()
            cart, _ = Cart.objects.get_or_create(session_key=session_key)
        return cart

    def list(self, request):
        """Получить содержимое корзины"""
        cart = self._get_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Добавить товар в корзину"""
        cart = self._get_cart(request)
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        product = get_object_or_404(Product, id=product_id)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """Удалить товар из корзины"""
        cart = self._get_cart(request)
        product_id = request.data.get('product_id')
        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        """Обновить количество товара"""
        cart = self._get_cart(request)
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity')
        
        cart_item = get_object_or_404(CartItem, cart=cart, product_id=product_id)
        cart_item.quantity = quantity
        cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Очистить корзину"""
        cart = self._get_cart(request)
        cart.items.all().delete()
        return Response({'status': 'Cart cleared'})


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet для заказов"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Создать заказ из корзины"""
        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return Response(
                {'error': 'Корзина пуста'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order_number = f"ORD{uuid.uuid4().hex[:8].upper()}"
        order_data = request.data.copy()
        order_data['user'] = request.user.id
        order_data['order_number'] = order_number
        order_data['total_price'] = cart.get_total_price()
        
        serializer = self.get_serializer(data=order_data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        # Создаём позиции заказа
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
        
        # Очищаем корзину
        cart.items.all().delete()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet для отзывов"""
    queryset = Review.objects.filter(is_approved=True)
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        product_id = self.request.query_params.get('product_id')
        if product_id:
            return Review.objects.filter(
                product_id=product_id, 
                is_approved=True
            )
        return Review.objects.filter(is_approved=True)