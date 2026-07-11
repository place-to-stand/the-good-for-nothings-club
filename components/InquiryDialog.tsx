'use client'

import { useState } from 'react'

import { events } from '../data/events'
import type { InquiryKind } from '../data/schemas'
import InquiryForm from './InquiryForm'
import { Button } from './ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

type InquiryDialogProps = {
  kind: InquiryKind
  item: string
  triggerLabel: string
  title: string
  description?: string
  submitLabel?: string
}

export default function InquiryDialog({
  kind,
  item,
  triggerLabel,
  title,
  description,
  submitLabel,
}: InquiryDialogProps) {
  const [selection, setSelection] = useState({ kind, item })

  // Keep the header in sync when the Regarding dropdown changes.
  const displayTitle =
    selection.kind === 'service'
      ? selection.item
      : selection.kind === 'event'
        ? `RSVP - ${selection.item}`
        : title
  const selectedEvent =
    selection.kind === 'event'
      ? events.find(event => event.name === selection.item)
      : undefined
  const displayDescription = selectedEvent
    ? `${selectedEvent.schedule} at the clubhouse.`
    : selection.kind === kind && selection.item === item
      ? description
      : undefined

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className=''>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-hidden border-2 border-black p-0'>
        <div className='grid max-h-[calc(90vh-4px)] gap-4 overflow-y-auto p-6'>
          <DialogHeader>
            <DialogTitle className='font-sans font-black uppercase'>
              {displayTitle}
            </DialogTitle>
            {displayDescription && (
              <DialogDescription>{displayDescription}</DialogDescription>
            )}
          </DialogHeader>
          <InquiryForm
            defaultKind={kind}
            defaultItem={item}
            submitLabel={submitLabel}
            onSelectionChange={setSelection}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
