import Image from "next/image";
import Icon from "./icons";

/** Photo de profil d'un administrateur, ou ses initiales à défaut. */
export default function Avatar({ name, src, size = 32 }: { name: string; src?: string | null; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}>
      {src ? <Image src={src} alt="" fill sizes={`${size * 2}px`} /> : initials || <Icon name="user" size={size * 0.5} />}
    </span>
  );
}
