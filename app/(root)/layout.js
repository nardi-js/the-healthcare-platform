import Sidebar from "@/components/Sidebar";
import { QuestionsProvider } from "@/context/QuestionsContext";

export default function Authentication({ children }) {
  return (
    <div>
    <QuestionsProvider >
    <div className="flex">
        <Sidebar />
        <div className="main-content flex-grow" style={{ marginLeft: '250px', marginTop: '64px' }}>
        {children}
      </div>
    </div>
    </QuestionsProvider>
  </div>
  )
}