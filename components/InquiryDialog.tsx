'use client'

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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className=''>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-hidden border-2 border-black p-0'>
        <div className='grid max-h-[calc(90vh-4px)] gap-4 overflow-y-auto p-6'>
          <DialogHeader>
            <DialogTitle className='font-sans font-black uppercase'>
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <InquiryForm
            defaultKind={kind}
            defaultItem={item}
            submitLabel={submitLabel}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
