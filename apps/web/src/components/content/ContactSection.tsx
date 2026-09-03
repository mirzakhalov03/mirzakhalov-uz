import { useState } from 'react';
import { contactInputSchema } from '@portfolio/shared';
import { Data } from '../../primitives/Data.js';
import { Button } from '../ui/Button.js';
import { Field } from '../ui/Field.js';
import { Signature } from '../ui/Signature.js';
import { socials } from '../../content/profile.js';

type Errors = Partial<Record<'name' | 'message', string>>;

/**
 * Two columns: the form, and the channels as a plain mono list — one weight,
 * one rule, no gradients, because a link to Telegram and a link to GitHub are
 * not different kinds of thing (§4.7).
 *
 * Validation runs against the same Zod schema the Express route will use, which
 * is the entire point of packages/shared. Delivery is not wired up yet, and the
 * confirmation copy says so rather than claiming a message was sent.
 */
export function ContactSection() {
  const [values, setValues] = useState({ name: '', message: '', website: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [signed, setSigned] = useState(false);

  const set = (key: keyof typeof values) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const validate = () => {
    const result = contactInputSchema.safeParse(values);
    if (result.success) return {};
    const next: Errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === 'name') next.name = 'Add your name so I know who I am replying to.';
      if (field === 'message') next.message = 'Write at least a sentence — ten characters or more.';
    }
    return next;
  };

  if (signed) {
    return (
      <div className="border border-line p-3">
        <Signature caption="Signed. Delivery arrives with the API." />
        <button
          type="button"
          onClick={() => {
            setSigned(false);
            setValues({ name: '', message: '', website: '' });
          }}
          className="mt-2"
        >
          <Data tone="accent">Write another</Data>
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:gap-8">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const found = validate();
          setErrors(found);
          if (Object.keys(found).length === 0) setSigned(true);
        }}
        className="flex flex-col gap-3"
      >
        <Field
          id="contact-name"
          name="name"
          label="Your name"
          value={values.name}
          onChange={set('name')}
          onBlur={() => setErrors(validate())}
          error={errors.name}
          autoComplete="name"
        />

        <Field
          id="contact-message"
          name="message"
          label="Message"
          multiline
          rows={5}
          value={values.message}
          onChange={set('message')}
          onBlur={() => setErrors(validate())}
          error={errors.message}
        />

        {/* Honeypot. A person never sees it; a bot always fills it. */}
        <div aria-hidden="true" className="absolute -left-[9999px]">
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={set('website')}
          />
        </div>

        <Button type="submit" className="self-start">
          Transmit
        </Button>
      </form>

      <div>
        <Data tone="accent">Channels</Data>
        <ul className="mt-2">
          {socials.map((social) => (
            <li key={social.label} className="border-b border-line last:border-b-0">
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline justify-between gap-3 py-2 transition-colors duration-[160ms] hover:text-accent-text"
              >
                <Data tone="fg">{social.label}</Data>
                <span className="truncate text-body text-fg-muted group-hover:text-accent-text">
                  {social.handle}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
