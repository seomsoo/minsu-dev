import { AUTHOR, PROJECTS } from '@/content/resume';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://seominsu.dev';

export const JsonLd = () => {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR.name,
    alternateName: AUTHOR.nameEn,
    url: SITE_URL,
    email: AUTHOR.email,
    jobTitle: AUTHOR.position,
    sameAs: [AUTHOR.github],
    knowsAbout: [
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript',
      'Tailwind CSS',
      'Frontend Development',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${AUTHOR.name} 포트폴리오`,
    url: SITE_URL,
    author: {
      '@type': 'Person',
      name: AUTHOR.name,
    },
  };

  const projectsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: PROJECTS.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareSourceCode',
        name: project.name,
        description: project.summary,
        url: project.link || project.github,
        codeRepository: project.github,
        dateCreated: project.date,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsSchema) }}
      />
    </>
  );
};
