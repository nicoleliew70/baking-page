export function EventSchema() {
  const events = [
    {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Adults Cheesecake Duo',
      description: 'Learn to make 2 full cheesecakes from scratch in a fun, hands-on session. Beginner-friendly with all ingredients and tools provided.',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0IbMFQfHtgJdSBNo3npYDbx7QoQUVyT5fzMoa1_TBBsImZv5TECQ3blhb85tYANNe-CIfNovO_sc2lpFTawOALul7w3KCzRBP0MbeJmYKWaME38zk18ei4de_VpWXNJRlKE2SMvba43kMmVmYvSeN76Dg4Ii5wq9c3iKvCLbr7VqetdqTWMR9kcW2Wwa-ptBXpR96NthV7IV3AEiQFnlBxjdTjf6U_VjtcH9C1pEBzdwsbWQ-SXOx5Cc-kbjWjROrexKdbafArS0A',
      startDate: '2026-04-01',
      endDate: '2026-12-31',
      eventDuration: 'PT3H',
      performer: {
        '@type': 'Person',
        name: 'Nicole Liew',
        jobTitle: 'Master Baker',
      },
      offers: {
        '@type': 'Offer',
        url: 'https://chefnicole.pages.dev/#calendar',
        price: '250',
        priceCurrency: 'MYR',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-04-01',
      },
      location: {
        '@type': 'Place',
        name: "Nicole's Baking Studio",
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Sandakan',
          addressLocality: 'Sandakan',
          addressRegion: 'Sabah',
          postalCode: '90000',
          addressCountry: 'MY',
        },
      },
      organizer: {
        '@type': 'Organization',
        name: "Nicole's Baking Studio",
        url: 'https://chefnicole.pages.dev',
        telephone: '+60113384841 2',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '45',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Teens Brownie & Ice Cream',
      description: 'Create delicious brownies and make your own vanilla ice cream from scratch. Perfect for teens aged 13-17.',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwjEi7RoPYBuRowqRK1sgndZFooPSJ2Pkq3cuA2GffKY4idCEloS7gWnZnKCra4TBrU9KgbmMwtyJjNT43EvPHFCcIWTFStQlIk4p5a-y8EEA5b_EXLwKwg72qE9q1Q8349BJ_8xAAhYaRF8hj1hvZ5nvQ3sBkNAaWjHFJqzRCPWhgC-pwF6DEJe39_i-sPb0JsruZIE30fK5DK3uBldMAWySqcbaP1porq3vPjaV4YO17SOmb7gm01DzZ8u6bo7hiH2k1pMIVI4_6',
      startDate: '2026-04-01',
      endDate: '2026-12-31',
      eventDuration: 'PT3H',
      performer: {
        '@type': 'Person',
        name: 'Nicole Liew',
        jobTitle: 'Master Baker',
      },
      offers: {
        '@type': 'Offer',
        url: 'https://chefnicole.pages.dev/#calendar',
        price: '200',
        priceCurrency: 'MYR',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-04-01',
      },
      location: {
        '@type': 'Place',
        name: "Nicole's Baking Studio",
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Sandakan',
          addressLocality: 'Sandakan',
          addressRegion: 'Sabah',
          postalCode: '90000',
          addressCountry: 'MY',
        },
      },
      organizer: {
        '@type': 'Organization',
        name: "Nicole's Baking Studio",
        url: 'https://chefnicole.pages.dev',
        telephone: '+60113384841 2',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Kids Cupcake Experience',
      description: 'Perfect for young bakers wanting to learn, create, and have fun in the kitchen. Ages 9-12.',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcamctGjQEdZXrzsPfc0j4YPGqXFPRN-yeSkWVF696BeMS_3zW7lWMZeZTGdhncabc0ENK8FIzeIv5pzlD9ttTWDqn8ff27Nu5DbDHAv_fMt6CGRpwoidB2OS5F7fuEHKL-nJVwNMqLdsytRW44wStDqxa3OY8f8qmChgy5ZZ7lne12H85tcpjL4yVEoYvk4FYhVqet5sS_D1kEenQpSmX-YEYowpKHjejhirt46eZz4PBpXhIA9erIC1UJfMRtPNaOaHMPqa5DVoL',
      startDate: '2026-04-01',
      endDate: '2026-12-31',
      eventDuration: 'PT3H',
      performer: {
        '@type': 'Person',
        name: 'Nicole Liew',
        jobTitle: 'Master Baker',
      },
      offers: {
        '@type': 'Offer',
        url: 'https://chefnicole.pages.dev/#calendar',
        price: '150',
        priceCurrency: 'MYR',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-04-01',
      },
      location: {
        '@type': 'Place',
        name: "Nicole's Baking Studio",
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Sandakan',
          addressLocality: 'Sandakan',
          addressRegion: 'Sabah',
          postalCode: '90000',
          addressCountry: 'MY',
        },
      },
      organizer: {
        '@type': 'Organization',
        name: "Nicole's Baking Studio",
        url: 'https://chefnicole.pages.dev',
        telephone: '+60113384841 2',
      },
    },
  ];

  return (
    <>
      {events.map((event, idx) => (
        <script
          key={`event-${idx}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }}
          suppressHydrationWarning
        />
      ))}
    </>
  );
}

export function FAQSchema() {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do I need baking experience to join?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No experience needed! Our classes are designed for complete beginners. Nicole will guide you through every step of the process.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is included in the class?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All ingredients, tools, and appliances are provided. You receive full recipes and get to take home everything you bake.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many students are in each class?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our classes are intimate with a maximum of 4 students per session, ensuring personalized guidance.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does a class last?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most classes are 3 hours long. This gives you plenty of time to learn and practice without feeling rushed.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are your class prices?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Kids classes are RM150, Teen classes are RM200, and Adult classes are RM250. Prices include all materials and take-home items.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I book a private group session?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We offer private events for larger groups. Contact us via WhatsApp at +60 11-3384 8412 to inquire about custom sessions.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      suppressHydrationWarning
    />
  );
}

export function BreadcrumbSchema() {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://chefnicole.pages.dev',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Experiences',
        item: 'https://chefnicole.pages.dev#classes',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Book Now',
        item: 'https://chefnicole.pages.dev#calendar',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      suppressHydrationWarning
    />
  );
}

export function PersonSchema() {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nicole Liew',
    jobTitle: 'Master Baker',
    url: 'https://chefnicole.pages.dev',
    image: 'https://chefnicole.pages.dev/reviewer.png',
    description: 'Founder and master baker at Nicole\'s Baking Studio. Dedicated to preserving traditional baking methods while embracing modern aesthetics.',
    affiliation: {
      '@type': 'Organization',
      name: "Nicole's Baking Studio",
      url: 'https://chefnicole.pages.dev',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      suppressHydrationWarning
    />
  );
}
