import { fetchCourseBySlug } from '../../actions';
import CourseDetailsContainer from './components';

export interface CourseDetailsPageProps {
  slug: string;
}

async function CourseDetailsPage({ slug }: CourseDetailsPageProps) {
  const courseDetails = await fetchCourseBySlug({
    slug,
  });

  return <CourseDetailsContainer courseDetails={courseDetails} />;
}

export default CourseDetailsPage;
