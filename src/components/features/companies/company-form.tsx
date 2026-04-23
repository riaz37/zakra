'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface CompanyFormData {
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive' | 'suspended';
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface CompanyFormProps {
  initial?: Partial<CompanyFormData>;
  onSubmit: (data: CompanyFormData) => void;
  isPending: boolean;
  onCancel: () => void;
  submitLabel?: string;
}

export function CompanyForm({
  initial,
  onSubmit,
  isPending,
  onCancel,
  submitLabel = 'Create Company',
}: CompanyFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<'active' | 'inactive' | 'suspended'>(
    initial?.status ?? 'active',
  );
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
      setNameError('Company name is required.');
      return;
    }
    onSubmit({ name: name.trim(), slug: slug || slugify(name), description, status });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company-name">Name *</Label>
        <Input
          id="company-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Acme Corp"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'company-name-error' : undefined}
        />
        {nameError ? (
          <p id="company-name-error" className="font-sans text-[12px] text-error">{nameError}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company-slug">Slug</Label>
        <Input
          id="company-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="acme-corp"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company-status">Status</Label>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as typeof status)}
        >
          <SelectTrigger id="company-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company-description">Description</Label>
        <Input
          id="company-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
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
