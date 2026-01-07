import { JsonLd } from '@/components/JsonLd';
import { MotionPager } from '@/components/MotionPager';

import { Hero } from '@/components/sections/Hero';
import { Info } from '@/components/sections/Info';

export default function Home() {
  return (
    <>
      <JsonLd />
      <MotionPager>
        <Hero />
        <Info />
      </MotionPager>
    </>
  );
}
