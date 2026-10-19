/**
 * Sends a copy of a product photo flying into the cart icon, so shoppers
 * see where their item went. The cart badge pops when the count changes.
 * Returns false when it didn't fly (reduced motion, no photo), so the
 * caller can open the cart instead.
 */
export function flyToCart(from: Element | null): boolean {
  if (!from || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return false
  // Given a card or frame, use whichever photo inside it is showing.
  const photo =
    from instanceof HTMLImageElement
      ? from
      : [...from.querySelectorAll('img')]
          .reverse()
          .find(img => getComputedStyle(img).opacity !== '0')
  if (!photo) return false

  // The cart icon on screen right now: the shop bar's (mobile or desktop)
  // or the floating one, whichever is showing.
  const target = [
    ...document.querySelectorAll<HTMLElement>('[data-cart-target]'),
  ].find(el => {
    const r = el.getBoundingClientRect()
    return (
      r.width > 0 &&
      r.bottom > 0 &&
      r.top < window.innerHeight &&
      // The floating cart marks itself hidden while it's slid away. (Not
      // closest(): an open dialog marks the rest of the page hidden too.)
      el.getAttribute('aria-hidden') !== 'true'
    )
  })
  const box = photo.getBoundingClientRect()
  // With no cart icon on screen (scrolled past the shop bar, cart still
  // empty), land where the floating cart springs in.
  const to = target?.getBoundingClientRect() ?? floatingCartSpot()
  const size = Math.min(box.width, box.height)
  const end = 28
  const scale = end / size

  const ghost = document.createElement('div')
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${box.left + (box.width - size) / 2}px`,
    top: `${box.top + (box.height - size) / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: `url("${photo.currentSrc || photo.src}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: 'white',
    border: '2px solid black',
    zIndex: '60',
    pointerEvents: 'none',
    transformOrigin: '0 0',
  })
  document.body.append(ghost)

  const dx = to.left + to.width / 2 - end / 2 - parseFloat(ghost.style.left)
  const dy = to.top + to.height / 2 - end / 2 - parseFloat(ghost.style.top)

  // Lift a little first, then drop into the bag.
  const flight = ghost.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      {
        transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 60}px) scale(${0.45})`,
        opacity: 1,
        offset: 0.45,
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
        opacity: 0.4,
      },
    ],
    { duration: 750, easing: 'cubic-bezier(0.55, 0, 0.35, 1)' }
  )
  flight.onfinish = () => {
    ghost.remove()
    target?.animate([{ scale: '1' }, { scale: '1.18' }, { scale: '1' }], {
      duration: 380,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    })
  }
  flight.oncancel = () => ghost.remove()
  return true
}

/** Where FloatingCart sits: 64px square, 16px in (32px from md up). */
function floatingCartSpot() {
  const inset = window.matchMedia('(min-width: 768px)').matches ? 32 : 16
  const size = 64
  const left = document.documentElement.clientWidth - inset - size
  const top = window.innerHeight - inset - size
  return { left, top, width: size, height: size }
}
