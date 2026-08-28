import { useState } from 'react'
import AppHeader from './components/AppHeader'
import Sidebar from './components/Sidebar'
import TabBar from './components/TabBar'
import EmptyPage from './pages/EmptyPage'
import Dashboard from './pages/Dashboard'
import 업체정보 from './pages/01_기초코드/업체정보'
import 매출처등록 from './pages/01_기초코드/매출처등록'
import 매입처등록 from './pages/01_기초코드/매입처등록'
import 카드은행등록 from './pages/01_기초코드/카드은행등록'
import 직원등록 from './pages/01_기초코드/직원등록'
import 보험사조회 from './pages/01_기초코드/보험사조회'
import 보험사담당자등록 from './pages/01_기초코드/보험사담당자등록'
import 차량명등록 from './pages/01_기초코드/차량명등록'
import 사용자권한등록 from './pages/01_기초코드/사용자권한등록'
import 매출일지 from './pages/02_작업일지/매출일지'
import { menuData } from './data/menuData'
import PhotoViewer from './pages/PhotoViewer'
import LaborItemsPopup from './pages/LaborItemsPopup'
import PaintItemsPopup from './pages/PaintItemsPopup'
import PreventiveItemsPopup from './pages/PreventiveItemsPopup'
import 나의셋트 from './pages/02_작업일지/나의셋트'

const PAGE_COMPONENTS = {
  '0101': 매출처등록,
  '0102': 매입처등록,
  '0103': 카드은행등록,
  '0106': 직원등록,
  '0107': 차량명등록,
  '0108': 사용자권한등록,
  '0109': 보험사담당자등록,
  '0113': 보험사조회,
  '0111': 업체정보,
  '0201': 매출일지,
  '0604': 나의셋트,
}

const MAX_TABS = 10

export default function App() {
  const [tabs, setTabs] = useState([])
  const [activeTabId, setActiveTabId] = useState(null)

  if (globalThis.location?.pathname === '/photo-viewer') return <PhotoViewer />
  if (globalThis.location?.pathname === '/labor-items') return <LaborItemsPopup />
  if (globalThis.location?.pathname === '/paint-items') return <PaintItemsPopup />
  if (globalThis.location?.pathname === '/preventive-items') return <PreventiveItemsPopup />

  const handleMenuClick = (item) => {
    const existing = tabs.find((t) => t.id === item.id)
    if (existing) {
      setTabs((prev) => prev.map((tab) => tab.id === item.id ? { ...tab, context: undefined } : tab))
      setActiveTabId(item.id)
      return
    }
    // 새 탭은 맨 앞(왼쪽)에 생성. 최대치를 넘으면 가장 오래된(오른쪽 끝) 탭을 닫는다.
    // 새 탭이 항상 맨 앞이라 현재 활성 탭은 잘려나가지 않음.
    setTabs((prev) => [item, ...prev].slice(0, MAX_TABS))
    setActiveTabId(item.id)
  }

  const handleOpenPage = (id, context = {}) => {
    const item = menuData.flatMap((group) => group.children ?? []).find((menu) => menu.id === id)
    if (!item) return

    setTabs((prev) => {
      const existing = prev.find((tab) => tab.id === id)
      if (existing) return prev.map((tab) => tab.id === id ? { ...tab, context } : tab)
      return [{ ...item, context }, ...prev].slice(0, MAX_TABS)
    })
    setActiveTabId(id)
  }

  const handleTabClose = (id) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (activeTabId === id) {
        setActiveTabId(next.length > 0 ? next[next.length - 1].id : null)
      }
      return next
    })
  }

  const handleCloseAllTabs = () => {
    setTabs([])
    setActiveTabId(null)
  }

  const activeTab = tabs.find((t) => t.id === activeTabId)

  return (
    <div className="h-screen bg-slate-100 overflow-hidden flex justify-center">
      {/* 전체 센터 컨테이너 */}
      <div className="flex flex-col h-full w-full max-w-[1600px] shadow-xl bg-white">
        {/* 헤더 - 상단 전체 폭 */}
        <AppHeader />
        {/* 본문 행 - 사이드바 + 콘텐츠 */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar onMenuClick={handleMenuClick} activeMenuId={activeTabId} />
          <main className="flex flex-col flex-1 overflow-hidden bg-white">
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onTabClick={setActiveTabId}
              onTabClose={handleTabClose}
              onCloseAll={handleCloseAllTabs}
            />
            <div className="flex-1 overflow-auto">
              {activeTab ? (
                (() => {
                  const PageComponent = PAGE_COMPONENTS[activeTab.id]
                  return PageComponent ? (
                    <div className="h-full">
                      <PageComponent onOpenPage={handleOpenPage} navigationContext={activeTab.context} />
                    </div>
                  ) : (
                    <div className="h-full p-4">
                      <EmptyPage menuId={activeTab.id} label={activeTab.label} />
                    </div>
                  )
                })()
              ) : (
                <Dashboard />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
