import React from "react"
import { Link, useLocation } from "react-router"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarSeparator,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "./ui/sidebar"
import { User, Users, Home, MapPin, Calendar, LogOut } from "lucide-react"
import { getUserRole, logout } from "@/lib/auth"
import { useNavigate } from "react-router"

function SideBar() {
  const location = useLocation()
  const role = getUserRole()

  const isActive = (path) => location.pathname === path
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  const navItems = [
    {
      path: "/user",
      label: "Quản lý người dùng",
      Icon: User,
      roles: ["admin"],
    },
    {
      path: "/resident",
      label: "Quản lý nhân khẩu",
      Icon: Users,
      roles: ["admin"],
    },
    {
      path: "/household",
      label: "Quản lý hộ khẩu",
      Icon: Home,
      roles: ["admin"],
    },
    {
      path: "/temporary",
      label: "Tạm trú / Tạm vắng",
      Icon: MapPin,
      roles: ["admin"],
    },
    {
      path: "/meeting",
      label: "Lịch họp",
      Icon: Calendar,
      roles: ["admin", "officer"],
    },
  ]

  const visibleItems = navItems.filter((item) => item.roles.includes(role))

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="floating" collapsible="icon" className="sidebar-art">
        <SidebarHeader className="pb-1">
          <div className="header-gradient glass-header rounded-xl border border-sidebar-border px-4 py-3">
            <Link to="/" className="header-home-link block w-full rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <Home className="w-6 h-6 text-[color:var(--primary-dark)]" />
                <span className="text-base font-semibold text-[color:var(--primary-dark)]">
                  Trang chủ
                </span>
              </div>
            </Link>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent className="px-1">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 tracking-wide text-sidebar-foreground/60">
              Quản lý chính
            </SidebarGroupLabel>
            <SidebarMenu className="gap-2">
              {visibleItems.map(({ path, label, Icon }) => (
                <SidebarMenuItem key={path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(path)}
                    variant="outline"
                    size="lg"
                    tooltip={label}
                    className="sidebar-nav-btn rounded-xl px-4 gap-3 text-[15px] font-medium !bg-transparent !hover:bg-transparent"
                  >
                    <Link to={path}>
                      <Icon className="!size-5" />
                      <span className="truncate">{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarSeparator />

          <div className="px-3 pt-2">
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  variant="outline"
                  size="lg"
                  className="sidebar-nav-btn rounded-xl px-4 gap-3 text-[15px] font-medium !bg-transparent !hover:bg-transparent"
                >
                  <LogOut className="!size-5" />
                  <span className="truncate">Đăng xuất</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>

          <div className="px-3 pb-2 text-center text-xs text-muted-foreground">
            Phiên bản thử nghiệm
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

export default SideBar