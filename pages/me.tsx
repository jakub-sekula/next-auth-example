import { getSession, useSession } from "next-auth/react"
import Layout from "../components/layout"

export default function MePage({session, restaurants}) {
  const {data} = useSession()

  console.log(session)

  return (
    <Layout>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <pre>{JSON.stringify(restaurants, null, 2)}</pre>
    </Layout>
  )
}

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx)

  console.log(ctx.session)

  const headers = new Headers({'Authorization': `Bearer ${session?.jwt}` })
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants`,{headers})


  const {data: restaurants} = await res.json() || {}


  return {
    props: {session, restaurants}
  }
}