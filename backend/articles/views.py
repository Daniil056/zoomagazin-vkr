from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Category, Product, Cart, CartItem, Order, OrderItem, Review
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    CartSerializer, OrderSerializer, ReviewSerializer
)
import uuid


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_available=True)
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'brand']
    ordering_fields = ['price', 'created_at', 'name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(is_available=True)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        pet_type = self.request.query_params.get('pet_type')
        if pet_type:
            queryset = queryset.filter(for_pet_type=pet_type)
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if self.request.query_params.get('in_stock') == 'true':
            queryset = queryset.filter(stock__gt=0)
        return queryset

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category_slug = request.query_params.get('category_slug')
        if category_slug:
            products = Product.objects.filter(
                category__slug=category_slug, is_available=True
            )
            serializer = self.get_serializer(products, many=True)
            return Response(serializer.data)
        return Response([])

    @action(detail=False, methods=['get'])
    def by_pet_type(self, request):
        pet_type = request.query_params.get('pet_type')
        if pet_type:
            products = Product.objects.filter(
                for_pet_type=pet_type, is_available=True
            )
            serializer = self.get_serializer(products, many=True)
            return Response(serializer.data)
        return Response([])

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if query:
            products = Product.objects.filter(
                Q(name__icontains=query) | Q(description__icontains=query) | Q(brand__icontains=query),
                is_available=True
            )
            serializer = self.get_serializer(products, many=True)
            return Response(serializer.data)
        return Response([])

    @action(detail=True, methods=['get'])
    def reviews(self, request, slug=None):
        product = get_object_or_404(Product, slug=slug)
        reviews = product.reviews.filter(is_approved=True)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)


# === ПРОСТАЯ КОРЗИНА БЕЗ CSRF ПРОБЛЕМ ===
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([AllowAny])
@csrf_exempt
def cart_api_view(request):
    """Простой API для корзины без ViewSet проблем"""
    
    # Получаем или создаём корзину (по сессии для анонимов)
    session_key = request.session.session_key
    if not session_key:
        session_key = request.session.create()
    
    cart, _ = Cart.objects.get_or_create(session_key=session_key)
    
    if request.method == 'GET':
        # Возвращаем содержимое корзины
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Добавляем товар
        action_type = request.data.get('action', 'add')
        
        if action_type == 'add':
            product_id = request.data.get('product_id')
            quantity = int(request.data.get('quantity', 1))
            
            if not product_id:
                return Response({'error': 'product_id required'}, status=400)
            
            product = get_object_or_404(Product, id=product_id)
            
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart, product=product, defaults={'quantity': quantity}
            )
            if not created:
                cart_item.quantity += quantity
                cart_item.save()
        
        elif action_type == 'remove':
            product_id = request.data.get('product_id')
            if product_id:
                CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        
        elif action_type == 'clear':
            cart.items.all().delete()
        
        elif action_type == 'update':
            product_id = request.data.get('product_id')
            quantity = int(request.data.get('quantity', 1))
            if product_id:
                cart_item = get_object_or_404(CartItem, cart=cart, product_id=product_id)
                cart_item.quantity = quantity
                cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=201)
    
    elif request.method == 'DELETE':
        cart.items.all().delete()
        return Response({'status': 'cleared'})


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user) if self.request.user.is_authenticated else Order.objects.none()


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(is_approved=True)
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        product_id = self.request.query_params.get('product_id')
        if product_id:
            return Review.objects.filter(product_id=product_id, is_approved=True)
        return Review.objects.filter(is_approved=True)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None, is_approved=False)