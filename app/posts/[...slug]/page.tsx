import { notFound } from "next/navigation"
import { allPosts } from "contentlayer/generated"
import { Metadata } from "next"
import { Mdx } from "@/components/mdx-components"
import { extractHeadings } from "@/lib/toc"
import TableOfContents from "@/components/TableOfContents"

interface PostProps {
  params: {
    slug: string[]
  }
}

async function getPostFromParams(params: PostProps["params"]) {
  const slug = params?.slug?.join("/")
  const post = allPosts.find((post) => post.slugAsParams === slug)
  return post ?? null
}

export async function generateMetadata({
  params,
}: PostProps): Promise<Metadata> {
  const post = await getPostFromParams(params)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
  }
}

export async function generateStaticParams(): Promise<PostProps["params"][]> {
  return allPosts.map((post) => ({
    slug: post.slugAsParams.split("/"),
  }))
}

export default async function PostPage({ params }: PostProps) {
  const post = await getPostFromParams(params)

  if (!post) notFound()

  const headings = await extractHeadings(post.body.raw)

  return (
    <div className="mx-auto grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-12 max-w-6xl px-4 py-12">
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="mb-2">{post.title}</h1>
        {post.description && (
          <p className="mt-0 text-xl text-slate-700 dark:text-slate-200">
            {post.description}
          </p>
        )}
        <hr className="my-4" />
        <Mdx code={post.body.code} />
      </article>

      {/* ToC Sidebar */}
      {headings.length > 0 && <TableOfContents headings={headings} />}
    </div>
  )
}