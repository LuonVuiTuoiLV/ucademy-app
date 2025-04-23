import { commonClassNames } from '@/constants';
import Link from 'next/link';
import { IconDelete, IconEdit, IconEye, IconStudy } from '../icons';

type TableActionIcon = 'edit' | 'delete' | 'view' | 'study';
const TableActionItem = ({
  onClick,
  type,
  url,
}: {
  onClick?: () => void;
  type: TableActionIcon;
  url?: string;
}) => {
  const icon: Record<TableActionIcon, any> = {
    edit: <IconEdit></IconEdit>,
    delete: <IconDelete></IconDelete>,
    view: <IconEye></IconEye>,
    study: <IconStudy></IconStudy>,
  };
  if (url)
    return (
      <Link href={url} className={commonClassNames.action}>
        {icon[type]}
      </Link>
    );
  return (
    <button className={commonClassNames.action} onClick={onClick}>
      {icon[type]}
    </button>
  );
};

export default TableActionItem;
