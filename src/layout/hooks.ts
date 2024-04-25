import { useRouter } from 'vue-router'

export const useGoTo = () => {
  const router = useRouter()
  return (name: string, query?: any) => {
    router.push({
      name,
      query,
    })
  }
}
