import { useEffect } from 'react';
import { domainById, skillById } from '../lib/catalogue.js';
import { useI18n } from '../lib/i18n.jsx';

export function Chip({ on, children, className = '', ...rest }) {
  const Tag = rest.onClick ? 'button' : 'span';
  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm whitespace-nowrap transition ${
        on ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 bg-white text-slate-700'
      } ${rest.onClick ? 'active:scale-95' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function SkillChips({ ids, max = 99 }) {
  const { tn } = useI18n();
  const list = ids.filter((id) => skillById[id]);
  return (
    <>
      {list.slice(0, max).map((id) => {
        const s = skillById[id];
        return (
          <Chip key={id} className="!px-2 !py-0.5 !text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: domainById[s.domain].color }} />
            {tn(s.name)}
          </Chip>
        );
      })}
      {list.length > max && <Chip className="!px-2 !py-0.5 !text-xs">+{list.length - max}</Chip>}
    </>
  );
}

export function Btn({ variant = 'default', className = '', ...rest }) {
  const styles = {
    default: 'bg-white border border-slate-200 text-slate-700',
    primary: 'bg-brand-500 text-white shadow-sm shadow-brand-200',
    danger: 'bg-white border border-red-200 text-red-600',
    on: 'bg-brand-500 text-white border border-brand-500',
  };
  return (
    <button
      type="button"
      className={`rounded-xl px-4 py-2 font-semibold transition active:scale-95 disabled:opacity-40 ${styles[variant]} ${className}`}
      {...rest}
    />
  );
}

export function Badge({ warn, children }) {
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${warn ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
      {children}
    </span>
  );
}

export function Card({ className = '', as: Tag = 'div', ...rest }) {
  return <Tag className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 ${className}`} {...rest} />;
}

export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-slate-600">
      {label}
      {children}
    </label>
  );
}

export const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base font-normal text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';

// Bottom sheet on phones, centred dialog on wide screens.
export function Sheet({ onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="pb-safe max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-slate-50 p-5 shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function SectionLabel({ children }) {
  return <div className="mb-2 mt-1 text-sm font-semibold text-slate-500">{children}</div>;
}

export const enjoyEmoji = (e) => ['', '😐', '🙂', '😍'][e] || '';

export function ToyPic({ toy, className = 'text-4xl' }) {
  if (toy.photo) return <img src={toy.photo} alt="" className="h-full w-full object-cover" />;
  return <span className={className}>{toy.emoji || '🎁'}</span>;
}
