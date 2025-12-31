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
import { KeyRound, Users, Home, MapPin, Calendar, LogOut, CircleUser } from "lucide-react"
import { getUserRole, logout } from "@/lib/auth"
import { useNavigate } from "react-router"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { runAppTransition } from "@/lib/transition"

function SideBar() {
  const location = useLocation()
  const role = getUserRole()

  const isActive = (path) => location.pathname === path
  const navigate = useNavigate()

  const [logoutOpen, setLogoutOpen] = React.useState(false)

  const handleLogoutClick = () => {
    setLogoutOpen(true)
  }

  const confirmLogout = async () => {
    setLogoutOpen(false)
    await runAppTransition(() => {
      navigate("/login", { replace: true })
      requestAnimationFrame(() => logout())
    })
  }

  const navItems = [
    {
      path: "/user",
      label: "Quản lý tài khoản",
      Icon: KeyRound,
      roles: ["leader"],
    },
    {
      path: "/resident",
      label: "Quản lý nhân khẩu",
      Icon: Users,
      roles: ["leader", "deputy"],
    },
    {
      path: "/household",
      label: "Quản lý hộ khẩu",
      Icon: Home,
      roles: ["leader", "deputy"],
    },
    {
      path: "/temporary",
      label: "Tạm trú / Tạm vắng",
      Icon: MapPin,
      roles: ["leader", "deputy"],
    },
    {
      path: "/meeting",
      label: "Sự kiện",
      Icon: Calendar,
      roles: ["leader", "deputy", "officer"],
    },
    {
      path: "/profile",
      label: "Hồ sơ",
      Icon: CircleUser,
      roles: ["leader", "deputy", "officer"],
    },
  ]

  const visibleItems = navItems.filter((item) => item.roles.includes(role))

  const menuRef = React.useRef(null)
  const itemRefs = React.useRef({})
  const rafIdRef = React.useRef(null)
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    opacity: 0,
    transform: "translate3d(0,0,0)",
    width: "0px",
    height: "0px",
  })

  const activePath = React.useMemo(() => {
    const active = visibleItems.find((item) => isActive(item.path))
    return active?.path ?? null
  }, [visibleItems, location.pathname])

  const updateIndicator = React.useCallback(() => {
    const menuEl = menuRef.current
    if (!menuEl || !activePath) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }))
      return
    }

    const activeEl = itemRefs.current[activePath]
    if (!activeEl) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }))
      return
    }

    const menuRect = menuEl.getBoundingClientRect()
    const rect = activeEl.getBoundingClientRect()

    const x = rect.left - menuRect.left
    const y = rect.top - menuRect.top

    setIndicatorStyle({
      opacity: 1,
      transform: `translate3d(${x}px, ${y}px, 0)`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    })
  }, [activePath])

  React.useLayoutEffect(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
    rafIdRef.current = requestAnimationFrame(updateIndicator)
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
  }, [updateIndicator])

  React.useEffect(() => {
    const menuEl = menuRef.current
    if (!menuEl) return

    const onResize = () => updateIndicator()
    window.addEventListener("resize", onResize)

    let ro
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateIndicator())
      ro.observe(menuEl)
    }

    return () => {
      window.removeEventListener("resize", onResize)
      if (ro) ro.disconnect()
    }
  }, [updateIndicator])

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
            <SidebarMenu ref={menuRef} className="gap-2 relative">
              <li
                aria-hidden="true"
                className="rm-sidebar-indicator"
                style={indicatorStyle}
              />
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
                    <Link
                      to={path}
                      ref={(node) => {
                        if (node) itemRefs.current[path] = node
                        else delete itemRefs.current[path]
                      }}
                    >
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
                  onClick={handleLogoutClick}
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

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="rm-popup-panel !bg-[var(--popover)]">
          <DialogHeader>
            <DialogTitle>Bạn có chắc muốn đăng xuất?</DialogTitle>
            <DialogDescription>
              Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng hệ thống.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              className="!bg-destructive !text-white hover:!bg-destructive/90"
              onClick={confirmLogout}
            >
              Đăng xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

export default SideBar