export const WORKSHOP_CONFIG = {
  pricing: {
    A: { 
      id: 'A',
      label: 'Kids Cupcake Class (9-12)', 
      group: 'Kids (9-12)', 
      price: 150, 
      priceInCents: 15000,
      time: '3pm - 6pm',
      duration: '3 Hours',
      description: 'Learn cupcake baking, icing & deco.'
    },
    B: { 
      id: 'B',
      label: 'Teens Brownie & Ice Cream (13-17)', 
      group: 'Teens (13-17)', 
      price: 180, 
      priceInCents: 18000,
      time: '7pm - 10pm',
      duration: '3 Hours',
      description: 'Bake delicious brownies and make your own vanilla ice cream.'
    },
    C: { 
      id: 'C',
      label: 'Adults Cheesecake Duo (18+)', 
      group: 'Adults (18+)', 
      price: 200, 
      priceInCents: 20000,
      time: '10am - 1pm',
      duration: '3 Hours',
      description: 'Master cotton cheesecake & no-bake cheesecake.'
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
