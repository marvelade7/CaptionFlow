import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardLayout from "./components/DashboardLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Upload from "./pages/Upload.jsx";
import MyFiles from "./pages/MyFiles.jsx";
import Transcripts from "./pages/Transcripts.jsx";
import Downloads from "./pages/Downloads.jsx";
import Account from "./pages/Account.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import PWAToast from "./components/PWAToast";

// Admin pages — lazy-loaded so they don't bloat the initial bundle for regular users
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics.jsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.jsx"));
const AdminUserDetail = lazy(() => import("./pages/admin/AdminUserDetail.jsx"));
const AdminTranscriptions = lazy(() => import("./pages/admin/AdminTranscriptions.jsx"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity.jsx"));
const AdminErrors = lazy(() => import("./pages/admin/AdminErrors.jsx"));

// Simple fallback while admin chunks load
function AdminPageLoader() {
    return (
        <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin" />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                    }}
                />
                <PWAToast />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <LoginPage />
                            </GuestRoute>
                        }
                    />
                    <Route path="/signin" element={<Navigate to='/login' replace/> }/>
                    <Route
                        path="/signup"
                        element={
                            <GuestRoute>
                                <SignUpPage />
                            </GuestRoute>
                        }
                    />

                    {/* ── Main dashboard shell (shared by users + admins) ─── */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        {/* User routes */}
                        <Route index element={<Dashboard />} />
                        <Route path="upload" element={<Upload />} />
                        <Route path="my-files" element={<MyFiles />} />
                        <Route path="transcripts" element={<Transcripts />} />
                        <Route path="downloads" element={<Downloads />} />
                        <Route path="account" element={<Account />} />
                        <Route path="settings" element={<Settings />} />

                        {/* Admin routes — wrapped in AdminRoute for role check */}
                        <Route
                            path="admin"
                            element={
                                <AdminRoute>
                                    <Suspense fallback={<AdminPageLoader />}>
                                        <AdminDashboard />
                                    </Suspense>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="admin/analytics"
                            element={
                                <AdminRoute>
                                    <Suspense fallback={<AdminPageLoader />}>
                                        <AdminAnalytics />
                                    </Suspense>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="admin/users"
                            element={
                                <AdminRoute>
                                    <Suspense fallback={<AdminPageLoader />}>
                                        <AdminUsers />
                                    </Suspense>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="admin/users/:id"
                            element={
                                <AdminRoute>
                                    <Suspense fallback={<AdminPageLoader />}>
                                        <AdminUserDetail />
                                    </Suspense>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="admin/transcriptions"
                            element={
                                <AdminRoute>
                                    <Suspense fallback={<AdminPageLoader />}>
                                        <AdminTranscriptions />
                                    </Suspense>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="admin/activity"
                            element={
                                <AdminRoute>
                                    <Suspense fallback={<AdminPageLoader />}>
                                        <AdminActivity />
                                    </Suspense>
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="admin/errors"
                            element={
                                <AdminRoute>
                                    <Suspense fallback={<AdminPageLoader />}>
                                        <AdminErrors />
                                    </Suspense>
                                </AdminRoute>
                            }
                        />

                        <Route path="*" element={<NotFound />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
