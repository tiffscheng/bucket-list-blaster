
import { validatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/utils/security';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const PasswordStrengthIndicator = ({ password, className = '' }: PasswordStrengthIndicatorProps) => {
  if (!password) return null;

  const { score, feedback } = validatePasswordStrength(password);
  const strengthLabel = getPasswordStrengthLabel(score);
  const strengthColor = getPasswordStrengthColor(score);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Password strength:</span>
        <span className={`text-sm font-medium ${strengthColor}`}>
          {strengthLabel}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            score <= 1 ? 'bg-red-500' :
            score === 2 ? 'bg-orange-500' :
            score === 3 ? 'bg-yellow-500' :
            score === 4 ? 'bg-blue-500' :
            'bg-green-500'
          }`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {feedback.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              <span className="text-red-500">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
