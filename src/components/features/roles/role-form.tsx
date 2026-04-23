'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface RoleFormData {
  name: string;
  slug: string;
  description: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface RoleFormProps {
  initial?: Partial<RoleFormData>;
  onSubmit: (data: RoleFormData) => void;
  isPending: boolean;
  onCancel: () => void;
  submitLabel?: string;
}

export function RoleForm({
  initial,
  onSubmit,
  isPending,
  onCancel,
  submitLabel = 'Create Role',
}: RoleFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [nameError, setNameError] = useState('');

  function handleNameChange(value: string) {
    setName(value);
    if (!initial?.slug) {
      setSlug(slugify(value));
    }
    if (nameError && value.trim()) setNameError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Role name is required.');
      return;
    }
    onSubmit({ name: name.trim(), slug: slug || slugify(name), description });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role-name">Name *</Label>
        <Input
          id="role-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Data Viewer"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'role-name-error' : undefined}
        />
        {nameError ? (
          <p id="role-name-error" className="font-sans text-[12px] text-error">{nameError}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role-slug">Slug</Label>
        <Input
          id="role-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="data-viewer"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role-description">Description</Label>
        <Input
          id="role-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description of this role's permissions"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-300 px-4 py-2 font-sans text-[14px] text-foreground transition-colors hover:bg-surface-400 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 font-sans text-[14px] font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
