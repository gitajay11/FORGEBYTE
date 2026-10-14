import Image from 'next/image';

/** The Forgebyte mark + wordmark, as in the header. The wrapper (a link in the
 *  header, a plain span in the intro) carries the .logo class. */
export default function Logo({ priority = false }: { priority?: boolean }) {
  return (
    <>
      <Image src="/logo/forgebyte-f.png" alt="" width={30} height={30} className="logo-mark" priority={priority} />
      <span className="logo-word">forgebyte</span>
    </>
  );
}
