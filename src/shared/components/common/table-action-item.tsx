import {
  IconCancel,
  IconCheck,
  IconDelete,
  IconEdit,
  IconEye,
  IconStudy,
} from '@/shared/components/icons';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type TableActionIcon =
  | 'edit'
  | 'delete'
  | 'view'
  | 'study'
  | 'approve'
  | 'cancel';

interface TableActionItemProps {
  onClick?: () => void;
  type: TableActionIcon;
  url?: string;
  label?: string; // Thêm prop label cho tooltip
}

const TableActionItem = ({
  onClick,
  type,
  url,
  label,
}: TableActionItemProps) => {
  const icon: Record<TableActionIcon, JSX.Element> = {
    edit: <IconEdit />,
    delete: <IconDelete />,
    cancel: <IconCancel />,
    view: <IconEye />,
    study: <IconStudy />,
    approve: <IconCheck />,
  };

  // Default labels nếu không truyền label
  const defaultLabels: Record<TableActionIcon, string> = {
    edit: 'Chỉnh sửa',
    delete: 'Xóa',
    view: 'Xem',
    study: 'Thêm bài học',
    approve: 'Phê duyệt',
    cancel: 'Từ chối',
  };

  const className =
    'size-8 rounded-md border flex items-center justify-center p-2 text-gray-400 hover:border-opacity-90 dark:bg-transparent borderDarkMode dark:hover:border-opacity-40';

  const tooltipLabel = label || defaultLabels[type];

  const renderContent = () => {
    if (url) {
      return (
        <Link
          className={className}
          href={url}
        >
          {icon[type]}
        </Link>
      );
    }

    return (
      <button
        className={className}
        onClick={onClick}
      >
        {icon[type]}
      </button>
    );
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>{renderContent()}</TooltipTrigger>
      <TooltipContent>
        <p>{tooltipLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default TableActionItem;
