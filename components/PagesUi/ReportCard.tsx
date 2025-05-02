import { Report } from '../lib/mockData';
import SeverityBadge from './SeverityBadge';

interface ReportCardProps {
  report: Report;
  showPatientInfo?: boolean;
  showDoctorInfo?: boolean;
}

export default function ReportCard({
  report,
  showPatientInfo = false,
  showDoctorInfo = false,
}: ReportCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {report.type.replace('-', ' ')} Report
          </h3>
          <p className="text-sm text-gray-500">{report.date}</p>
        </div>
        <SeverityBadge severity={report.severity} />
      </div>

      {showPatientInfo && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700">Patient Information</h4>
          <p className="text-sm text-gray-600">ID: {report.patientId}</p>
        </div>
      )}

      {showDoctorInfo && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700">Doctor Information</h4>
          <p className="text-sm text-gray-600">ID: {report.doctorId}</p>
        </div>
      )}

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700">Report Content</h4>
        <p className="text-sm text-gray-600 mt-1">{report.content}</p>
      </div>

      {report.attachments && report.attachments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700">Attachments</h4>
          <ul className="mt-1">
            {report.attachments.map((attachment, index) => (
              <li key={index} className="text-sm text-blue-600 hover:text-blue-800">
                <a href="#" className="underline">
                  {attachment}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 