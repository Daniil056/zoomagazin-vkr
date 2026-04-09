from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Cart, CartItem, Order, OrderItem, Review


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'products_count']

    def get_products_count(self, obj):
        return obj.products.filter(is_available=True).count()


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    discount = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'category_name',
            'price', 'old_price', 'discount', 'image',
            'stock', 'in_stock', 'brand', 'for_pet_type',
            'is_available', 'created_at'
        ]

    def get_discount(self, obj):
        return obj.discount_percent

    def get_in_stock(self, obj):
        return obj.in_stock


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    discount = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'category_name',
            'description', 'price', 'old_price', 'discount',
            'image', 'stock', 'brand', 'for_pet_type',
            'is_available', 'created_at', 'updated_at',
            'reviews_count', 'average_rating'
        ]

    def get_discount(self, obj):
        return obj.discount_percent

    def get_reviews_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()

    def get_average_rating(self, obj):
        from django.db.models import Avg
        avg = obj.reviews.filter(is_approved=True).aggregate(Avg('rating'))
        return avg['rating__avg'] or 0


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'rating', 'text', 'created_at', 'is_approved']
        read_only_fields = ['user', 'is_approved']


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'total_price']

    def get_total_price(self, obj):
        return obj.get_total_price()


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'total_items', 'created_at', 'updated_at']

    def get_total_price(self, obj):
        return obj.get_total_price()

    def get_total_items(self, obj):
        return obj.get_total_items()


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'product_name', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'first_name', 'last_name',
            'email', 'phone', 'delivery_address', 'city', 'postal_code',
            'status', 'payment_method', 'total_price', 'notes',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'user', 'status']