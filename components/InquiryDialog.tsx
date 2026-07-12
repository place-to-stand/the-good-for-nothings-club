'use client'

import { useState } from 'react'

import { events, formatOccurrenceLong } from '../data/events'
import type { InquiryKind } from '../data/schemas'
import InquiryForm, { type InquirySelection } from './InquiryForm'
import { Button, type ButtonProps } from './ui/Button'
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
  /** For event RSVPs: preselect this occurrence (YYYY-MM-DD). */
  occurrenceDate?: string
  triggerLabel: string
  triggerVariant?: ButtonProps['variant']
  triggerSize?: ButtonProps['size']
  triggerClassName?: string
  title: string
  description?: string
  submitLabel?: string
}

export default function InquiryDialog({
  kind,
  item,
  occurrenceDate,
  triggerLabel,
  triggerVariant,
  triggerSize,
  triggerClassName,
  title,
  description,
  submitLabel,
}: InquiryDialogProps) {
  const [selection, setSelection] = useState<InquirySelection>({
    kind,
    item,
    occurrenceDate,
  })

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
  const displayDescription =
    selectedEvent && selection.occurrenceDate
      ? `${formatOccurrenceLong(selection.occurrenceDate, selectedEvent.time)} at the clubhouse.`
      : selectedEvent
        ? `${selectedEvent.schedule} at the clubhouse.`
        : description

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
        >
          {triggerLabel}
        </Button>
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
            defaultOccurrenceDate={occurrenceDate}
            submitLabel={submitLabel}
            onSelectionChange={setSelection}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
