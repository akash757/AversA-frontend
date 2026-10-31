/**
 * AuthField — thin wrapper around the design-system Input + FormField.
 * Kept for backward compatibility with auth pages.
 */
import FormField from "@/components/Ui/FormField";
import Input from "@/components/Ui/Input";

export default function AuthField({
  label,
  id,
  error,
  hint,
  className = "",
  children,
  required,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      error={error}
      hint={hint}
      className={className}
    >
      {children || (
        <Input
          id={inputId}
          size="lg"
          error={error}
          {...props}
        />
      )}
    </FormField>
  );
}
