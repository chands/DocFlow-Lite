import type { Route } from "./+types/home";
import { Link } from 'react-router';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DocFlow Lite - Simple Document Management" },
    { name: "description", content: "A browser-based document management application for organizing, combining, and processing your documents." },
  ];
}

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Welcome to DocFlow Lite</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          A simple, privacy-focused document management solution
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <FeatureCard 
          title="Upload & Organize" 
          description="Easily upload and organize your documents with a simple drag-and-drop interface."
          icon={
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          }
        />
        <FeatureCard 
          title="Process Documents" 
          description="Combine PDFs, split documents, and convert images to PDF format."
          icon={
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <FeatureCard 
          title="Privacy First" 
          description="All processing happens in your browser. Your documents never leave your device."
          icon={
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Get Started</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Start managing your documents in just a few clicks. No account required.
        </p>
        <Link 
          to="/documents" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Documents
          <svg className="ml-2 -mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Why DocFlow Lite?</h2>
        <ul className="space-y-4 text-gray-600 dark:text-gray-300">
          <li className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>No account or sign-up required</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Works offline - no internet connection needed after initial load</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Your documents stay on your device - we never see them</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Simple, intuitive interface designed for ease of use</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 dark:bg-blue-900 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
