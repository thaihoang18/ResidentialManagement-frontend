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
import { User, Users, Home, MapPin, Calendar } from "lucide-react"

function SideBar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <div className="px-3 py-2 text-sm font-semibold">Quản lý chung cư</div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Quản lý chính</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/users")}>
                  <Link to="/users" className="flex items-center gap-2">
                    <User />
                    <span>Quản lý người dùng</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/residents")}>
                  <Link to="/residents" className="flex items-center gap-2">
                    <Users />
                    <span>Quản lý nhân khẩu</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/households")}>
                  <Link to="/households" className="flex items-center gap-2">
                    <Home />
                    <span>Quản lý hộ khẩu</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/temporary")}>
                  <Link to="/temporary" className="flex items-center gap-2">
                    <MapPin />
                    <span>Tạm trú / Tạm vắng</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/meeting")}>
                  <Link to="/meeting" className="flex items-center gap-2">
                    <Calendar />
                    <span>Lịch họp</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="px-3 py-2 text-xs text-muted-foreground">Phiên bản thử nghiệm</div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

export default SideBar