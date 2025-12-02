// User Types
export type UserRole = 'admin' | 'user' | 'teknisi';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

// Product Types
export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  stock: number;
  image_url?: string;
  description?: string;
  category?: Category;
}

// Voucher Types
export type VoucherType = 'percentage' | 'fixed';

export interface Voucher {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: VoucherType;
  value: number;
  min_purchase: number;
  max_discount?: number;
  quota: number;
  used: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoucherUsage {
  id: string;
  voucher_id: string;
  user_id: string;
  order_id: string;
  discount_amount: number;
  used_at: string;
  voucher?: Voucher;
}

// Order Types
export type OrderStatus = 'pending' | 'dikirim' | 'selesai' | 'dibatalkan';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItemDetail {
  id?: string;
  product_id?: string;
  product_name?: string;
  name?: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  midtrans_order_id?: string;
  total_amount: number;
  subtotal?: number;
  discount_amount?: number;
  voucher_id?: string;
  voucher_code?: string;
  payment_method: string;
  payment_status?: PaymentStatus;
  status: OrderStatus;
  created_at: string;
  customer_info?: CustomerInfo;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  cancel_reason?: string;
  cancelled_at?: string;
  items?: OrderItemDetail[];
  order_items?: OrderItem[];
  user?: User;
  voucher?: Voucher;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

// Target/CRM Types
export type TargetStatus = 'active' | 'achieved';

export interface Target {
  id: string;
  user_id: string;
  target_amount: number;
  current_amount: number;
  status: TargetStatus;
  reward?: string;
  reward_claimed: boolean;
  user?: User;
}

// Teknisi Types
export type TeknisiStatus = 'active' | 'inactive';

export interface Teknisi {
  id: string;
  name: string;
  username: string;
  password_hash?: string;
  phone?: string;
  email?: string;
  specialization?: string;
  status: TeknisiStatus;
  created_at: string;
  updated_at: string;
}

// Booking Types
export type BookingStatus = 'baru' | 'proses' | 'selesai';
export type ProgressStatus = 'pending' | 'diagnosed' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  user_id: string;
  teknisi_id?: string;
  device_name: string;
  issue: string;
  booking_date: string;
  status: BookingStatus;
  notes?: string;
  service_code?: string;
  progress_status?: ProgressStatus;
  progress_notes?: string;
  estimated_completion?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  teknisi?: Teknisi;
}

export interface ServiceProgress {
  id: string;
  booking_id: string;
  description: string;
  progress_status: string;
  created_at: string;
  updated_at: string;
}

// Complaint Types (also used for Reviews)
export type ComplaintStatus = 'belum dibaca' | 'dibaca' | 'dibalas';

export interface Complaint {
  id: string;
  user_id: string;
  order_id?: string;
  product_id?: string;
  message: string;
  rating?: number; // 1-5 stars for product reviews
  reply?: string;
  status: ComplaintStatus;
  created_at: string;
  user?: User;
  order?: Order;
  product?: Product;
}

// Technician Types
export interface Technician {
  id: string;
  name: string;
  phone: string;
  status: 'aktif' | 'tidak aktif';
}

// Cart Types (client-side only)
export interface CartItem {
  product: Product;
  quantity: number;
}
