export const WORKSHOP_CONFIG = {
  pricing: {
    A: { 
      id: 'A',
      label: 'Kids Cupcake Experience (9-12)', 
      group: 'Kids (9-12)', 
      price: 150, 
      priceInCents: 15000,
      time: '3pm - 6pm',
      duration: '3 Hours',
      description: 'Perfect for young bakers wanting to learn, create, and have fun in the kitchen!<br/><br/>✔ 3 hour guided experience<br/>✔ Beginner-friendly (no experience needed)<br/>✔ All ingredients & tools provided<br/>✔ Take home everything you make<br/>✔ Small group (max 4 students)'
    },
    B: { 
      id: 'B',
      label: 'Teens Brownie & Ice Cream (13-17)', 
      group: 'Teens (13-17)', 
      price: 200, 
      priceInCents: 20000,
      time: '7pm - 10pm',
      duration: '3 Hours',
      description: 'Create delicious brownies and make your own vanilla ice cream from scratch!<br/><br/>✔ 3 hour guided experience<br/>✔ Beginner-friendly (no experience needed)<br/>✔ All ingredients & tools provided<br/>✔ Take home everything you make<br/>✔ Small group (max 4 students)'
    },
    C: { 
      id: 'C',
      label: 'Adults Cheesecake Duo (Morning)', 
      group: 'Adults (18+)', 
      price: 250, 
      priceInCents: 25000,
      time: '10am - 1pm',
      duration: '3 Hours',
      description: 'Learn to make **2 full cheesecakes from scratch** in a fun, hands-on session<br/><br/>✔ 3–4 hour guided experience<br/>✔ Beginner-friendly (no experience needed)<br/>✔ All ingredients & tools provided<br/>✔ Take home everything you make<br/>✔ Small group (max 4 students)'
    },
    D: { 
      id: 'D',
      label: 'Adults Cheesecake Duo (Afternoon)', 
      group: 'Adults (18+)', 
      price: 250, 
      priceInCents: 25000,
      time: '2pm - 5pm',
      duration: '3 Hours',
      description: 'Learn to make **2 full cheesecakes from scratch** in a fun, hands-on session<br/><br/>✔ 3–4 hour guided experience<br/>✔ Beginner-friendly (no experience needed)<br/>✔ All ingredients & tools provided<br/>✔ Take home everything you make<br/>✔ Small group (max 4 students)'
    },
    E: { 
      id: 'E',
      label: 'Adults Cheesecake Duo (Evening)', 
      group: 'Adults (18+)', 
      price: 250, 
      priceInCents: 25000,
      time: '7pm - 10pm',
      duration: '3 Hours',
      description: 'Learn to make **2 full cheesecakes from scratch** in a fun, hands-on session<br/><br/>✔ 3–4 hour guided experience<br/>✔ Beginner-friendly (no experience needed)<br/>✔ All ingredients & tools provided<br/>✔ Take home everything you make<br/>✔ Small group (max 4 students)'
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
