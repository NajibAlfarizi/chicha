'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, Check, X, Package, Star } from 'lucide-react';
import { Product, Complaint } from '@/lib/types';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Complaint[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    message: '',
  });

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      
      if (data.product) {
        setProduct(data.product);
        
        // Fetch related products from same category
        if (data.product.category_id) {
          fetchRelatedProducts(data.product.category_id, productId);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId: string, currentProductId: string) => {
    try {
      const response = await fetch(`/api/products?category_id=${categoryId}`);
      const data = await response.json();
      
      if (data.products) {
        // Filter out current product and limit to 4
        const related = data.products
          .filter((p: Product) => p.id !== currentProductId)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/complaints?product_id=${productId}`);
      const data = await response.json();
      
      if (data.complaints) {
        // Filter only reviews (those with product_id)
        const productReviews = data.complaints.filter((c: Complaint) => c.product_id && c.rating);
        setReviews(productReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user?.id) {
      toast.error('Login diperlukan', {
        description: 'Silakan login untuk memberikan ulasan',
      });
      return;
    }

    if (!reviewData.message.trim()) {
      toast.error('Ulasan tidak boleh kosong');
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          product_id: productId,
          message: reviewData.message,
          rating: reviewData.rating,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Ulasan berhasil dikirim!');
        setReviewData({ rating: 5, message: '' });
        setShowReviewForm(false);
        fetchReviews(); // Refresh reviews
      } else {
        toast.error('Gagal mengirim ulasan', {
          description: data.error || 'Silakan coba lagi',
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setSubmittingReview(false);
    }
  };

  const calculateAverageRating = (): number => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    setAddingToCart(true);

    // Get existing cart from localStorage
    const cartStr = localStorage.getItem('cart');
    const cart = cartStr ? JSON.parse(cartStr) : [];

    // Check if product already in cart
    const existingIndex = cart.findIndex((item: { product: { id: string } }) => item.product?.id === product.id);

    if (existingIndex > -1) {
      // Update quantity
      cart[existingIndex].quantity += quantity;
    } else {
      // Add new item with proper structure for CartItem type
      cart.push({
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          stock: product.stock,
          category: product.category,
          description: product.description,
          category_id: product.category_id,
        },
        quantity: quantity,
      });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Dispatch event for cart update
    window.dispatchEvent(new Event('cartUpdated'));

    setTimeout(() => {
      setAddingToCart(false);
      toast.success('Ditambahkan ke keranjang!', {
        description: `${quantity}x ${product.name}`,
      });
    }, 300);
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </ClientLayout>
    );
  }

  if (!product) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Produk Tidak Ditemukan</h2>
          <p className="text-slate-400 mb-6">Produk yang Anda cari tidak tersedia</p>
          <Button onClick={() => router.push('/client/produk')} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
            Kembali ke Produk
          </Button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Product Detail Section */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Product Image */}
            <div className="bg-card rounded-lg p-6 border border-amber-500/20 shadow-sm">
              <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <Package className="h-32 w-32 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category Badge */}
              {product.category && (
                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                  {product.category.name}
                </Badge>
              )}

              {/* Product Name */}
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      return (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            starValue <= calculateAverageRating() 
                              ? 'fill-current' 
                              : 'fill-slate-700'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-slate-400 text-sm">
                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <Check className="h-5 w-5 text-green-600 dark:text-green-500" />
                    <span className="text-green-600 dark:text-green-500 font-medium">
                      Stok Tersedia: {product.stock} unit
                    </span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-red-600 dark:text-red-500" />
                    <span className="text-red-600 dark:text-red-500 font-medium">Stok Habis</span>
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-2">Deskripsi Produk</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Jumlah</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-amber-500/30 rounded-lg">
                      <Button
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        variant="ghost"
                        size="sm"
                        className="text-amber-600 dark:text-amber-500 hover:bg-amber-500/10"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-6 font-semibold">{quantity}</span>
                      <Button
                        onClick={incrementQuantity}
                        disabled={quantity >= product.stock}
                        variant="ghost"
                        size="sm"
                        className="text-amber-600 dark:text-amber-500 hover:bg-amber-500/10"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-slate-400 text-sm">
                      Max: {product.stock} unit
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="border-t pt-6">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-6 text-lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {addingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                </Button>
                {product.stock === 0 && (
                  <p className="text-red-600 dark:text-red-500 text-sm mt-2 text-center">
                    Produk ini sedang tidak tersedia
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="border-t pt-12 mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Ulasan Produk</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= calculateAverageRating()
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-slate-300">
                    {calculateAverageRating()} ({reviews.length} ulasan)
                  </span>
                </div>
              </div>
              {user && (
                <Button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Star className="mr-2 h-4 w-4" />
                  Tulis Ulasan
                </Button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && user && (
              <Card className="border-amber-500/20 shadow-sm mb-6">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Rating</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-8 w-8 transition-colors ${
                                star <= reviewData.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-muted-foreground hover:text-amber-500'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="review-message">
                        Ulasan Anda
                      </Label>
                      <Textarea
                        id="review-message"
                        value={reviewData.message}
                        onChange={(e) => setReviewData({ ...reviewData, message: e.target.value })}
                        placeholder="Bagikan pengalaman Anda dengan produk ini..."
                        className="mt-2"
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                      </Button>
                      <Button
                        onClick={() => setShowReviewForm(false)}
                        variant="outline"
                        className="border-slate-700 text-slate-300"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card className="border shadow-sm">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Belum ada ulasan untuk produk ini
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className="border shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      {/* Customer Review */}
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">
                              {review.user?.name || 'Anonymous'}
                            </span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= (review.rating || 0)
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.message}</p>
                          <p className="text-xs text-muted-foreground/70 mt-2">
                            {new Date(review.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Admin Reply */}
                      {review.reply && (
                        <div className="ml-8 pl-4 border-l-2 border-amber-500/30 bg-amber-500/5 p-4 rounded-r-lg">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-500 border-amber-500/30 text-xs">
                                  Admin Chicha Mobile
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-sm">{review.reply}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="border-t pt-12 mt-12">
              <h2 className="text-2xl font-bold mb-6">Produk Terkait</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <Card
                    key={relatedProduct.id}
                    className="border-amber-500/20 hover:border-amber-500/50 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => router.push(`/client/produk/${relatedProduct.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted/30 rounded-lg mb-3 flex items-center justify-center">
                        {relatedProduct.image_url ? (
                          <img
                            src={relatedProduct.image_url}
                            alt={relatedProduct.name}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <Package className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-amber-600 dark:text-amber-500 font-bold text-lg">
                        Rp {relatedProduct.price.toLocaleString('id-ID')}
                      </p>
                      {relatedProduct.stock > 0 ? (
                        <Badge className="bg-green-500/20 text-green-600 dark:text-green-500 text-xs mt-2">
                          Stok: {relatedProduct.stock}
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-600 dark:text-red-500 text-xs mt-2">
                          Habis
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
