export interface QueryFilter {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
  active?: boolean;
}
export interface QuerySearchParams {
  searchParams: QueryFilter;
}
export type QuerySortFilter = 'recent' | 'oldest';
export type BadgeStatusVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'user'
  | 'admin'
  | 'expert'
  | 'banned'
  | 'green'
  | 'red';
export interface MenuField {
  url: string;
  title: string;
  icon: React.ReactNode;
  onlyIcon?: boolean;
  isManageItem?: boolean;
}
export type RatingIcon = 'awesome' | 'good' | 'meh' | 'bad' | 'terrible';
