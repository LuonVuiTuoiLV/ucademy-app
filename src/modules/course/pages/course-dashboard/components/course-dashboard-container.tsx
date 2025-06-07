'use client';

import { debounce } from 'lodash';
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';

import CourseItem from '@/modules/course/components/course-item';
import { CourseGrid, Pagination } from '@/shared/components/common';
import { Label, Switch } from '@/shared/components/ui';
import { Input } from '@/shared/components/ui/input';
import { ShineBorder } from '@/shared/components/ui/shine-border';
import { Skeleton } from '@/shared/components/ui/skeleton'; // Ví dụ Skeleton
import { TypingAnimation } from '@/shared/components/ui/typing';
import { CourseItemData } from '@/shared/types';

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

export interface CourseDashboardContainerProps {
  courseList: CourseItemData[];
  totalPages: number;
  totalCourses: number;
  initialSearchTerm: string;
  currentPage: number;
  initialIsFree: boolean;
}

function CourseDashboardContainer({
  courseList,
  initialSearchTerm,
  totalCourses,
  totalPages,
  initialIsFree,
}: CourseDashboardContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFreeChecked, setIsFreeChecked] = useState(initialIsFree);

  useEffect(() => {
    setIsFreeChecked(initialIsFree);
  }, [initialIsFree]);

  const handleUrlUpdate = useCallback(
    (
      newQueryValues: Record<string, string | null>,
      resetPage: boolean = false,
    ) => {
      setIsLoading(true);
      const params = new URLSearchParams(
        Array.from(currentSearchParams.entries()),
      );

      Object.entries(newQueryValues).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      if (resetPage) {
        params.set('page', '1');
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [currentSearchParams, router, pathname],
  );

  const handleSearch = useCallback(
    (searchValue: string) => {
      handleUrlUpdate(
        { search: searchValue.trim() ? searchValue.trim() : null },
        true,
      );
    },
    [handleUrlUpdate],
  );
  const handleIsFreeChange = useCallback(
    (checked: boolean) => {
      setIsFreeChecked(checked);
      handleUrlUpdate({ isFree: checked ? 'true' : null }, true);
    },
    [handleUrlUpdate],
  );

  useEffect(() => {
    setIsLoading(false);
  }, [courseList, initialSearchTerm, initialIsFree]);

  return (
    <div className="space-y-6 py-6 md:space-y-8">
      <div className="bgDarkMode borderDarkMode flex items-center justify-between rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="isFree"
            checked={isFreeChecked}
            onCheckedChange={handleIsFreeChange}
            disabled={isLoading}
          />
          <Label htmlFor="isFree">
            <TypingAnimation>Khóa học miễn phí</TypingAnimation>
          </Label>
        </div>
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
      </div>

      {isLoading ? (
        <CourseGrid>
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-card text-card-foreground space-y-3 rounded-lg border p-4 shadow-sm"
            >
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-2 h-8 w-full" />
            </div>
          ))}
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

      {!isLoading && totalPages > 0 && (
        <Pagination
          total={totalCourses}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}

export default CourseDashboardContainer;
