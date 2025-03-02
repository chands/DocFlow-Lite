import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";

/**
 * Home page component with information about DocFlow Lite
 */
export default function Home() {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate("/documents");
  };
  
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to DocFlow Lite</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          A simple document management system for your everyday needs
        </p>
        <Button size="lg" onClick={handleGetStarted}>
          Get Started with Documents
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Upload Documents</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Easily upload your documents in various formats including PDF, Word, and images.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Convert to PDF</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Convert your documents to PDF format individually or in batch for better compatibility.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Merge Images</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Combine multiple images into a single PDF document for easier sharing and management.
          </p>
        </div>
      </div>
    </div>
  );
}
