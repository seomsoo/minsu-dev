import { JsonLd } from '@/components/JsonLd';
import { ScrollContainer } from '@/components/ScrollContainer';
import { Hero } from '@/components/sections/Hero';
import { Info } from '@/components/sections/Info';

export default function Home() {
  return (
    <>
      <JsonLd />
      <ScrollContainer>
        <Hero />
        <Info />
      </ScrollContainer>
    </>
  );
}
