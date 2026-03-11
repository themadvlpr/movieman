import SignInButtons from '@/components/ui/SignInButtons/SignInButtons'
import { X } from 'lucide-react'

export default function AuthControlPanel({
	handleClose,
}: {
	handleClose: () => void
}) {
	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'
			onClick={handleClose}
		>
			<div
				className='relative w-full max-w-100 mx-4 bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl'
				onClick={event => event.stopPropagation()}
			>
				<button
					onClick={handleClose}
					className='absolute right-3 top-3.5 text-zinc-500 hover:text-white transition-colors'
				>
					<X size={20} className='cursor-pointer' />
				</button>

				<div
					role='group'
					aria-labelledby='header-signin-title'
					className='flex flex-col gap-4 items-center'
				>
					<h2
						id='header-signin-title'
						className='text-center text-lg font-semibold text-zinc-50'
					>
						Sign in with:
					</h2>
					<SignInButtons />
				</div>
			</div>
		</div>
	)
}
