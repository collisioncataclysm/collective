import { supabase } from "@/lib/supabaseClient";
import { useQuery, QueryClient, dehydrate } from '@tanstack/react-query'
import { Mainframe } from '@/blocks/Mainframe'
import Toprow from '@/blocks/Toprow'
import Body from '@/blocks/Body'
import Affiliations from '@/blocks/Affiliations'
import { generateStack } from '@/blocks/Stack'

const fetchUser = async (user) => {
    const { data, error } = await supabase
        .from('profile')
        .select()
        .eq('s_preferred_handle', user)
        .single()

    if (error) {
        console.log(error)
        throw new Error(error, "Error fetching this user")
    }

    if (!data) {
        throw new Error("No such user in the database")
    }

    if (data && data['wp_blog_root_url'] && data['wp_blog_author_id']) {
        const res_wp = await fetch(`${data['wp_blog_root_url']}/wp-json/wp/v2/posts?per_page=5&author=${data['wp_blog_author_id']}&categories=4&5`);
        const wp_data = await res_wp.json();
        data['wp'] = wp_data
    }
    return data
}

const useUser = (user) => {
    return useQuery(['user'], () => fetchUser(user))
}

export async function getStaticProps() {
    // Access the client
    // const queryClient = useQueryClient()
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['user'],
        queryFn: () => fetchUser('samuel'),
    })

    return {
        props: {
            dehydratedState: dehydrate(queryClient)
        }
    }
}

const Profile = () => {

    const { isLoading, isError, data, error } = useUser('samuel')

    console.log("data", data)
    // return <p>{JSON.stringify(data)}</p>

    return (
        <Mainframe data={data}>
            <Toprow>
                Hire me to work on your analytics backend, <b>operationlize</b> your data science models,
                or architect your <b>end-to-end machine learning pipelines.</b>
            </Toprow>
            <Body stack={generateStack(data.stack)} affiliations={<Affiliations />}>
                {/* <p>{JSON.stringify(data)}</p> */}
            </Body>
        </Mainframe>
    )
}

export default Profile