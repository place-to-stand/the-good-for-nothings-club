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
        <Button className='w-full'>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-y-auto border-2 border-black'>
        <DialogHeader>
          <DialogTitle className='font-sans font-black uppercase'>
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <InquiryForm
          defaultKind={kind}
          defaultItem={item}
          submitLabel={submitLabel}
        />
      </DialogContent>
    </Dialog>
  )
}
