import { ComingSoonPage } from '@/modules/course/pages/coming-soon';
import { Heading } from '@/shared/components/common';
import { QuerySearchParams } from '@/shared/types';

const ComingSoonPageRoot = ({ searchParams }: QuerySearchParams) => {
  return (
    <>
      <Heading>Sắp ra mắt</Heading>
      <ComingSoonPage searchParams={searchParams} />
    </>
  );
};

export default ComingSoonPageRoot;
