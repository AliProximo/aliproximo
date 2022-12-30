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
}

/** NOTE: Depends on FormContext */
export const TextInput = <T extends FieldValues = FieldValues>({
  name,
  title,
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
      {getErrorLabel()}
    </div>
  );
};
