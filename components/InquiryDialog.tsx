'use client'

import type { InquiryKind } from '../data/schemas'
import InquiryForm from './InquiryForm'
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
      <DialogTrigger className='inline-flex w-full cursor-pointer items-center justify-center border-2 border-black bg-black px-6 py-4 text-center font-sans text-sm font-black tracking-tight text-white uppercase transition-colors hover:bg-black/80 active:bg-black/70'>
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-y-auto border-2 border-black'>
        <DialogHeader>
          <DialogTitle className='font-sans font-black uppercase'>
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <InquiryForm kind={kind} item={item} submitLabel={submitLabel} />
      </DialogContent>
    </Dialog>
  )
}
