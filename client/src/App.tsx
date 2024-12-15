import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Dashboard } from "./pages/Dashboard"
import { Content } from "./pages/Content"
import { Settings } from "./pages/Settings"
import { NotFound } from "./pages/NotFound"
import { Layout } from "./components/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { NicheSelection } from "./pages/NicheSelection"
import { PillarsList } from "./pages/PillarsList/index"
import { Subpillars } from "./pages/Subpillars"
import { SubpillarDetail } from "./pages/SubpillarDetail"
import { ContentMerge } from "./pages/ContentMerge"
import { SEOGrade } from "./pages/SEOGrade"
import { FinalArticle } from "./pages/FinalArticle"
import { Sidebar } from "./components/Sidebar"
import { Footer } from "./components/Footer"
import { Header } from "./components/Header"
import { ResearchManager } from "./pages/ResearchManager"
import { NicheDetail } from "./pages/NicheDetail"
import TodoList from "./pages/TodoList"

function RouteLogger() {
  const location = useLocation()

  useEffect(() => {
    console.log('Current route:', location.pathname)
  }, [location])

  return null
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system">
        <Router>
          <RouteLogger />
          <div className="min-h-screen bg-background">
            <Header />
            <div className="grid grid-cols-[16rem,1fr] mt-16 gap-6">
              <Sidebar />
              <div className="flex flex-col min-h-[calc(100vh-4rem)] px-6 py-4">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Routes */}
                  <Route
                    path="*"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/dashboard" element={<Navigate to="/" replace />} />
                            <Route path="/content" element={<Content />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/niche-selection" element={<NicheSelection />} />
                            <Route path="/pillars" element={<PillarsList />} />
                            <Route path="/pillars/:pillarId/subpillars" element={<Subpillars />} />
                            <Route path="/subpillar-detail/:subpillarId" element={<SubpillarDetail />} />
                            <Route path="/content-merge/:subpillarId?" element={<ContentMerge />} />
                            <Route path="/seo-grade/:articleId?" element={<SEOGrade />} />
                            <Route path="/articles" element={<FinalArticle />} />
                            <Route path="/articles/:articleId" element={<FinalArticle />} />
                            <Route path="/research/:subpillarId?" element={<ResearchManager />} />
                            <Route path="/niches/:id" element={<NicheDetail />} />
                            <Route path="/todos" element={<TodoList />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                <Footer />
              </div>
            </div>
          </div>
        </Router>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
