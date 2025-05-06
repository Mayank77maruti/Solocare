import { Report } from '@/lib/mockData';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

interface recordData {
  date: string;
  fileUrl: string;
}

interface ReportCardProps {
  report: recordData;
}

export default function ReportCard({
  report,
}: ReportCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString || new Date());
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-gray-500 flex">
            <Calendar className="h-6 w-6" />
            <p className="text-sm text-gray-800 ml-2">{formatDate(report.date)}</p>
          </div>
        </div>
        <Link
          href={report.fileUrl}
          target='_blank'
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <span className="mr-2">View Report</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}