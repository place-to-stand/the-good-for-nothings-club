'use client'

import { captureEvent } from '../lib/analytics'
import { useAutoOpenDialog } from '../lib/useAutoOpenDialog'
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
  /** Opens this dialog on load when the URL has ?inquire=<autoOpenId>. */
  autoOpenId?: string
}

/** The membership application in a popup, prefilled from the launching offer. */
export default function MembershipApplicationDialog({
  triggerLabel,
  title,
  description,
  defaultTier,
  defaultOffering,
  autoOpenId,
}: MembershipApplicationDialogProps) {
  const [open, setOpen] = useAutoOpenDialog(autoOpenId, () =>
    captureEvent('membership_application_opened', {
      tier: defaultTier,
      offering: defaultOffering,
      source: 'url',
    })
  )

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen)
        if (nextOpen) {
          captureEvent('membership_application_opened', {
            tier: defaultTier,
            offering: defaultOffering,
          })
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className=''>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-hidden border-2 border-black p-0 sm:max-w-xl'>
        <div className='grid max-h-[calc(90vh-4px)] gap-4 overflow-y-auto p-6'>
          <DialogHeader>
            <DialogTitle className='font-sans font-black uppercase'>
              {title + ' Application'}
            </DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <MembershipApplicationForm
            defaultTier={defaultTier}
            defaultOffering={defaultOffering}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
