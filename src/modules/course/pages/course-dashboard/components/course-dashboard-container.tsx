// modules/course/components/CourseDashboardContainer.tsx
'use client';

import { debounce } from 'lodash';
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';

import CourseItem from '@/modules/course/components/course-item';
import { CourseGrid, Pagination } from '@/shared/components/common';
import { Input } from '@/shared/components/ui/input';
import { ShineBorder } from '@/shared/components/ui/shine-border';
import { Skeleton } from '@/shared/components/ui/skeleton'; // Ví dụ Skeleton
import { CourseItemData } from '@/shared/types';

// --- Search Input Component (Memoized) ---
interface SearchInputProps {
  initialValue: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}
const SearchInput: React.FC<SearchInputProps> = React.memo(
  ({ className, disabled, initialValue, onSearch, placeholder }) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);

    useEffect(() => {
      setSearchTerm(initialValue);
    }, [initialValue]);

    const debouncedSearch = useCallback(
      debounce((value: string) => {
        onSearch(value);
      }, 500),
      [onSearch],
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      setSearchTerm(newValue);
      debouncedSearch(newValue);
    };

    return (
      <Input
        className={className}
        disabled={disabled}
        placeholder={placeholder}
        type="search"
        value={searchTerm}
        onChange={handleChange}
      />
    );
  },
);

SearchInput.displayName = 'SearchInput';

// --- CourseDashboardContainer ---
export interface CourseDashboardContainerProps {
  courseList: CourseItemData[]; // Thay đổi: không cho phép undefined, page sẽ xử lý
  totalPages: number;
  totalCourses: number;
  initialSearchTerm: string; // Thay đổi: không cho phép undefined
  currentPage: number; // Thay đổi: không cho phép undefined
}

function CourseDashboardContainer({
  courseList,
  initialSearchTerm,
  totalCourses,
  totalPages,
}: CourseDashboardContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const handleSearch = useCallback(
    (searchValue: string) => {
      setIsLoading(true); // Bắt đầu loading khi search
      const params = new URLSearchParams([...currentSearchParams.entries()]);

      if (searchValue.trim()) {
        params.set('search', searchValue.trim());
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [currentSearchParams, router, pathname],
  );

  useEffect(() => {
    setIsLoading(false);
  }, [courseList]);

  return (
    <div className="space-y-6 py-6 md:space-y-8">
      <div className="relative ml-auto w-full max-w-[300px]">
        <ShineBorder shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']} />
        <div className="flex w-full items-center rounded-md">
          <Search className="text-muted-foreground absolute left-3 size-4" />
          <SearchInput
            className="border-none bg-transparent py-2 pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isLoading}
            initialValue={initialSearchTerm}
            placeholder="Tìm kiếm khóa học..."
            onSearch={handleSearch}
          />
        </div>
      </div>

      {isLoading ? (
        // Hiển thị Skeleton hoặc loading indicator cho CourseGrid
        <CourseGrid>
          {Array.from({ length: 6 }).map(
            (
              _,
              index, // Ví dụ 6 skeleton items
            ) => (
              <div
                key={index}
                className="bg-card text-card-foreground space-y-3 rounded-lg border p-4 shadow-sm"
              >
                <Skeleton className="h-32 w-full rounded-md" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-2 h-8 w-full" />
              </div>
            ),
          )}
        </CourseGrid>
      ) : courseList.length > 0 ? (
        <CourseGrid>
          {courseList.map((item) => (
            <CourseItem
              key={item._id || item.slug}
              data={item}
            />
          ))}
        </CourseGrid>
      ) : (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400">
          <p className="text-xl font-semibold">
            {initialSearchTerm
              ? `Không tìm thấy khóa học nào khớp với "${initialSearchTerm}".`
              : 'Chưa có khóa học nào.'}
          </p>
          {!!initialSearchTerm && (
            <p className="mt-2">Vui lòng thử với từ khóa khác.</p>
          )}
        </div>
      )}

      {/* Pagination chỉ render lại khi totalPages hoặc currentPage thay đổi đáng kể */}
      {/* Nếu PaginationComponent được memoized và props không đổi, nó sẽ không render lại */}
      {!isLoading &&
        totalPages > 0 && ( // Chỉ hiển thị pagination nếu có trang và không loading
          <Pagination
            total={totalCourses}
            totalPages={totalPages}
          />
        )}
    </div>
  );
}

export default CourseDashboardContainer;
