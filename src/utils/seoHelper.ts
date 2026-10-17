/**
 * Dynamic Per-Page / Per-View SEO & Document Metadata Manager
 * Optimizes titles, meta descriptions, and social preview cards for each view.
 */

export interface PageMetaConfig {
  title: string;
  description: string;
  hash: string;
}

export const PAGE_SEO_REGISTRY: Record<string, PageMetaConfig> = {
  home: {
    title: 'Maheswari Multi Cuisine Restaurant – 100% Pure Vegetarian Royal Dining',
    description:
      'Authentic 100% pure vegetarian royal dining in Connaught Place, New Delhi. Charcoal dum biryani, handi paneer butter masala, live tandoor breads, express online ordering & table booking.',
    hash: '',
  },
  menu: {
    title: 'Royal Pure Vegetarian Menu – Maheswari Multi Cuisine Restaurant',
    description:
      'Explore our authentic 100% pure vegetarian menu: Shahi Paneer Butter Masala, Awadhi Dum Biryani, Clay-Tandoor Breads, and Dal Bukhara in Connaught Place.',
    hash: 'menu',
  },
  heritage: {
    title: 'Our Heritage & 50-Year Legacy – Maheswari Multi Cuisine Restaurant',
    description:
      'Discover 50+ years of royal culinary tradition in Connaught Place. Slow charcoal-smoldered handi curries and pure desi ghee recipes since 1974.',
    hash: 'heritage',
  },
  reservations: {
    title: 'Table Reservations & Royal Baithak Dining – Maheswari Restaurant',
    description:
      'Book a royal dining table or private Baithak at Maheswari Multi Cuisine Restaurant in Connaught Place, New Delhi. Instant confirmation & guest preferences.',
    hash: 'reservations',
  },
  catering: {
    title: 'Pure Veg Royal Event & Wedding Catering – Maheswari Restaurant',
    description:
      'Full-service pure vegetarian catering for weddings, family celebrations, and corporate galas in Delhi NCR. Live clay tandoors and copperware chafing spreads.',
    hash: 'catering',
  },
  gallery: {
    title: 'Visual Photo Gallery & Royal Dining Ambiance – Maheswari Restaurant',
    description:
      'Browse high-resolution photographs of our royal dining halls, clay-tandoor kitchens, handcrafted curries, and heritage Indian decor in Connaught Place.',
    hash: 'gallery',
  },
  buffet: {
    title: 'Royal Buffet vs. Imperial Thali Dining Guide – Maheswari Restaurant',
    description:
      'Detailed comparison of our Grand Lunch Buffet versus Traditional Imperial Thali dining experience with course-by-course details and pricing.',
    hash: 'buffet',
  },
  faqs: {
    title: 'Frequently Asked Questions (FAQs) – Maheswari Multi Cuisine Restaurant',
    description:
      'Answers to common guest questions about our 100% pure vegetarian discipline, Jain preparations without onion/garlic, table reservations, and delivery radius.',
    hash: 'faqs',
  },
  allergens: {
    title: 'Allergen Matrix & Dietary Transparency Guide – Maheswari Restaurant',
    description:
      'Comprehensive dietary and allergen transparency table detailing dairy, nut, gluten, mustard, and soy indicators for all culinary dishes.',
    hash: 'allergens',
  },
  careers: {
    title: 'Royal Culinary Careers & Hospitality Apprenticeships – Maheswari Restaurant',
    description:
      'Join our culinary team at Maheswari Restaurant in Connaught Place. Explore openings for Head Halwai, Tandoor Master, Service Captains, and Mixologists.',
    hash: 'careers',
  },
  contact: {
    title: 'Contact Concierge & Directions – Maheswari Multi Cuisine Restaurant',
    description:
      'Get in touch with our front-desk concierge in Connaught Place, New Delhi. Phone hotline: +91 98110 23456. Daily: 12:00 PM – 11:30 PM.',
    hash: 'contact',
  },
  location: {
    title: 'Location, Metro Directions & Valet Parking – Maheswari Restaurant',
    description:
      'Visit Maheswari Multi Cuisine Restaurant at Block M, Outer Circle, Connaught Place, New Delhi. Metro Rajiv Chowk Gate 2 with complimentary valet parking.',
    hash: 'location',
  },
  about: {
    title: 'About Us, Master Chefs & Philosophy – Maheswari Restaurant',
    description:
      'Learn about our culinary founders, master clay-tandoor artisans, and uncompromising dedication to 100% pure vegetarian gastronomy.',
    hash: 'about',
  },
  cart: {
    title: 'Your Royal Order Bag – Maheswari Multi Cuisine Restaurant',
    description:
      'Review your hand-selected dishes, select delivery or takeaway, apply promo codes, and proceed to secure geofenced kitchen checkout.',
    hash: 'cart',
  },
  orders: {
    title: 'Your Order History & Live Kitchen Tracker – Maheswari Restaurant',
    description:
      'Track live order preparation, review past dining receipts, and easily 1-click reorder your favorite delicacies.',
    hash: 'orders',
  },
  call: {
    title: 'Call to Order & Instant Phone Concierge – Maheswari Restaurant',
    description:
      'Direct priority telephone and WhatsApp hotlines to place express orders or customize banquets with our head concierge.',
    hash: 'call',
  },
  admin: {
    title: 'Restaurant Operations & Kitchen Console – Maheswari Restaurant',
    description:
      'Live Kitchen Display System (KDS), table booking allocations, gross revenue metrics, and restaurant operations console.',
    hash: 'admin',
  },
};

/**
 * Updates DOM title, meta description, and OpenGraph/Twitter tags for the given page route.
 */
export function updatePageSEO(routeKey: string) {
  if (typeof document === 'undefined') return;

  const config = PAGE_SEO_REGISTRY[routeKey] || PAGE_SEO_REGISTRY.home;

  // 1. Page Title
  document.title = config.title;

  // 2. Meta Description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', config.description);
  }

  // 3. OpenGraph Tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', config.title);
  }
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    ogDesc.setAttribute('content', config.description);
  }

  // 4. Twitter Tags
  const twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) {
    twTitle.setAttribute('content', config.title);
  }
  const twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) {
    twDesc.setAttribute('content', config.description);
  }
}
