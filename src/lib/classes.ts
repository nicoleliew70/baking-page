export const BAKING_CLASSES = [
  {
    title: 'Pastry Classes',
    description: 'Discover the art of delicate, golden pastries. Learn hands-on techniques for working with dough, shaping, and baking with guidance from Nicole.',
    image: '/pastries-class.webp',
    imageAlt: 'Golden croissants and nut-topped pastries on a wooden board',
    photographer: 'Precious Madubuike',
    photoUrl: 'https://unsplash.com/photos/delicious-croissants-are-displayed-in-a-bakery-lucquItr1NY',
  },
  {
    title: 'Cookie Classes',
    description: 'Bake cookies full of flavour and character. Explore mixing, shaping, and baking techniques to create delicious treats you can make again at home.',
    image: '/cookies-class.webp',
    imageAlt: 'Freshly baked chocolate cookies on a baking tray',
    photographer: 'charlesdeluvio',
    photoUrl: 'https://unsplash.com/photos/chocolate-chip-cookies-Ms9xBg3Gtr8',
  },
  {
    title: 'Cake Classes',
    description: 'Create a cake to be proud of, from mixing and baking to finishing touches. Build your confidence with step-by-step guidance in a relaxed, hands-on class.',
    image: '/cakes-class.webp',
    imageAlt: 'A white cake decorated with swirls of frosting on a cake stand',
    photographer: 'Jonathan Borba',
    photoUrl: 'https://unsplash.com/photos/a-white-frosted-cake-with-swirled-icing-on-a-stand-AAAX_mN2-SE',
  },
] as const;

export function getClassEnquiryUrl(classTitle?: string) {
  const message = classTitle
    ? `Hi Nicole! I’m interested in your ${classTitle}. Could you share the class details, available dates, and fees?`
    : 'Hi Nicole! I’m interested in your baking classes. Could you share the class details, available dates, and fees?';
  return `https://wa.me/601133848412?text=${encodeURIComponent(message)}`;
}
