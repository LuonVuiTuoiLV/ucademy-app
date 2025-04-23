'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { commonClassNames } from '@/constants';
import { ILesson } from '@/database/lesson.model';
import { createLecture, updateLecture } from '@/lib/actions/lecture.actions';
import { createLesson, updateLesson } from '@/lib/actions/lesson.actions';
import { cn } from '@/lib/utils';
import { MouseEvent, useState } from 'react';
import { toast } from 'react-toastify';
import slugify from 'slugify';
import Swal from 'sweetalert2';
import { IconCancel, IconCheck, IconDelete, IconEdit } from '../icons';
import LessonItemUpdate from '../lesson/LessonItemUpdate';
import { TCourseUpdateParams, TUpdateCourseLecture } from '../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const CourseUpdateContent = ({ course }: { course: TCourseUpdateParams }) => {
  const lectures = course.lectures;
  const [lectureEdit, setLectureEdit] = useState('');
  const [lectureIdEdit, setLectureIdEdit] = useState('');
  const [lessonEdit, setLessonEdit] = useState('');
  const [lessonIdEdit, setLessonIdEdit] = useState('');

  const handleAddNewLecture = async () => {
    try {
      const res = await createLecture({
        title: 'Chương mới',
        course: course._id,
        order: lectures.length + 1,
        path: `/manage/course/update-content?slug=${course.slug}`,
      });
      if (res?.success) {
        toast.success('Thêm chương mới thành công!');
      }
    } catch (error) {
      console.log('🚀 ~ handleAddNewLecture ~ error:', error);
    }
  };

  const handleDeleteLecture = async (
    e: MouseEvent<HTMLSpanElement>,
    lectureId: string
  ) => {
    e.stopPropagation();
    try {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await updateLecture({
            lectureId,
            updateData: {
              _destroy: true,
              path: `/manage/course/update-content?slug=${course.slug}`,
            },
          });
        }
      });
    } catch (error) {
      console.log('🚀 ~ CourseUpdateContent ~ error:', error);
    }
  };

  const handleUpdateLecture = async (
    e: MouseEvent<HTMLSpanElement>,
    lectureId: string
  ) => {
    e.stopPropagation();
    try {
      const res = await updateLecture({
        lectureId,
        updateData: {
          title: lectureEdit,
          path: `/manage/course/update-content?slug=${course.slug}`,
        },
      });
      if (res?.success) {
        toast.success('Cập nhật thành công');
        setLectureEdit('');
        setLectureIdEdit('');
      }
    } catch (error) {
      console.log('🚀 ~ CourseUpdateContent ~ error:', error);
    }
  };

  const handleAddNewLesson = async (lectureId: string, courseId: string) => {
    try {
      const res = await createLesson({
        path: `/manage/course/update-content?slug=${course.slug}`,
        lecture: lectureId,
        course: courseId,
        title: 'Tiêu đề bài học mới',
        slug: `tieu-de-bai-hoc-moi-${new Date()
          .getTime()
          .toString()
          .slice(-3)}`,
      });
      if (res?.success) {
        toast.success('Thêm bài học mới thành công');
        return;
      }
      toast.error('Thêm bài học mới thất bại!');
    } catch (error) {
      console.log('🚀 ~ handleAddNewLesson ~ error:', error);
    }
  };

  const handleUpdateLesson = async (
    e: MouseEvent<HTMLSpanElement>,
    lessonId: string
  ) => {
    e.stopPropagation();
    try {
      const res = await updateLesson({
        lessonId,
        path: `/manage/course/update-content?slug=${course.slug}`,
        updateDate: {
          title: lessonEdit,
          slug: slugify(lessonEdit, {
            lower: true,
            locale: 'vi',
            remove: /[*+~.()'"!:@]/g,
          }),
        },
      });
      if (res?.success) {
        toast.success('Cập nhật bài học thành công!');
        setLessonEdit('');
        setLessonIdEdit('');
      }
    } catch (error) {
      console.log('🚀 ~ CourseUpdateContent ~ error:', error);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-5">
        {lectures.map((lecture: TUpdateCourseLecture) => (
          <div key={lecture._id}>
            <Accordion
              type="single"
              collapsible={!lectureIdEdit}
              className="w-full"
            >
              <AccordionItem value={lecture._id}>
                <AccordionTrigger>
                  <div className="flex items-center gap-3 w-full justify-between pr-5">
                    {lecture._id === lectureIdEdit ? (
                      <>
                        <div className="w-full">
                          <Input
                            placeholder="Tên chương"
                            defaultValue={lecture.title}
                            onChange={(e) => setLectureEdit(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={cn(
                              commonClassNames.action,
                              'text-green-500 hover:text-green-700'
                            )}
                            onClick={(e) => handleUpdateLecture(e, lecture._id)}
                          >
                            <IconCheck />
                          </span>
                          <span
                            className={cn(
                              commonClassNames.action,
                              'text-red-500 hover:text-red-700'
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setLectureIdEdit('');
                            }}
                          >
                            <IconCancel />
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="">{lecture.title}</div>
                        <div className="flex gap-2">
                          <span
                            className={cn(
                              commonClassNames.action,
                              'text-blue-500 hover:text-blue-700'
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setLectureIdEdit(lecture._id);
                            }}
                          >
                            <IconEdit />
                          </span>
                          <span
                            className={cn(
                              commonClassNames.action,
                              'text-red-500 hover:text-red-700'
                            )}
                            onClick={(e) => handleDeleteLecture(e, lecture._id)}
                          >
                            <IconDelete />
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-none !bg-transparent">
                  <div className="flex flex-col gap-5">
                    {lecture.lessons.map((lesson: ILesson) => (
                      <Accordion
                        type="single"
                        collapsible={!lessonEdit}
                        key={lesson._id}
                      >
                        <AccordionItem value={lesson._id}>
                          <AccordionTrigger>
                            <div className="flex items-center gap-3 w-full justify-between pr-5">
                              {lesson._id === lessonIdEdit ? (
                                <>
                                  <div className="w-full">
                                    <Input
                                      placeholder="Tên bài học"
                                      defaultValue={lesson.title}
                                      onChange={(e) =>
                                        setLessonEdit(e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <span
                                      className={cn(
                                        commonClassNames.action,
                                        'text-green-500 hover:text-green-700'
                                      )}
                                      onClick={(e) =>
                                        handleUpdateLesson(e, lesson._id)
                                      }
                                    >
                                      <IconCheck />
                                    </span>
                                    <span
                                      className={cn(
                                        commonClassNames.action,
                                        'text-red-500 hover:text-red-700'
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setLessonIdEdit('');
                                      }}
                                    >
                                      <IconCancel />
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="">{lesson.title}</div>
                                  <div className="flex gap-2">
                                    <span
                                      className={cn(
                                        commonClassNames.action,
                                        'text-blue-500 hover:text-blue-700'
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setLessonIdEdit(lesson._id);
                                      }}
                                    >
                                      <IconEdit />
                                    </span>
                                    <span
                                      className={cn(
                                        commonClassNames.action,
                                        'text-red-500 hover:text-red-700'
                                      )}
                                      // onClick={(e) =>
                                      //   handleDeleteLesson(e, lecture._id)
                                      // }
                                    >
                                      <IconDelete />
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <LessonItemUpdate
                              lesson={lesson}
                            ></LessonItemUpdate>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button
              onClick={() => handleAddNewLesson(lecture._id, course._id)}
              className="mt-5 ml-auto w-fit block"
            >
              Thêm bài học
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={handleAddNewLecture} className="mt-5">
        Thêm chương mới
      </Button>
    </div>
  );
};

export default CourseUpdateContent;
