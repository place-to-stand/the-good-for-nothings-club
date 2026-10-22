import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { PageShellSection } from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import { ProductGrid } from '@/components/shop/ProductCard'
import ProductDescription from '@/components/shop/ProductDescription'
import ProductDetail from '@/components/shop/ProductDetail'
import ShopFallback from '@/components/shop/ShopFallback'
import {
  getProduct,
  getProductRecommendations,
  getProducts,
} from '@/lib/shopify'
import { shopPaths } from '@/lib/shopify/format'
import {
  breadcrumbJsonLd,
  productJsonLd,
  productMetadata,
} from '@/lib/shopify/metadata'

export const ensureStatic = 'navigation'

/** Placeholder so the list is never empty (Cache Components needs one). */
const NO_PRODUCTS = '__no-products'

export async function generateStaticParams() {
  const products = await getProducts().catch(() => [])
  return products.length
    ? products.map(p => ({ handle: p.handle }))
    : [{ handle: NO_PRODUCTS }]
}

type Props = PageProps<'/shop/products/[handle]'>

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { handle } = await props.params
  const product = handle === NO_PRODUCTS ? null : await getProduct(handle)
  if (!product) notFound()
  return productMetadata(product, parent)
}

export default function ProductPage(props: Props) {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ProductContent params={props.params} />
    </Suspense>
  )
}

async function ProductContent({ params }: Pick<Props, 'params'>) {
  const { handle } = await params
  const product = handle === NO_PRODUCTS ? null : await getProduct(handle)
  if (!product) notFound()

  const recommendations = await getProductRecommendations(product.id).catch(
    () => ({ intent: 'RELATED' as const, products: [] })
  )

  return (
    <main>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            productJsonLd(product),
            breadcrumbJsonLd([
              { name: product.title, path: shopPaths.product(product.handle) },
            ]),
          ]).replace(/</g, '\\u003c'),
        }}
      />
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <ProductDetail product={product}>
            {product.descriptionHtml && (
              <ProductDescription
                html={product.descriptionHtml}
                className='mt-6'
              />
            )}
          </ProductDetail>
        </div>
      </section>

      {recommendations.products.length > 0 && (
        <PageShellSection>
          <SectionHeading
            title={
              recommendations.intent === 'COMPLEMENTARY'
                ? 'Goes well with'
                : 'You might also like'
            }
            className='mt-0 md:mt-0'
          />
          <ProductGrid products={recommendations.products} className='mt-6' />
        </PageShellSection>
      )}
    </main>
  )
}
