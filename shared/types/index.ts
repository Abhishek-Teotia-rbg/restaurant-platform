// Shared TypeScript interfaces and types for the platform

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'staff';
  photoURL?: string;
  addresses: Address[];
  wallet: Wallet;
  loyaltyPoints: number;
  createdAt: FirebaseFirestore.Timestamp;
  lastLogin: FirebaseFirestore.Timestamp;
}

export interface Address {
  id: string;
  label: string;
  address: string;
  coordinates: FirebaseFirestore.GeoPoint;
  isDefault: boolean;
}

export interface Wallet {
  balance: number;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: FirebaseFirestore.Timestamp;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string;
  address: string;
  coordinates: FirebaseFirestore.GeoPoint;
  phone: string;
  email: string;
  gst: string;
  fssai: string;
  isOpen: boolean;
  isBusy: boolean;
  openingHours: OpeningHours;
  deliveryRadius: number;
  minOrderValue: number;
  avgDeliveryTime: number;
  rating: number;
  totalRatings: number;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  images: string[];
  basePrice: number;
  veg: boolean;
  spiceLevel: number;
  prepTime: number;
  calories: number;
  allergens: string[];
  variants: MenuVariant[];
  addons: MenuAddon[];
  available: boolean;
  featured: boolean;
  bestseller: boolean;
  rating: number;
  totalRatings: number;
  availableFor: string[];
  createdAt: FirebaseFirestore.Timestamp;
}

export interface MenuVariant {
  name: string;
  price: number;
}

export interface MenuAddon {
  name: string;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  orderType: 'delivery' | 'pickup' | 'dine-in';
  tableNumber?: string;
  deliveryAddress?: Address;
  scheduledFor?: FirebaseFirestore.Timestamp;
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryCharge: number;
  gst: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  refundAmount?: number;
  notes?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  variant?: string;
  addons: string[];
  price: number;
  specialInstructions?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: FirebaseFirestore.Timestamp;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount: number;
  minOrderValue: number;
  validFrom: FirebaseFirestore.Timestamp;
  validTo: FirebaseFirestore.Timestamp;
  usageLimit: number;
  usagePerUser: number;
  usedCount: number;
  applicableTo: {
    categories: string[];
    items: string[];
  };
  firstOrderOnly: boolean;
  isActive: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Review {
  id: string;
  userId: string;
  orderId: string;
  restaurantId: string;
  menuItemId: string;
  rating: number;
  comment: string;
  images: string[];
  helpful: number;
  response?: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  image: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Staff {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'kitchen_manager' | 'delivery_manager' | 'support';
  restaurantId: string;
  permissions: string[];
  shift: {
    start: string;
    end: string;
  };
  isActive: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Table {
  id: string;
  restaurantId: string;
  tableNumber: string;
  qrCode: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Inventory {
  id: string;
  restaurantId: string;
  itemName: string;
  unit: string;
  currentStock: number;
  threshold: number;
  lastRestocked: FirebaseFirestore.Timestamp;
  linkedMenuItems: string[];
}
