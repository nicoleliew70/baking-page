export const WORKSHOP_CONFIG = {
  pricing: {
    A: { 
      id: 'A',
      label: 'Kids Baking Fun', 
      group: 'Kids', 
      price: 150, 
      priceInCents: 15000,
      time: '3pm - 6pm',
      duration: '3 Hours',
      description: 'A joyful introduction to the kitchen for the little ones.'
    },
    B: { 
      id: 'B',
      label: 'Teens Sourdough Mastery', 
      group: 'Teens', 
      price: 250, 
      priceInCents: 25000,
      time: '7pm - 10pm',
      duration: '3 Hours',
      description: 'Master the rhythm of wild yeast and artisanal crusts.'
    },
    C: { 
      id: 'C',
      label: 'Classic French Pastry (AM)', 
      group: 'Adults', 
      price: 320, 
      priceInCents: 32000,
      time: '10am - 1pm',
      duration: '3 Hours',
      description: 'Delve into the art of butter, lamination, and silky creams.'
    },
    D: { 
      id: 'D',
      label: 'Sourdough Fundamentals (PM)', 
      group: 'Adults', 
      price: 250, 
      priceInCents: 25000,
      time: '2pm - 5pm',
      duration: '3 Hours',
      description: 'Learn hydration ratios and the secret to a perfect ear.'
    },
    E: { 
      id: 'E',
      label: 'Artisan Pastry Arts (Eve)', 
      group: 'Adults', 
      price: 320, 
      priceInCents: 32000,
      time: '7pm - 10pm',
      duration: '3 Hours',
      description: 'Advanced techniques for the modern home baker.'
    },
  },
  general: {
    maxCapacity: 4,
    currency: 'MYR',
    whatsappNumber: '601133848412',
    adminEmail: 'chefnicolelsv@gmail.com',
    cancellationPolicy: 'Refunds are provided if cancelled 48 hours prior to the session. No-shows are non-refundable.'
  }
} as const;

export type SlotId = keyof typeof WORKSHOP_CONFIG.pricing;
