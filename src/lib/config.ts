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
      description: 'Learn cupcake baking, icing & deco. Perfect for young bakers who want to learn, create, and have fun in the kitchen.'
    },
    B: { 
      id: 'B',
      label: 'Teens Brownie & Ice Cream (13-17)', 
      group: 'Teens (13-17)', 
      price: 200, 
      priceInCents: 20000,
      time: '7pm - 10pm',
      duration: '3 Hours',
      description: 'Bake delicious brownies and make your own vanilla ice cream. A hands-on baking experience designed for teens who love desserts and creativity.'
    },
    C: { 
      id: 'C',
      label: 'Adults Cheesecake Duo (Morning)', 
      group: 'Adults (18+)', 
      price: 250, 
      priceInCents: 25000,
      time: '10am - 1pm',
      duration: '3 Hours',
      description: 'Master cotton & no-bake cheesecake. A cozy small-group baking workshop where you learn, bake, and enjoy a relaxing experience.'
    },
    D: { 
      id: 'D',
      label: 'Adults Cheesecake Duo (Afternoon)', 
      group: 'Adults (18+)', 
      price: 250, 
      priceInCents: 25000,
      time: '2pm - 5pm',
      duration: '3 Hours',
      description: 'Master cotton & no-bake cheesecake. A cozy small-group baking workshop where you learn, bake, and enjoy a relaxing experience.'
    },
    E: { 
      id: 'E',
      label: 'Adults Cheesecake Duo (Evening)', 
      group: 'Adults (18+)', 
      price: 250, 
      priceInCents: 25000,
      time: '7pm - 10pm',
      duration: '3 Hours',
      description: 'Master cotton & no-bake cheesecake. A cozy small-group baking workshop where you learn, bake, and enjoy a relaxing experience.'
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
