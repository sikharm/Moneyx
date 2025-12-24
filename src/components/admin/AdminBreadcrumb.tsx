import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const routeLabels: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/files': 'File Management',
  '/admin/translations': 'Translations',
  '/admin/user-investments': 'User Investments',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/partners': 'Partners',
  '/admin/trade-tracker': 'Trade Tracker',
  '/admin/trade-tracker/accounts': 'Accounts',
  '/admin/trade-tracker/summary': 'Summary',
  '/admin/trade-tracker/export': 'Export',
  '/admin/trade-tracker/settings': 'Settings',
};

const AdminBreadcrumb = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Build breadcrumb items from path
  const breadcrumbItems: { path: string; label: string; isLast: boolean }[] = [];
  
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    breadcrumbItems.push({
      path: currentPath,
      label,
      isLast: index === pathSegments.length - 1,
    });
  });

  // Don't show breadcrumb on root admin page
  if (location.pathname === '/admin') {
    return null;
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/admin" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {breadcrumbItems.slice(1).map((item, index) => (
          <BreadcrumbItem key={item.path}>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            {item.isLast ? (
              <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link to={item.path} className="text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AdminBreadcrumb;