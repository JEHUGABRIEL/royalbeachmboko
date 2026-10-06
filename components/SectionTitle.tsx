import { CutleryIcon } from "./Icons";

type Props = {
  script: string;
  title: string;
  align?: "center" | "left";
  as?: "h1" | "h2";
};

export default function SectionTitle({ script, title, align = "center", as: Tag = "h2" }: Props) {
  return (
    <div className={`section-title${align === "left" ? " section-title--left" : ""}`}>
      <span className="section-title__script">{script}</span>
      <Tag className="section-title__main">{title}</Tag>
      <CutleryIcon className="section-title__icon" />
    </div>
  );
}
