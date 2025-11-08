'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSaveProduct = async () => {
    try {
      // Validation
      if (!currentProduct.name?.trim()) {
        toast.error('Validasi gagal', {
          description: 'Nama produk wajib diisi.',
        });
        return;
      }

      if (!currentProduct.category_id) {
        toast.error('Validasi gagal', {
          description: 'Kategori wajib dipilih.',
        });
        return;
      }

      if (!currentProduct.price || Number(currentProduct.price) <= 0) {
        toast.error('Validasi gagal', {
          description: 'Harga harus lebih dari 0.',
        });
        return;
      }

      const url = isEditMode ? `/api/products/${currentProduct.id}` : '/api/products';
      const method = isEditMode ? 'PUT' : 'POST';

      // Prepare data
      const productData = {
        name: currentProduct.name.trim(),
        category_id: currentProduct.category_id,
        price: Number(currentProduct.price),
        stock: Number(currentProduct.stock) || 0,
        image_url: currentProduct.image_url?.trim() || null,
        description: currentProduct.description?.trim() || null,
      };

      console.log('Sending product data:', productData);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        toast.success(isEditMode ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!', {
          description: `${productData.name} telah disimpan.`,
        });
        fetchProducts();
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error('Gagal menyimpan produk', {
          description: data.error || 'Terjadi kesalahan saat menyimpan.',
        });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Terjadi kesalahan', {
        description: 'Tidak dapat terhubung ke server.',
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Produk berhasil dihapus', {
          description: 'Produk telah dihapus dari database.',
        });
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error('Gagal menghapus produk', {
          description: data.error || 'Terjadi kesalahan.',
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Terjadi kesalahan', {
        description: 'Tidak dapat menghapus produk.',
      });
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setCurrentProduct({
      name: '',
      category_id: '',
      price: 0,
      stock: 0,
      image_url: '',
      description: '',
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Package className="h-8 w-8 text-amber-500" />
              Manajemen Produk
            </h2>
            <p className="text-muted-foreground mt-2">Kelola sparepart dan aksesoris handphone</p>
          </div>
          <Button onClick={openCreateDialog} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </div>

        {/* Search */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Daftar Produk</CardTitle>
            <CardDescription>
              Total: {filteredProducts.length} produk
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="text-amber-500">Nama Produk</TableHead>
                    <TableHead className="text-amber-500">Kategori</TableHead>
                    <TableHead className="text-amber-500">Harga</TableHead>
                    <TableHead className="text-amber-500">Stok</TableHead>
                    <TableHead className="text-amber-500 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        {product.category?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        Rp {product.price.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(product)}
                            className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="border-red-500 text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-500">
                {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Perbarui informasi produk' : 'Tambahkan produk baru ke inventory'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Produk</Label>
                <Input
                  id="name"
                  value={currentProduct.name || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={currentProduct.category_id || ''}
                  onValueChange={(value) => setCurrentProduct({ ...currentProduct, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categories.length > 0 ? "Pilih kategori" : "Loading kategori..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Belum ada kategori
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {categories.length === 0 && (
                  <p className="text-xs text-amber-500">
                    Tambahkan kategori terlebih dahulu di menu Kategori
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Harga</Label>
                  <Input
                    id="price"
                    type="number"
                    value={currentProduct.price || 0}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stok</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={currentProduct.stock || 0}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">URL Gambar</Label>
                <Input
                  id="image_url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={currentProduct.image_url || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, image_url: e.target.value })}
                />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Masukkan URL gambar langsung (berakhiran .jpg, .png, .webp)
                  </p>
                  <p className="text-xs text-amber-500">
                    ✓ Contoh benar: <code className="bg-muted px-1 rounded">https://i.imgur.com/abc123.jpg</code>
                  </p>
                  <p className="text-xs text-red-500">
                    ✗ Contoh salah: URL halaman produk Shopee/Tokopedia
                  </p>
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-amber-500">Cara mendapatkan URL gambar</summary>
                    <ul className="mt-2 ml-4 space-y-1 list-disc">
                      <li>Klik kanan gambar di halaman produk → Copy Image Address</li>
                      <li>Upload gambar ke <a href="https://imgur.com" target="_blank" className="text-amber-500 hover:underline">Imgur.com</a> atau <a href="https://imgbb.com" target="_blank" className="text-amber-500 hover:underline">ImgBB.com</a></li>
                      <li>Gunakan gambar dari CDN atau cloud storage</li>
                    </ul>
                  </details>
                </div>
                {currentProduct.image_url && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                    <div className="w-32 h-32 bg-muted rounded flex items-center justify-center">
                      <img
                        src={currentProduct.image_url}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="text-red-500 text-xs text-center p-2">❌ URL gambar tidak valid</div>';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={currentProduct.description || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSaveProduct} className="bg-amber-500 hover:bg-amber-600 text-white">
                {isEditMode ? 'Simpan Perubahan' : 'Tambah Produk'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
