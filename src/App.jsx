import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Layout from './Layout'
import Inbox from '@/components/pages/Inbox'
import Contacts from '@/components/pages/Contacts'
import Templates from '@/components/pages/Templates'
import Analytics from '@/components/pages/Analytics'
import Settings from '@/components/pages/Settings'
import Users from '@/components/pages/Users'
import Billing from '@/components/pages/Billing'
import Admin from '@/components/pages/Admin'
import NotFound from '@/components/pages/NotFound'
function App() {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Inbox />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="templates" element={<Templates />} />
<Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<Users />} />
            <Route path="billing" element={<Billing />} />
            <Route path="admin" element={<Admin />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="z-[9999]"
        />
      </div>
    </BrowserRouter>
  )
}

export default App