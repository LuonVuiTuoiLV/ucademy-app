'use client';

import Link from 'next/link';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import { updateCommentStatus } from '@/modules/comment/actions';
import OrderAction from '@/modules/order/pages/order-manage-page/components/order-action';
import { BadgeStatus, Heading } from '@/shared/components/common';
import { IconCancel, IconCheck } from '@/shared/components/icons';
import {
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui';
import { allValue, CommentStatus, commentStatus } from '@/shared/constants';
import { useQueryString } from '@/shared/hooks';
import { CommentItemData } from '@/shared/types';

interface CommentManageContainerProps {
  comments?: CommentItemData[] | undefined;
}

const CommentManageContainer = ({
  comments = [],
}: CommentManageContainerProps) => {
  const { handleSearchData, handleSelectStatus } = useQueryString();

  const handleUpdateComment = async ({
    commentId,
    status,
  }: {
    commentId: string;
    status: CommentStatus;
  }) => {
    if (status === CommentStatus.REJECTED) {
      Swal.fire({
        title: 'Bạn có chắc muốn xóa bình luận không ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Đóng',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await updateCommentStatus({
            commentId,
            updateData: {
              status: CommentStatus.REJECTED,
              _destroy: true,
            },
            path: '/manage/comment',
          });
        }
      });
    }
    if (status === CommentStatus.APPROVED) {
      const response = await updateCommentStatus({
        commentId,
        updateData: {
          status: CommentStatus.APPROVED,
          _destroy: false,
        },
        path: '/manage/comment',
      });

      if (response?.success) {
        toast.success('Cập nhật bình luận thành công');
      }
    }
  };

  return (
    <>
      <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <Heading className="">Quản lý bình luận</Heading>
        <div className="flex gap-3">
          <div className="w-full lg:w-[300px]">
            <Input
              placeholder="Tìm kiếm khóa học..."
              onChange={handleSearchData}
            />
          </div>
          <Select
            onValueChange={(value) =>
              handleSelectStatus(value as CommentStatus)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={allValue}>Tất cả</SelectItem>
                {commentStatus.map((Status) => (
                  <SelectItem
                    key={Status.value}
                    value={Status.value}
                  >
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
            <TableHead>Chương học</TableHead>
            <TableHead>Bài học</TableHead>
            <TableHead>Thành viên</TableHead>
            <TableHead>Nội dung</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.length > 0 &&
            comments.map((comment) => {
              const commentStatusItem = commentStatus.find(
                (item) => item.value === comment.status,
              );

              return (
                <TableRow key={comment._id}>
                  <TableCell>
                    <Link
                      className="font-semibold hover:text-primary"
                      href={`/${comment.lesson.course.slug}/lesson?slug=${comment.lesson.slug}`}
                      target="_blank"
                    >
                      <strong>{comment.lesson.lecture.title}</strong>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <strong>{comment.lesson.title}</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{comment.user.name}</strong>
                  </TableCell>
                  <TableCell className="w-[300px]">{comment.content}</TableCell>
                  <TableCell>
                    <BadgeStatus
                      title={commentStatusItem?.title}
                      variant={commentStatusItem?.variant}
                    />
                  </TableCell>
                  <TableCell>
                    {comment.status !== CommentStatus.REJECTED && (
                      <div className="flex gap-3">
                        {comment.status === CommentStatus.PENDING && (
                          <OrderAction
                            onClick={() =>
                              handleUpdateComment({
                                commentId: comment._id,
                                status: CommentStatus.APPROVED,
                              })
                            }
                          >
                            <IconCheck />
                          </OrderAction>
                        )}
                        <OrderAction
                          onClick={() =>
                            handleUpdateComment({
                              commentId: comment._id,
                              status: CommentStatus.REJECTED,
                            })
                          }
                        >
                          <IconCancel />
                        </OrderAction>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </>
  );
};

export default CommentManageContainer;
