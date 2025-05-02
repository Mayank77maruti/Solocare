interface SeverityBadgeProps {
  severity: 'low' | 'medium' | 'high';
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const severityStyles = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const severityText = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        severityStyles[severity]
      }`}
    >
      {severityText[severity]}
    </span>
  );
} 