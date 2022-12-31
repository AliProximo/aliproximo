import {
  FieldError,
  FieldErrors,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { get } from "radash";

interface Props<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  title?: string;
  textarea?: boolean;
}

/**
 * Styled Extensible TSGeneric Text Input
 * NOTE: Depends on FormContext
 * @param title input top label
 * @param name react-hook-form field
 * @param textarea substitutes input.text for textarea
 */
export const TextInput = <T extends FieldValues = FieldValues>({
  name,
  title,
  textarea,
  ...props
}: React.HTMLAttributes<HTMLInputElement> & Props<T>) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  function getErrorLabel() {
    const error = get<FieldErrors<T>, FieldError>(errors, name);

    if (error === null) return <></>;

    return (
      <label className="label">
        <span className="label-text-alt">{error.message}</span>
      </label>
    );
  }

  return (
    <div className="w-full max-w-xs md:max-w-md">
      <label className="label">
        <span className="label-text">{title ?? name}</span>
      </label>
      {textarea ? (
        <textarea
          className={`textarea ${
            get<FieldErrors<T>, FieldError>(errors, name)
              ? "textarea-error"
              : "textarea-bordered"
          }`}
          aria-invalid={errors.registerNumber ? "true" : "false"}
          {...register(name)}
        />
      ) : (
        <input
          type="text"
          className={`input input-md w-full max-w-xs md:max-w-md ${
            get<FieldErrors<T>, FieldError>(errors, name)
              ? "input-error"
              : "input-bordered"
          }`}
          aria-invalid={errors.registerNumber ? "true" : "false"}
          {...props}
          {...register(name)}
        />
      )}
      {getErrorLabel()}
    </div>
  );
};
