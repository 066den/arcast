'use client'

import { useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { toast } from 'sonner'
import { createClient, updateClient } from '@/lib/api'
import { Textarea } from '../ui/textarea'
import ImageEditable from '../ui/ImageEditable'
import { ASPECT_RATIOS } from '@/lib/constants'
import { deleteClientImage, uploadClientImage } from '@/lib/api'

import type { ClientRow as ClientRowBase } from '@/types/admin'
type FormClient = Partial<ClientRowBase> & { id?: string }

export default function ClientForm({
  initial,
  onSaved,
}: {
  initial?: Partial<ClientRowBase>
  onSaved?: (c: ClientRowBase) => void
}) {
  const [form, setForm] = useState<FormClient>({ featured: false, ...initial })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const payload = {
        name: form.name ?? '',
        jobTitle: form.jobTitle ?? '',
        showTitle: form.showTitle ?? '',
        testimonial: form.testimonial ?? '',
        featured: Boolean(form.featured),
        imageUrl: form.imageUrl ?? '',
      }
      const saved = form.id
        ? await updateClient(form.id, payload)
        : await createClient(payload)
      toast.success('Client saved')
      onSaved?.(saved)
    } catch {
      toast.error('Failed to save client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label size="default" htmlFor="name">
            Name
          </Label>
          <Input
            id="name"
            value={form.name ?? ''}
            onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label size="default" htmlFor="jobTitle">
            Job Title
          </Label>
          <Input
            id="jobTitle"
            value={form.jobTitle ?? ''}
            onChange={e => setForm(s => ({ ...s, jobTitle: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label size="default" htmlFor="showTitle">
            Show Title
          </Label>
          <Input
            id="showTitle"
            value={form.showTitle ?? ''}
            onChange={e => setForm(s => ({ ...s, showTitle: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label size="default">Image</Label>
          <div className="flex items-start gap-4">
            <ImageEditable
              src={form.imageUrl || undefined}
              onUpload={async (file: File) => {
                try {
                  if (form.id) {
                    const res = (await uploadClientImage(form.id, file)) as {
                      imageUrl: string
                    }
                    setForm(s => ({ ...s, imageUrl: res.imageUrl }))
                    toast.success('Image uploaded')
                  } else {
                    toast.message('Save client first to upload image')
                  }
                } catch {
                  toast.error('Failed to upload image')
                }
              }}
              aspectRatio={ASPECT_RATIOS.SQUARE}
              showCrop
              size="small"
            />
            {form.imageUrl && form.id && (
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  try {
                    await deleteClientImage(form.id!)
                    setForm(s => ({ ...s, imageUrl: '' }))
                    toast.success('Image removed')
                  } catch {
                    toast.error('Failed to remove image')
                  }
                }}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label size="default" htmlFor="testimonial">
            Testimonial
          </Label>
          <Textarea
            id="testimonial"
            value={form.testimonial ?? ''}
            onChange={e =>
              setForm(s => ({ ...s, testimonial: e.target.value }))
            }
            rows={4}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={Boolean(form.featured)}
          onCheckedChange={v => setForm(s => ({ ...s, featured: Boolean(v) }))}
        />
        <Label size="default">Featured</Label>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
