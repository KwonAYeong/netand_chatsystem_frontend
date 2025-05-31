interface EditableFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const EditableField = ({ label, value, onChange, disabled }: EditableFieldProps) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border rounded text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default EditableField;
