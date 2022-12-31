/**
 * Styled Extensible File Input
 * @param title input top label
 * @param name text shown on link to file
 * @param url local or remote url to file
 */
export const FileInput = ({
  title,
  name,
  url,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  title: string;
  url: string;
  name?: string;
}) => {
  /* Splits filenames from url (remote or local) */
  const getFileName = (url?: string) => {
    if (!url) return "";
    return url.split("/").pop() ?? url;
  };

  return (
    <div className="form-control max-w-xs">
      <label className="label">
        <span className="label-text">{title ?? name}</span>
      </label>
      <input type="file" {...props} />
      <button className="btn btn-link">
        <a href={url} className="link" target="_blank" rel="noreferrer">
          {getFileName(name ?? url)}
        </a>
      </button>
    </div>
  );
};
