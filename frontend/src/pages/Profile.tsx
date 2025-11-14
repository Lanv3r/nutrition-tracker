

type ProfileProps = { userId: number }

export default function Profile({ userId }: ProfileProps) {
	return (
		<main>
			<div>Profile page for user {userId}</div>
		</main>
	)
}