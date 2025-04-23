'use client';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { commonClassNames, courseStatus } from '@/constants';
import { ICourse } from '@/database/course.model';
import useQueryString from '@/hooks/useQueryString';
import { updateCourse } from '@/lib/actions/course.actions';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { BouncedLink, Heading, TableAction, TableActionIcon } from '../common';
import { IconLeftArrow, IconRightArrow } from '../icons';
import { ECourseStatus } from '../types/enums';
import { Input } from '../ui/input';

const CourseManage = ({ courses }: { courses: ICourse[] }) => {
  const { createQueryString, router, pathname } = useQueryString();

  const handleDeleteCourse = (slug: string) => {
    Swal.fire({
      title: 'Bạn có chắc muốn xóa khóa học không ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Đóng',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await updateCourse({
          slug,
          updateDate: {
            status: ECourseStatus.PENDING,
            _destroy: true,
          },
          path: '/manage/course',
        });
        toast.success('Xóa khóa học thành công');
      }
    });
  };
  const handleChangeStatus = async (slug: string, status: ECourseStatus) => {
    try {
      Swal.fire({
        title: 'Bạn có chắc muốn đổi trạng thái không?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Cập nhật',
        cancelButtonText: 'Đóng',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await updateCourse({
            slug,
            updateDate: {
              status:
                status === ECourseStatus.PENDING
                  ? ECourseStatus.APPROVED
                  : ECourseStatus.PENDING,
              _destroy: false,
            },
            path: '/manage/course',
          });
          toast.success('Đổi trạng thái khóa học thành công');
          // Đặt cả hai tham số vào URL cùng một lúc
          router.push(
            `${pathname}?${createQueryString('status', '')}&${createQueryString(
              'search',
              ''
            )}`
          );
        }
      });
    } catch (error) {
      console.log(' error:', error);
    }
  };
  const handleSelectStatus = (status: ECourseStatus) => {
    router.push(pathname + '?' + createQueryString('status', status));
  };
  const handleSearchCourse = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      router.push(pathname + '?' + createQueryString('search', e.target.value));
    },
    500
  );
  const [page, setPage] = useState(1);
  const handleChangePage = (type: 'prev' | 'next') => {
    if (type === 'prev' && page === 1) return;
    if (type === 'prev') setPage((prev) => prev - 1);
    if (type === 'next') setPage((prev) => prev + 1);
  };
  useEffect(() => {
    router.push(pathname + '?' + createQueryString('page', page.toString()));
  }, [page]);
  return (
    <>
      <BouncedLink url="/manage/course/new"></BouncedLink>
      <div className="flex flex-col lg:flex-row lg:items-center gap-5 justify-between mb-10">
        <Heading className="">Quản lý khóa học</Heading>
        <div className="gap-3 flex">
          <div className="w-full lg:w-[300px]">
            <Input
              placeholder="Tìm kiếm khóa học... "
              onChange={(e) => handleSearchCourse(e)}
            ></Input>
          </div>
          <Select
            onValueChange={(value) =>
              handleSelectStatus(value as ECourseStatus)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {courseStatus.map((Status) => (
                  <SelectItem value={Status.value} key={Status.value}>
                    {Status.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table className="table-responsive">
        <TableHeader>
          <TableRow>
            <TableHead>Thông tin</TableHead>
            <TableHead>Giá </TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length > 0 &&
            courses.map((course) => {
              const courseStatusItem = courseStatus.find(
                (item) => item.value === course.status
              );
              return (
                <TableRow key={course.slug}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        alt=""
                        src={course.image}
                        width={80}
                        height={80}
                        className="flex-shrink-0 size-16 rounded-lg object-cover"
                      ></Image>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-sm lg:text-base whitespace-nowrap">
                          {course.title}
                        </h3>
                        <h4 className="text-xs lg:text-sm text-slate-500">
                          {new Date(course.created_at).toLocaleDateString(
                            'vi-VI'
                          )}
                        </h4>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-base">
                      {course.price.toLocaleString()}đ
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className={cn(
                        courseStatusItem?.className,
                        commonClassNames.status
                      )}
                      onClick={() =>
                        handleChangeStatus(course.slug, course.status)
                      }
                    >
                      {courseStatusItem?.title}
                    </button>
                  </TableCell>
                  <TableCell>
                    <TableAction>
                      <TableActionIcon
                        type="study"
                        url={`/manage/course/update-content?slug=${course.slug}`}
                      ></TableActionIcon>
                      <TableActionIcon
                        type="view"
                        url={`/course/${course.slug}`}
                      ></TableActionIcon>
                      <TableActionIcon
                        type="edit"
                        url={`/manage/course/update?slug=${course.slug}`}
                      ></TableActionIcon>
                      <TableActionIcon
                        type="delete"
                        onClick={() => handleDeleteCourse(course.slug)}
                      ></TableActionIcon>
                    </TableAction>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <div className="flex justify-end gap-3 mt-5">
        <button
          className={commonClassNames.paginationButton}
          onClick={() => handleChangePage('prev')}
        >
          <IconLeftArrow></IconLeftArrow>
        </button>
        <button
          className={commonClassNames.paginationButton}
          onClick={() => handleChangePage('next')}
        >
          <IconRightArrow></IconRightArrow>
        </button>
      </div>
    </>
  );
};

export default CourseManage;
