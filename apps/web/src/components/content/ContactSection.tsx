import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { contactInputSchema, type ContactInput, type ContactResponse } from '@portfolio/shared';
import { Data } from '../../primitives/Data.js';
import { Button } from '../ui/Button.js';
import { Emoji } from '../ui/Emoji.js';
import { Field } from '../ui/Field.js';
import { api, ApiRequestError } from '../../lib/api.js';

type FieldName = 'name' | 'email' | 'message';
type Errors = Partial<Record<FieldName, string>>;

const EMPTY = { name: '', email: '', message: '', website: '' };

/** Remedies, not rules — what to do, said at the field (§4.7). */
const REMEDY: Record<FieldName, string> = {
  name: 'Add your name so I know who I am replying to.',
  email: 'That email doesn’t look right — or leave it empty.',
  message: 'Write at least a sentence — ten characters or more.',
};

/** Email is optional, so a blank one is left out rather than sent as "". */
const toPayload = (values: typeof EMPTY): ContactInput => ({
  name: values.name,
  message: values.message,
  website: values.website,
  ...(values.email.trim() && { email: values.email.trim() }),
});

function validate(values: typeof EMPTY): Errors {
  const result = contactInputSchema.safeParse(toPayload(values));
  if (result.success) return {};
  const next: Errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as FieldName;
    if (field in REMEDY) next[field] = REMEDY[field];
  }
  return next;
}

/** What replaces the form once a message is through. */
function Sent({ onReset }: { onReset: () => void }) {
  return (
    <div role="status" className="flex flex-col items-start gap-2 border border-line p-3">
      <span className="flex gap-1">
        <Emoji name="grin" className="size-6" />
        <Emoji name="ok" className="size-6" />
      </span>
      <p className="t-h4 text-fg">Thank you for your message, I will get back to you soon.</p>
      <button type="button" onClick={onReset} className="mt-1">
        <Data tone="accent">Write another →</Data>
      </button>
    </div>
  );
}

/**
 * The form alone. The channels — Telegram, email, GitHub, LinkedIn — live in
 * the footer directly beneath, so listing them here too would say it twice.
 * Held to a reading width: a textarea stretched across the full sheet makes
 * every line of a message a long trip for the eye.
 *
 * Validation runs against the same Zod schema the Express route uses, which is
 * the entire point of packages/shared. The server relays to Telegram; its
 * field errors, if any, land on the same fields as the client's.
 */
export function ContactSection() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const send = useMutation({
    mutationFn: (input: ContactInput) => api.post<ContactResponse>('/contact', input),
    onError: (err) => {
      if (err instanceof ApiRequestError && err.fields) setErrors(err.fields as Errors);
    },
  });

  const set = (key: keyof typeof values) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const recheck = () => setErrors(validate(values));

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    send.reset();
  };

  // Field errors render at their field; this is for everything else —
  // rate limiting, the network, a server that is down.
  const formError =
    send.error && !(send.error instanceof ApiRequestError && send.error.fields)
      ? send.error instanceof ApiRequestError && send.error.status === 429
        ? 'That’s a lot of messages in an hour — try again a little later.'
        : 'Couldn’t send that just now. Try again, or write to me on Telegram.'
      : null;

  return (
    <div className="max-w-[48rem]">
      {send.isSuccess ? (
        <Sent onReset={reset} />
      ) : (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const found = validate(values);
            setErrors(found);
            if (Object.keys(found).length === 0) send.mutate(toPayload(values));
          }}
          className="flex flex-col gap-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              id="contact-name"
              name="name"
              label="Your name"
              placeholder="Aziz Karimov"
              value={values.name}
              onChange={set('name')}
              onBlur={recheck}
              error={errors.name}
              autoComplete="name"
            />
            <Field
              id="contact-email"
              name="email"
              type="email"
              label="Email (optional)"
              placeholder="you@example.com"
              value={values.email}
              onChange={set('email')}
              onBlur={recheck}
              error={errors.email}
              autoComplete="email"
            />
          </div>

          <Field
            id="contact-message"
            name="message"
            label="Message"
            placeholder="A project, an idea, a book you loved — or just say hi."
            multiline
            rows={5}
            value={values.message}
            onChange={set('message')}
            onBlur={recheck}
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

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={send.isPending} className="disabled:opacity-60">
              {send.isPending ? 'Sending…' : 'Send'}
            </Button>
            {formError ? (
              <Data role="alert" tone="fg" className="text-danger">
                {formError}
              </Data>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
