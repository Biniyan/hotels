import { Order } from '../types/restaurant';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';

export const INITIAL_REAL_ORDERS: Order[] = [
  {
    id: 'ord_sample_9841',
    orderNumber: 'MAH-892401',
    userId: 'guest',
    customerName: 'Aditya Verma',
    customerPhone: '+91 98110 54321',
    bookingType: 'delivery',
    items: [
      {
        cartItemId: 'maheswari_paneer_butter_masala_full_spice1_',
        menuItem: {
          id: 'maheswari_paneer_butter_masala',
          name: 'Maheswari Paneer Butter Masala (Shahi Makhani)',
          hindiName: 'माहेश्वरी पनीर बटर मसाला',
          menuSection: 'all_day',
          category: 'curries',
          description:
            'Clay-oven smoked malai paneer simmered in a rich velvety gravy of vine-ripened tomatoes, fresh churned butter, and fragrant fenugreek.',
          price: 465,
          halfPrice: 285,
          dietary: 'veg',
          spiceLevel: 1,
          rating: 4.95,
          reviewsCount: 382,
          image: '/src/assets/images/dish_butter_chicken_curry_1792103747214.webp',
        },
        portion: 'full',
        spiceLevel: 1,
        quantity: 1,
        unitPrice: 465,
        itemTotal: 465,
      },
      {
        cartItemId: 'royal_dum_biryani_full_spice2_',
        menuItem: {
          id: 'royal_dum_biryani',
          name: 'Royal Maheswari Veg Dum Biryani',
          hindiName: 'रॉयल माहेश्वरी वेज दम बिरयानी',
          menuSection: 'all_day',
          category: 'biryani',
          description:
            'Aged long-grain basmati sealed in earthen deg with fragrant saffron, mace, malai paneer, and fresh garden vegetables.',
          price: 450,
          dietary: 'veg',
          spiceLevel: 2,
          rating: 4.95,
          reviewsCount: 420,
          image: '/src/assets/images/dish_royal_dum_biryani_1792103749027.webp',
        },
        portion: 'full',
        spiceLevel: 2,
        quantity: 1,
        unitPrice: 450,
        itemTotal: 450,
      },
    ],
    subtotal: 915,
    gstAmount: 45.75,
    deliveryFee: 0,
    discountAmount: 50,
    discountCode: 'ROYAL50',
    grandTotal: 910.75,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    orderStatus: 'cooking',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    estimatedDeliveryMinutes: 20,
    deliveryAddress: 'Flat 4B, Barakhamba Road, Connaught Place, New Delhi',
    geofenceDistanceKm: 0.6,
  },
];

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const results: Order[] = [];
    snapshot.forEach((d) => {
      results.push(d.data() as Order);
    });
    if (results.length > 0) return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'orders');
  }

  // Local storage fallback
  try {
    const raw = localStorage.getItem('shankar_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage order read error:', e);
  }

  return INITIAL_REAL_ORDERS;
}

export async function saveOrderToFirestore(order: Order, userId?: string): Promise<boolean> {
  const path = `orders/${order.id}`;
  try {
    const orderDoc = doc(db, 'orders', order.id);
    const payload = userId ? { ...order, userId } : order;
    await setDoc(orderDoc, payload);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    try {
      const raw = localStorage.getItem('shankar_orders');
      const list: Order[] = raw ? JSON.parse(raw) : [];
      list.unshift(order);
      localStorage.setItem('shankar_orders', JSON.stringify(list));
      return true;
    } catch {
      return false;
    }
  }
}
