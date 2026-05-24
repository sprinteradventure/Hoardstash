import { redirect } from 'next/navigation'

// Map URL slugs back to category names
const categoryMap: Record<string, string> = {
  'yarn-&-thread': 'Yarn & Thread',
  'yarn-thread': 'Yarn & Thread',
  'fabric-&-textiles': 'Fabric & Textiles',
  'fabric-textiles': 'Fabric & Textiles',
  'paints-&-inks': 'Paints & Inks',
  'paints-inks': 'Paints & Inks',
  'drawing-&-illustration': 'Drawing & Illustration',
  'drawing-illustration': 'Drawing & Illustration',
  'sewing-&-needlecraft': 'Sewing & Needlecraft',
  'sewing-needlecraft': 'Sewing & Needlecraft',
  'books-&-patterns': 'Books & Patterns',
  'books-patterns': 'Books & Patterns',
  'beads-&-embellishments': 'Beads & Embellishments',
  'beads-embellishments': 'Beads & Embellishments',
  'clay-&-sculpting': 'Clay & Sculpting',
  'clay-sculpting': 'Clay & Sculpting',
  'jewelry-making': 'Jewelry Making',
  'paper-crafts': 'Paper Crafts',
  'tools-&-equipment': 'Tools & Equipment',
  'tools-equipment': 'Tools & Equipment',
  'candle-making': 'Candle Making',
  'soap-making': 'Soap Making',
  'woodworking': 'Woodworking',
  'scrapbooking': 'Scrapbooking',
  'printmaking': 'Printmaking',
  'party-supplies': 'Party Supplies',
  'costumes': 'Costumes',
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = categoryMap[params.slug.toLowerCase()]
  
  if (category) {
    redirect(`/browse?category=${encodeURIComponent(category)}`)
  }
  
  // Unknown category — redirect to browse
  redirect('/browse')
}
