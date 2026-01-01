import { PROFILE, PROJECTS } from '@/constants/data';

const SITE_URL = 'https://seominsu.dev';

export const JsonLd = () => {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PROFILE.name,
    alternateName: PROFILE.nameEn,
    url: SITE_URL,
    email: PROFILE.email,
    jobTitle: PROFILE.position,
    sameAs: [PROFILE.github],
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
    name: `${PROFILE.name} 포트폴리오`,
    url: SITE_URL,
    author: {
      '@type': 'Person',
      name: PROFILE.name,
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
        url: project.link || project.github,
        codeRepository: project.github,
        programmingLanguage: project.tags,
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
