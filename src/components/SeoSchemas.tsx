import { BAKING_CLASSES } from '@/lib/classes';

export function ClassSchema() {
  const classes = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: BAKING_CLASSES.map((cls, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Course',
        name: cls.title,
        description: cls.description,
        image: `https://kitchen.teachernicoleacademy.com${cls.image}`,
        url: 'https://kitchen.teachernicoleacademy.com/#classes',
        provider: {
          '@type': 'Organization',
          name: "Nicole's Baking Studio",
          url: 'https://kitchen.teachernicoleacademy.com',
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(classes) }}
      suppressHydrationWarning
    />
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
          text: 'Class duration depends on what you would like to learn. Contact Nicole on WhatsApp for class details and available dates.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are your class prices?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Contact Nicole on WhatsApp at +60 11-3384 8412 for class details, available dates, and fees.',
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
        item: 'https://kitchen.teachernicoleacademy.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Experiences',
        item: 'https://kitchen.teachernicoleacademy.com#classes',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Class Enquiries',
        item: 'https://kitchen.teachernicoleacademy.com#calendar',
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
    url: 'https://kitchen.teachernicoleacademy.com',
    image: 'https://kitchen.teachernicoleacademy.com/reviewer.png',
    description: 'Founder and master baker at Nicole\'s Baking Studio. Dedicated to preserving traditional baking methods while embracing modern aesthetics.',
    affiliation: {
      '@type': 'Organization',
      name: "Nicole's Baking Studio",
      url: 'https://kitchen.teachernicoleacademy.com',
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
