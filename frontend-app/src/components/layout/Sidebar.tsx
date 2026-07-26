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
        className="fixed top-5 left-5 z-50 p-2.5 bg-[#0D0D0D] border border-white/5 rounded-xl shadow-xl hover:bg-[#151515] transition-all duration-200"
        aria-label="Open sidebar"
      >
        <ChevronRight size={18} className="text-[#9B87FF]" />
      </button>
    );
  }

  return (
    <>
      <aside
        className={`fixed left-4 top-4 bottom-4 bg-[#0D0D0D] border border-white/5 text-white transition-all duration-300 rounded-2xl shadow-2xl
          ${collapsed ? 'w-20' : 'w-60'} z-50 ${isMobile ? 'left-0 top-0 bottom-0 h-full rounded-none border-y-0 border-l-0 bg-[#050505]' : ''}`}
      >
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/5">
          {!collapsed && (
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div className="w-7 h-7 bg-[#7C5CFF] rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-sans font-bold text-xs">L</span>
              </div>
              <span className="text-sm font-sans font-bold text-white tracking-tight">
                LawGPT <span className="text-[10px] text-[#9B87FF] uppercase font-mono px-1.5 py-0.5 bg-[#7C5CFF]/10 rounded ml-1 font-bold">OS</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleSidebar}
              className="rounded p-1.5 hover:bg-[#151515] text-slate-400 hover:text-white transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1.5 hover:bg-[#151515] text-slate-400 hover:text-white transition-colors"
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
                  className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-2 rounded-lg transition-all duration-150 group
                    ${isActive 
                      ? 'bg-[#7C5CFF]/10 text-[#9B87FF] font-bold border border-[#7C5CFF]/20' 
                      : 'text-slate-400 hover:bg-[#151515] hover:text-white'}`}
                >
                  <item.icon size={17} className={`${isActive ? 'text-[#9B87FF]' : 'text-slate-500 group-hover:text-white'} transition-colors`} />
                  {!collapsed && (
                    <span className="ml-3 text-2xs uppercase tracking-wider font-mono font-bold">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className={`mt-auto mb-4 border-t border-white/5 pt-4 ${collapsed ? 'text-center' : 'px-3'}`}>
            <div className="text-[9px] font-mono text-slate-500 space-y-2">
              {!collapsed && (
                <div className="flex justify-between items-center">
                  <span>SYSTEM STATUS</span>
                  <span>v2.4.0</span>
                </div>
              )}
              <div className="flex items-center gap-2 justify-center py-1.5 px-2 bg-[#7C5CFF]/5 rounded border border-[#7C5CFF]/10">
                <span className="inline-flex rounded-full h-1.5 w-1.5 bg-[#7C5CFF] animate-pulse" />
                {!collapsed && <span className="text-[#9B87FF] text-[9px] font-bold uppercase tracking-widest font-mono">Synchronized</span>}
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
