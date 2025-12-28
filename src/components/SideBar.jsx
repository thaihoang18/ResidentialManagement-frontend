import React from "react"
import { Link, useLocation } from "react-router"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "./ui/sidebar"
import { User, Users, Home, MapPin, Calendar, LogOut } from "lucide-react"
import { logout } from "@/lib/auth"
import { useNavigate } from "react-router"

function SideBar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <div className="px-3 py-2 text-sm font-semibold header-gradient rounded-md">
            <Link to="/" className="inline-block w-full">
              <div className="flex items-center gap-2 accent-text">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Trang chủ</span>
              </div>
            </Link>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Quản lý chính</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/user")}>
                  <Link
                    to="/user"
                    className={
                      isActive("/user")
                        ? "flex items-center gap-2 px-3 py-2 rounded-md event-accent accent-text font-medium"
                        : "flex items-center gap-2 px-3 py-2 rounded-md accent-outline"
                    }
                  >
                    <User />
                    <span>Quản lý người dùng</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/resident")}>
                  <Link
                    to="/resident"
                    className={
                      isActive("/resident")
                        ? "flex items-center gap-2 px-3 py-2 rounded-md event-accent accent-text font-medium"
                        : "flex items-center gap-2 px-3 py-2 rounded-md accent-outline"
                    }
                  >
                    <Users />
                    <span>Quản lý nhân khẩu</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/household")}>
                  <Link
                    to="/household"
                    className={
                      isActive("/household")
                        ? "flex items-center gap-2 px-3 py-2 rounded-md event-accent accent-text font-medium"
                        : "flex items-center gap-2 px-3 py-2 rounded-md accent-outline"
                    }
                  >
                    <Home />
                    <span>Quản lý hộ khẩu</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/temporary")}>
                  <Link
                    to="/temporary"
                    className={
                      isActive("/temporary")
                        ? "flex items-center gap-2 px-3 py-2 rounded-md event-accent accent-text font-medium"
                        : "flex items-center gap-2 px-3 py-2 rounded-md accent-outline"
                    }
                  >
                    <MapPin />
                    <span>Tạm trú / Tạm vắng</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/meeting")}>
                  <Link
                    to="/meeting"
                    className={
                      isActive("/meeting")
                        ? "flex items-center gap-2 px-3 py-2 rounded-md event-accent accent-text font-medium"
                        : "flex items-center gap-2 px-3 py-2 rounded-md accent-outline"
                    }
                  >
                    <Calendar />
                    <span>Lịch họp</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="px-3 py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md accent-outline hover:bg-accent"
            >
              <LogOut />
              <span className="text-sm">Đăng xuất</span>
            </button>
          </div>

          <div className="px-3 py-2 text-xs text-muted-foreground">
            Phiên bản thử nghiệm
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

export default SideBar