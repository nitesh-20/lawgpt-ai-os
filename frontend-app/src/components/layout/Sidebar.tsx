import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  FileText, 
  Search, 
  FolderOpen, 
  Shield, 
  Bot,
  FileEdit,
  Cpu,
  ChevronLeft,
  ChevronRight,
  X,
  Volume2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
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
    }
  }, [isMobile, setCollapsed]);

  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Cases', path: '/cases' },
    { icon: Search, label: 'Legal Search', path: '/search' },
    { icon: FolderOpen, label: 'Documents', path: '/documents' },
    { icon: FileEdit, label: 'Document Drafting', path: '/drafting' },
    { icon: Shield, label: 'Compliance Checker', path: '/compliance' },
    { icon: Bot, label: 'Legal Assistant', path: '/chat' },
    { icon: Cpu, label: 'AI Agents', path: '/agents' },
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
        className="fixed top-5 left-5 z-50 p-2.5 bg-white border border-border rounded-lg shadow-sm hover:bg-neutral-50 transition-all duration-200"
        aria-label="Open sidebar"
      >
        <ChevronRight size={18} className="text-primary" />
      </button>
    );
  }

  return (
    <>
      <aside
        className={`fixed left-4 top-4 bottom-4 bg-white border border-border text-neutral-800 transition-all duration-300 rounded-lg shadow-sm
          ${collapsed ? 'w-20' : 'w-60'} z-50 ${isMobile ? 'left-0 top-0 bottom-0 h-full rounded-none border-y-0 border-l-0' : ''}`}
      >
        <div className="flex h-20 items-center justify-between px-6 border-b border-border">
          {!collapsed && (
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div className="w-7 h-7 bg-primary rounded flex items-center justify-center shadow-sm">
                <span className="text-white font-sans font-bold text-xs">L</span>
              </div>
              <span className="text-sm font-sans font-bold text-neutral-900 tracking-tight">
                LawGPT <span className="text-[10px] text-primary uppercase font-mono px-1.5 py-0.5 bg-primary/10 rounded ml-1">OS</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleSidebar}
              className="rounded p-1.5 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900 transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1.5 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900 transition-colors"
                aria-label="Close sidebar"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <nav className="mt-4 flex flex-col h-[calc(100%-6rem)] overflow-y-auto px-3">
          <div className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-2 rounded transition-all duration-150 group
                    ${isActive 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}`}
                >
                  <item.icon size={18} className={`${isActive ? 'text-primary' : 'text-neutral-400 group-hover:text-neutral-900'} transition-colors`} />
                  {!collapsed && (
                    <span className="ml-3 text-xs tracking-wide">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className={`mt-auto mb-4 border-t border-border pt-4 ${collapsed ? 'text-center' : 'px-3'}`}>
            <div className="text-3xs text-neutral-400 font-mono space-y-2">
              {!collapsed && (
                <div className="flex justify-between items-center">
                  <span>SYSTEM STATUS</span>
                  <span>v2.4.0</span>
                </div>
              )}
              <div className="flex items-center gap-2 justify-center py-1.5 px-2 bg-emerald-500/5 rounded border border-emerald-500/10">
                <span className="inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 animate-pulse" />
                {!collapsed && <span className="text-emerald-600 text-3xs font-semibold uppercase tracking-wider">Synchronized</span>}
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/20 backdrop-blur-xs z-40"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
};

export default Sidebar;
