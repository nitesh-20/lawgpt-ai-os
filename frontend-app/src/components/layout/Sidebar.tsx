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
  X
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
        className="fixed top-5 left-5 z-50 p-2.5 bg-black/80 border border-white/[0.08] rounded-xl shadow-lg hover:bg-white/[0.05] transition-all duration-200"
        aria-label="Open sidebar"
      >
        <ChevronRight size={18} className="text-primary" />
      </button>
    );
  }

  return (
    <>
      {/* Desktop / Floating Sidebar */}
      <aside
        className={`fixed left-4 top-4 bottom-4 bg-card/60 backdrop-blur-xl border border-white/[0.06] text-neutral transition-all duration-300 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.5)]
          ${collapsed ? 'w-20' : 'w-60'} z-50 ${isMobile ? 'left-0 top-0 bottom-0 h-full rounded-none border-y-0 border-l-0' : ''}`}
      >
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/[0.05]">
          {!collapsed && (
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div className="w-7 h-7 bg-gradient-to-tr from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-sans font-bold text-xs">L</span>
              </div>
              <span className="text-base font-sans font-bold text-white tracking-tight">LawGPT <span className="text-primary text-[10px] uppercase font-mono px-1 bg-primary/10 rounded">OS</span></span>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 hover:bg-white/[0.05] text-muted-foreground hover:text-white transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 hover:bg-white/[0.05] text-muted-foreground hover:text-white transition-colors"
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
                  className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-2.5 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary/10 text-primary border-l-2 border-primary font-medium' 
                      : 'text-muted-foreground hover:bg-white/[0.03] hover:text-white border-l-2 border-transparent'}`}
                >
                  <item.icon size={18} className={`${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-white'} transition-colors`} />
                  {!collapsed && (
                    <span className="ml-3 text-xs tracking-wide">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom telemetry indicators */}
          <div className={`mt-auto mb-4 border-t border-white/[0.05] pt-4 ${collapsed ? 'text-center' : 'px-3'}`}>
            <div className="text-2xs text-muted-foreground/60 font-mono space-y-2">
              {!collapsed && (
                <div className="flex justify-between items-center">
                  <span>SYSTEM V</span>
                  <span>v2.4.0</span>
                </div>
              )}
              <div className="flex items-center gap-2 justify-center py-1.5 px-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                <span className="inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 animate-pulse" />
                {!collapsed && <span className="text-emerald-500 text-3xs font-semibold uppercase tracking-wider">Operational</span>}
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
};

export default Sidebar;
