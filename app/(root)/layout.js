import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar"; // Import the Navbar component
import { QuestionsProvider } from "@/context/QuestionsContext";

export default function Authentication({ children }) {
  return (
    <div>
      <QuestionsProvider>
        <Navbar /> {/* Include the Navbar component */}
        <div className="flex">
          <Sidebar />
          <div className="main-content flex-grow ml-[250px] mt-[8px]">
            {children}
          </div>
        </div>
      </QuestionsProvider>
    </div>
  );
}
