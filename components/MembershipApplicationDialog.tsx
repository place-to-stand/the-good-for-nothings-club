'use client'

import MembershipApplicationForm from './MembershipApplicationForm'
import { Button } from './ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

type MembershipApplicationDialogProps = {
  triggerLabel: string
  title: string
  description?: string
  /** Preselected tier, e.g. "Member" from a monthly facility card. */
  defaultTier?: string
  /** Preselected offering; should belong to the tier's options. */
  defaultOffering?: string
}

/** The membership application in a popup, prefilled from the launching offer. */
export default function MembershipApplicationDialog({
  triggerLabel,
  title,
  description,
  defaultTier,
  defaultOffering,
}: MembershipApplicationDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='w-full'>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-y-auto border-2 border-black sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle className='font-sans font-black uppercase'>
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <MembershipApplicationForm
          defaultTier={defaultTier}
          defaultOffering={defaultOffering}
        />
      </DialogContent>
    </Dialog>
  )
}
