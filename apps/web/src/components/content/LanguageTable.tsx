import { Data } from '../../primitives/Data.js';
import type { Language } from '../../content/types.js';

export function LanguageTable({ languages }: { languages: Language[] }) {
  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">Languages and proficiency</caption>
      <tbody>
        {languages.map((language) => (
          <tr key={language.name} className="border-b border-line last:border-b-0">
            <th scope="row" className="py-1.5 pr-3 text-body font-normal text-fg">
              {language.name}
            </th>
            <td className="py-1.5 pr-3">
              <Data tone="fg">{language.level}</Data>
            </td>
            <td className="py-1.5 text-right">
              {language.note ? <Data tone="measured">{language.note}</Data> : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
