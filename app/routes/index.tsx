import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Index() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/home");
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500 dark:text-gray-400">Redirecting to home...</p>
    </div>
  );
} 