import { unified } from "unified"
import remarkParse from "remark-parse"
import { visit } from "unist-util-visit"
import { toString } from "mdast-util-to-string"

export type Heading = {
  id: string
  text: string
  level: number
}

export async function extractHeadings(mdxRaw: string): Promise<Heading[]> {
  const tree = unified().use(remarkParse).parse(mdxRaw)

  const headings: Heading[] = []

  visit(tree, "heading", (node: any) => {
    const text = toString(node)
    if (!text) return

    const id = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/^-+|-+$/g, "")

    headings.push({
      id,
      text,
      level: node.depth,
    })
  })

  return headings
}