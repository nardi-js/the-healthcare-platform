import Sidebar from "@/components/Sidebar";
import { QuestionsProvider } from "@/context/QuestionsContext";

export default function Authentication({ children }) {
  return (
    <div>
    <QuestionsProvider >
    <div className="flex">
        <Sidebar />
        <div className="main-content flex-grow ml-[250px] mt-[8px]">
        {children}
      </div>
    </div>
    </QuestionsProvider>
  </div>
  )
}