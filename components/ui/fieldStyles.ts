/** Shared field styling for the club's forms. */

/** Native selects on the same rest/hover/focus ladder as Input. */
export const selectClassName =
  'bg-input/10 hover:border-input/30 focus-visible:border-input flex h-10 w-full cursor-pointer rounded-none border-2 border-transparent px-3 py-2 font-sans text-sm transition-colors focus-visible:outline-hidden'

/** Quieter than input text so section labels carry the hierarchy. */
export const fieldLabelClassName = 'text-sm font-semibold'

/**
 * Radios on the same rest/hover/focus ladder as Input. appearance-none
 * because the browser paints native radios, so border classes are ignored.
 * The checked dot is the black fill showing through an inset ring of
 * page background.
 */
export const radioClassName =
  'bg-input/10 hover:border-input/30 focus-visible:border-input h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-transparent transition-colors focus-visible:outline-hidden checked:border-black checked:bg-black checked:shadow-[inset_0_0_0_3px_var(--background)] checked:hover:border-black'
