import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import {
  getAllOrders,
  getUserOrders,
  createOrder,
  updateOrderStatus,
  getAllReservations,
  createReservation,
  updateReservationStatus,
  getRestaurantSettings,
  updateRestaurantSettings,
  getAdminAnalytics,
  getOrCreateUser,
} from './src/db/queries.ts';
import { requireAuth, requireAdmin, AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// ======================= API ROUTES =======================

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Restaurant Public Settings
app.get('/api/settings', async (_req, res) => {
  try {
    const settings = await getRestaurantSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch settings' });
  }
});

// Update Restaurant Settings (Admin Only)
app.put('/api/admin/settings', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const updated = await updateRestaurantSettings(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update settings' });
  }
});

// 3. User Sync & Profile
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(
      user.uid,
      user.email || '',
      user.name,
      user.phone_number
    );
    res.json({
      uid: user.uid,
      email: user.email,
      name: dbUser.name || user.name,
      role: dbUser.role || (user.email === 'tejsinghsaud70@gmail.com' ? 'admin' : 'customer'),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Sync failed' });
  }
});

// 4. Orders API
app.get('/api/orders', async (req: AuthRequest, res) => {
  try {
    const authHeader = req.headers.authorization;
    const status = req.query.status as string | undefined;

    // Check if admin token is present
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        await requireAuth(req, res, async () => {
          const isOwner = req.user?.email === 'tejsinghsaud70@gmail.com';
          const isAdmin = req.userRole === 'admin' || isOwner;

          if (isAdmin) {
            const allOrders = await getAllOrders(status);
            return res.json(allOrders);
          } else if (req.user?.uid) {
            const userOrders = await getUserOrders(req.user.uid);
            return res.json(userOrders);
          }
        });
        return;
      } catch {
        // Fall back to query param or public list
      }
    }

    const userId = req.query.userId as string;
    if (userId) {
      const userOrders = await getUserOrders(userId);
      return res.json(userOrders);
    }

    const publicOrders = await getAllOrders(status);
    res.json(publicOrders);
  } catch (error: any) {
    console.error('API orders error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const saved = await createOrder(req.body);
    res.status(201).json(saved);
  } catch (error: any) {
    console.error('API create order error:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const updated = await updateOrderStatus(id, status);
    res.json(updated);
  } catch (error: any) {
    console.error('API update order status error:', error);
    res.status(500).json({ error: error.message || 'Failed to update order' });
  }
});

// 5. Reservations API
app.get('/api/reservations', async (req: AuthRequest, res) => {
  try {
    const all = await getAllReservations();
    res.json(all);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch reservations' });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const saved = await createReservation(req.body);
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create reservation' });
  }
});

app.patch('/api/reservations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await updateReservationStatus(id, status);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update reservation' });
  }
});

// 6. Admin Analytics
app.get('/api/admin/analytics', async (_req, res) => {
  try {
    const analytics = await getAdminAnalytics();
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch analytics' });
  }
});

// ======================= FRONTEND SERVING =======================

async function startServer() {
  if (!isProd) {
    // Mount Vite dev server in middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static build
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();
