
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  FileText, 
  Search, 
  FolderOpen, 
  Shield, 
  Bot, 
  FileEdit,
  ChevronLeft, 
  ChevronRight,
  X,
  LayoutGrid
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Close sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      setCollapsed(true);
    } else {
      setIsOpen(true);
      setCollapsed(false);
    }
  }, [isMobile]);

  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Cases', path: '/cases' },
    { icon: Search, label: 'Legal Search', path: '/search' },
    { icon: FolderOpen, label: 'Documents', path: '/documents' },
    { icon: FileEdit, label: 'Document Drafting', path: '/document-drafting' },
    { icon: Shield, label: 'Compliance Checker', path: '/compliance' },
    { icon: Bot, label: 'Legal Assistant', path: '/chatbot' },
  ];

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-3 bg-card border border-border rounded-md shadow-card hover:shadow-card-hover transition-shadow duration-200"
        aria-label="Open sidebar"
      >
        <ChevronRight size={20} className="text-primary" />
      </button>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-card border-r border-border text-neutral transition-all duration-200
          ${collapsed ? 'w-20' : 'w-64'} z-50 ${isMobile ? 'transform' : ''}`}
      >
        <div className="flex h-20 items-center justify-between px-6 border-b border-border">
          {!collapsed && (
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-semibold text-sm">L</span>
              </div>
              <span className="text-lg font-serif font-semibold text-ink tracking-tight">LawGPT</span>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleSidebar}
              className="rounded-md p-2 hover:bg-muted transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-2 hover:bg-muted transition-colors"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <nav className="mt-4 flex flex-col h-[calc(100%-5rem)] overflow-y-auto">
          <div className="flex-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'px-6'} py-3 mx-2 rounded-md transition-colors
                    ${isActive ? 'bg-primary/8 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
                  {!collapsed && (
                    <span className={`ml-3 text-sm ${isActive ? 'font-medium' : ''} whitespace-nowrap`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom section with version and status */}
          <div className={`mt-auto mb-6 ${collapsed ? 'px-2 text-center' : 'px-6'}`}>
            <div className="text-xs text-muted-foreground mt-2 font-mono">
              {!collapsed && <span>v2.4.0</span>}
              <div className="flex items-center gap-2 mt-2 justify-center">
                <span className="inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                {!collapsed && <span>Online</span>}
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-ink/30 z-40"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
};

export default Sidebar;
