import type { ElementType } from 'react';
import { useLang } from '../context/LangContext';
import type { Translations } from '../i18n/translations';

type Props = {
  k: keyof Translations;
  as?: ElementType;
  className?: string;
};

export function Html({ k, as: Tag = 'span', className }: Props) {
  const { t } = useLang();
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: t(k) }} />;
}

export function HtmlList({ k, className }: { k: keyof Translations; className?: string }) {
  const { list } = useLang();
  return (
    <ul className={className}>
      {list(k).map((item, i) => (
        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
      ))}
    </ul>
  );
}
